import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'

// Project Dependencies
import { AuthService } from './auth.service'
import { Project, Reading, User } from '../shared/datatypes'

interface FilterObj {
  type?: string
  grades?: number[]
  start?: string
  size?: string
}

@Injectable()
export class ReadingService {
  //set up thumbnail observables
  private readingValue: Reading = <Reading>{}
  // BehaviorSubjects push last value on subscribe
  private readingSource: BehaviorSubject<Reading> = new BehaviorSubject(this.readingValue)
  public currentReading: Observable<Reading> = this.readingSource.asObservable()

  // User's Readings observable
  private userReadingsSource = new BehaviorSubject<GetReadingsResponse>({})
  public currentUserReadings: Observable<any> = this.userReadingsSource.asObservable()

  private subscriptions: Subscription[] = []

  constructor(private http: Http, private _http: HttpClient, private _auth: AuthService) {
    this.subscriptions.push(
      /**
       * Clear held values when told by _auth
       */
      this._auth.clearAll.subscribe((clear: boolean) => {
        if (clear) {
          // Clear Reading
          this.clear()
          // Clear dashboard readings
          this.userReadingsSource.next({})
        }
      }),
    )
  }

  /**
   * Get all Created Readings for a user, paginated
   * @param filters object containing pagination values (to eventually include other filters)
   */
  public updateCreated(user: User, filters?: ReadingFilters): void {
    let feedParams = new HttpParams()
    // Set Pagination values
    if (filters) {
      if (filters.size) {
        feedParams = feedParams.append('size', filters.size.toString())
      }
      if (filters.start) {
        feedParams = feedParams.append('start', filters.start.toString())
      }
    }
    // Populate list of Projects user has created on Reading
    feedParams = feedParams.append('pop', 'projects')

    this._http
      .get(this._auth.getUrl() + '/api/v1/readings', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
        params: feedParams,
      })
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          if (data.readings && !user.hero_status && user.archive_readings_before) {
            let archivedBefore = new Date(user.archive_readings_before)
            let readings = data.readings.slice()
            let archivedTally: number = 0
            // Loop through readings and mark archived
            for (let i = 0; i < readings.length; i++) {
              /**
               * Readings are "archived" if:
               * - Updated date is prior to archived before date
               * - Readings before Hero v2 (01-01-2018) are "legacy" and not archived
               */
              let readingDate = new Date(readings[i].createdAt)
              if (readingDate < archivedBefore && readingDate >= new Date('2019-01-01')) {
                readings[i].archived = true
                archivedTally++
                // Limit number of archived shown to 2, and flag begin/end of archive
                if (archivedTally == 1) {
                  readings[i].archivedBegin = true
                } else if (archivedTally == 2) {
                  readings[i].archivedEnd = true
                } else if (archivedTally > 2) {
                  readings.splice(i, 1)
                  i--
                }
              }
            }
            //  Update return value
            data.readings = readings
          }
          this.userReadingsSource.next(data)
        },
        error => {
          this.userReadingsSource.error(error)
        },
      )
  } //getCreated()

  // Pull one reading by ID
  public get(id: string): Observable<any> {
    return this._http.get(this._auth.getUrl() + '/readings/' + id, this._auth.getOptions()).pipe(
      map((data: any) => {
        if (data) {
          this.setReadingObj(data)
        }
        return data
      }),
    )
  } // public get(id : string) : Observable<any>

  public search(queryString): Observable<any> {
    // let queryString = ''
    // let { term } = query

    // if (term) {
    //   queryString += 'title=' + term + '&html=' + term
    // }

    return this._http
      .get(this._auth.getUrl() + '/api/v1/readings/_search?' + queryString, this._auth.getOptions())
      .pipe(take(1))
  }

  public setReadingObj(reading: any): void {
    // console.log("Set", reading)
    if (reading._id) {
      this.readingValue = reading
      this.readingSource.next(this.readingValue)
    }
  }

  // Pull all versions of a particular reading
  public getAllVersions(versionId: string): void {
    this._http
      .get(this._auth.getUrl() + '/readings/versions/' + versionId, this._auth.getOptions())
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          if (data.readings) {
            data.filter = 'versions'
            // Extract first version title for filter value
            let firstVersion = data.readings[data.readings.length - 1]
            data.filterValue = firstVersion && firstVersion.title
            this.userReadingsSource.next(data)
          }
        },
        err => {
          this.userReadingsSource.error(err)
        },
      )
  } // public getAllVersions(versionId : string) : Observable<any>

  public clear(): void {
    this.readingValue = <Reading>{}
    this.readingSource.next(this.readingValue)
  } // public clear(): void

  /**
   * Deletes a reading from the collection, all projects for that reading, and all versions that are based on the said reading from their collections
   * @param deleteReading is the reading we're passing in to delete 
   */
  public delete(deleteReading: Reading): Observable<any> {
    // console.log("Deleting '" + targetReading.title)
    return this._http.delete(
      this._auth.getUrl() + `/api/v1/readings/${deleteReading._id}`, 
      this._auth.getOptions()
    ).pipe(
      map(value => {
        // Delete was successful
        let readingResponse = this.userReadingsSource.value
        readingResponse.readings.forEach(
          (reading, index) => {
            if (reading.version_count > 1) {
              // Reload content (slower but simpler)
              this.updateCreated(this._auth.getUser())
            } else if (reading._id == deleteReading._id) {
              // Single version readings we can remove instantly
              readingResponse.readings.splice(index, 1)
              readingResponse.total--
              this.userReadingsSource.next(readingResponse)
            }
          }, // (reading, index) =>
        ) // readings.forEach
        return value
      }),
    )
  }

  /**
   * Remove Project from service maintained list of Readings with nested Projects
   */
  public removeProject(targetProject: Project) {
    let readingRes = this.userReadingsSource.value

    readingRes.readings.forEach(reading => {
      reading.projects = reading.projects.filter(project => {
        return project._id != targetProject._id
      })
    })

    this.userReadingsSource.next(readingRes)
  }

  // Push new or update Reading
  public save(reading: any): Observable<any> {
    // DO NOT ADD OWNER_ID OR TEACHER_IDS
    // The server takes care of all of that by itself

    if (reading['_id']) {
      let putReading = {
        title: reading.title,
        words: reading.words,
        html: reading.html,
        source: reading.source,
        draft: reading.draft,
        questions: reading.questions,
        public: reading.public,
        subjects: reading.subjects,
        grade_levels: reading.grade_levels,
        owner_bookmarked: reading.owner_bookmarked,
        // We reset "createdAt" in New Reading when publishing a draft
        createdAt: reading.createdAt
      }

      return this._http
        .put(this._auth.getUrl() + '/readings/' + reading['_id'], { reading: putReading }, this._auth.getOptions())
        .pipe(
          map((data: any) => {
            if (data && data.reading) {
              this.readingValue = data.reading
              this.readingSource.next(this.readingValue)
            }
            return data.reading
          }),
        )
    } else {
      return this._http
        .post(this._auth.getUrl() + '/api/v1/readings', { reading: reading }, this._auth.getOptions())
        .pipe(
          map((data: any) => {
            if (data && data.reading) {
              this.readingValue = data.reading
              this.readingSource.next(this.readingValue)
            }
            return data.reading
          }),
        )
    }
  }

  public getFeed(filters?: FilterObj): Observable<any> {
    let feedParams = new HttpParams()
    if (filters && filters['grades']) {
      let grades = filters['grades']
      // filters['grades'].forEach( grade => { feedParams = feedParams.append("grades", grade + "")})
      feedParams = feedParams.append('grades', Math.min(...grades) + '')
      feedParams = feedParams.append('grades', Math.max(...grades) + '')
    }
    if (filters && filters['size']) {
      feedParams = feedParams.append('size', filters['size'])
    }
    if (filters && filters['start']) {
      feedParams = feedParams.append('start', filters['start'])
    }
    if (filters && filters['type']) {
      feedParams = feedParams.append('type', filters['type'])
    }
    feedParams = feedParams.append('populate', 'owner').append('populate', 'words_preview')

    //{{url}}/readings/feed?grades[]=1&grades[]=8&populate[]=words_preview&populate[]=owner&start=0
    return this._http.get(this._auth.getUrl() + '/readings/feed', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this._auth.getToken(),
      }),
      params: feedParams,
    })
  }

  /**
   * Gets all drafts for current user
   * @returns Observable returning array of readings, { readings: [ ]}
   */
  public getDrafts(): Observable<{ readings?: Reading[] }> {
    return this._http.get(this._auth.getUrl() + '/api/v1/readings/draft', { headers: this._auth.getHeaders() })
  }

  /**
   * Get all bookmarked readings for current user
   * @description Updates currentUserReadings with bookmarked readings
   */
  public getOwnerBookmarked(): void {
    this._http
      .get(this._auth.getUrl() + '/api/v1/readings/owner_bookmarked', {
        headers: this._auth.getHeaders(),
        params: new HttpParams().append('pop', 'projects'),
      })
      .pipe(take(1))
      .subscribe(
        data => {
          // Update currentUserReadings
          this.userReadingsSource.next(data)
        },
        error => {
          this.userReadingsSource.error(error)
        },
      )
  }
}

/**
 * /api/v1/readings Response
 */
interface GetReadingsResponse {
  readings?: Reading[]
  total?: number
}

interface ReadingFilters {
  size?: number
  start?: number
}

interface ReadingSearchResponse {
  total: number
  results: Reading
}
