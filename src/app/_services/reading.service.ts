import { Injectable } from '@angular/core'
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

  constructor(private _http: HttpClient, private _auth: AuthService) {
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
   * @deprecated 5/2/2019
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
          data.readings = this.verifyArchive(data.readings, user)
          this.userReadingsSource.next(data)
        },
        error => {
          this.userReadingsSource.error(error)
        },
      )
  }

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
  }

  /**
   * Utilizes Elastic search to find readings based on the queryString
   * @param queryString the query we're going to search with
   * @param user we handle search a bit different when we have a logged in user vs. the non-auth'd search
   */
  public search(queryString, user?: User): Observable<any> {
    return this._http
      .get(this._auth.getUrl() + '/api/v1/readings/_search?' + queryString, this._auth.getOptions())
      .pipe(
        map((data: any) => {
          if (data && user) {
            data.readings = this.verifyArchive(data.results, user)
            this.userReadingsSource.next(data)
          }
          return data
        }),
      )
  }

  /**
   * Returns an array of readings with archived flag if conditions are met
   * @param readings an array of readings from a search or api call
   * @param user current user
   */
  public verifyArchive(readingsArr: any, user: User): any {
    let readings = readingsArr.slice()
    if (readings && user && !user.hero_status && user.archive_readings_before) {
      let archivedBefore = new Date(user.archive_readings_before)
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
    }
    //  Update return value
    return readings
  }

  /**
   * Takes in filter settings and returns a query param string used to execute search
   * @param searchParams is our object that contains properties to build a proper query param string
   */
  public buildSearchParams(searchParams: ReadingQuery): string {
    // Construct search query
    let queryString = `from=${searchParams.first}`
    if (searchParams.searchTerm) {
      queryString += `&q=${searchParams.searchTerm}`
    }
    // Library
    if (searchParams.activeLibrary === 'following') {
      // Loop through and apply following ids
      let following = searchParams.following
      following.forEach(userId => {
        queryString += `&owner_id=${userId}`
      })
    } else if (searchParams.activeLibrary === 'strategies') {
      // strategies filter will hard-code to the edji strategies account
      const edjiStrategies = '5cc65d8d156b5300215670fe'
      queryString += `&owner_id=${edjiStrategies}`
    } else if (searchParams.activeLibrary === 'academy') {
      console.log('academy selected', searchParams.institutionId)
      queryString += `&institution_id=${searchParams.institutionId}`
    }
    // Subjects
    if (searchParams.subjectFilter && searchParams.subjectFilter[0]) {
      queryString += `&subjects=${searchParams.subjectFilter.join(' ')}`
    }
    // grade_levels_lte, grade_levels_gte
    if (searchParams.gradeMin > -1 && searchParams.gradeMax > -1) {
      queryString += `&grade_levels_gte=${searchParams.gradeMin}`
      queryString += `&grade_levels_lte=${searchParams.gradeMax}`
    }
    // owner bookmarked
    if (searchParams.createdCollection === 'bookmarked') {
      queryString += '&owner_bookmarked=true'
    }
    // owner-only readings
    if (searchParams.scope === 'owner') {
      queryString += '&scope=owner'
    }
    // district readings
    if (searchParams.district && searchParams.district.length > 0) {
      queryString += `&district_id=${searchParams.district}`
    }
    // Default to sort by most recent, unless using a search term
    if (!searchParams.searchTerm) {
      queryString += '&sort=createdAt&sort_order=desc'
    }
    // populate the projects
    if (searchParams.pop) {
      queryString += `&pop=${searchParams.pop}`
    }
    return queryString
  }

  /**
   * Returns whether a "w" word contains a style class
   * @param w Word object
   */
  public wHasStyle(w, style): boolean {
    return w && w.styles && w.styles.indexOf(style) > -1
  }

  public setReadingObj(reading: Reading): void {
    if (!reading._id) {
      return
    }
    // Decorate word objects
    let wordCount = reading.words.length
    for (let i = 0; i < wordCount; i++) {
      let w = reading.words[i]
      if (!w) {
        // spaces at one time were saved as 'null'
        w = {}
      }
      // Spaces
      if (!w.styles || this.wHasStyle(w, 'space')) {
        w.s = true
      }
      // Links - only apply if url is available!
      if (this.wHasStyle(w, 'a') && w.url) {
        w.a = true
        w.url = w.url.indexOf('//') > -1 ? w.url : '//' + w.url
      }
      // Images
      if (this.wHasStyle(w, 'img')) {
        w.img = true
      }
      // Questions
      if (this.wHasStyle(w, 'question')) {
        w.q = true
      }
      reading.words[i] = w
    }
    if (reading._id) {
      this.readingValue = reading
      this.readingSource.next(this.readingValue)
    }
    // Check for PDF words
    // if (reading.words && reading.words.length > 0) {
    //   for (let i = 0; i < reading.words.length; i++) {
    //     let word = reading.words[i]
    //     if (word.ocr) {
    //       this.getDataForPDF(word.ocr.id, word.ocr.page).then(boxes => {
    //         word.boxes = boxes
    //       })
    //     }
    //   }
    // }
    // console.log('Updated reading: ', reading)
    this.readingValue = reading
    this.readingSource.next(this.readingValue)
  }

  /**
   * @todo add pdf data type
   */
  public getDataForPDF(id: string, page: number): Promise<any> {
    /**
     * @todo where should we handle adding PDF data?
     * examples: pdf_article-parse.json, KyburzResume-parse.json, EdSurge-parse.json
     */

    return this._http
      .get('/assets/test-pdf/pdf_article-parse.json')
      .pipe(
        map(data => {
          let wordBoxes = []
          let pages = data['ParsedResults']
          let overlay = pages[page - 1] && pages[page - 1]['TextOverlay'] ? pages[page - 1]['TextOverlay'] : {}
          overlay['Lines'] &&
            overlay['Lines'].forEach((line: { Words: any; MaxHeight: any; MinTop: any }) => {
              wordBoxes = wordBoxes.concat(line.Words)
            })
          // WordText	Name:
          // Left	97
          // Top	97
          // Height	9
          // Width	38
          return wordBoxes
        }),
      )
      .toPromise()
    // .catch(err => {
    //   return { error: err }
    // })
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
  }

  public clear(): void {
    this.readingValue = <Reading>{}
    this.readingSource.next(this.readingValue)
  }

  /**
   * Deletes a reading from the collection, all projects for that reading, and all versions that are based on the said reading from their collections
   * @param deleteReading is the reading we're passing in to delete
   */
  public delete(deleteReading: Reading): Observable<any> {
    return this._http
      .delete(this._auth.getUrl() + `/api/v1/readings/${deleteReading._id}`, this._auth.getOptions())
      .pipe(
        map(value => {
          // Delete was successful
          let readingResponse = this.userReadingsSource.value
          readingResponse.readings.forEach((reading, index) => {
            if (reading.version_count > 1) {
              // Reload content (slower but simpler)
              this.updateCreated(this._auth.getUser())
            } else if (reading._id == deleteReading._id) {
              // Single version readings we can remove instantly
              readingResponse.readings.splice(index, 1)
              readingResponse.total--
              this.userReadingsSource.next(readingResponse)
            }
          })
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
  public save(reading: Reading): Observable<Reading> {
    // owner_id is defaulted by the service

    if (reading._id) {
      let putReading = {
        title: reading.title,
        words: reading.words,
        html: reading.html,
        source: reading.source,
        draft: reading.draft,
        questions: reading.questions,
        reading_type: reading.reading_type,
        subjects: reading.subjects,
        grade_levels: reading.grade_levels,
        default_instructions: reading.default_instructions,
        // We reset "createdAt" in New Reading when publishing a draft
        createdAt: reading.createdAt,
      }

      return this._http
        .put<{}>(this._auth.getUrl() + '/api/v1/readings/' + reading['_id'], putReading, this._auth.getOptions())
        .pipe(
          map(() => {
            this.readingValue = reading
            this.readingSource.next(this.readingValue)
            return this.readingValue
          }),
        )
    } else {
      return this._http
        .post<{ reading: Reading }>(
          this._auth.getUrl() + '/api/v1/readings',
          { reading: reading },
          this._auth.getOptions(),
        )
        .pipe(
          map(data => {
            if (data && data.reading) {
              this.readingValue = data.reading
              this.readingSource.next(this.readingValue)
            }
            return data.reading
          }),
        )
    }
  }

  /**
   * @deprecated 5/1/2019
   * @param filters
   */
  public getFeed(filters?: FilterObj): Observable<any> {
    let feedParams = new HttpParams()
    if (filters && filters['grades']) {
      let grades = filters['grades']
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

export interface ReadingQuery {
  first: number
  searchTerm?: string
  activeLibrary?: ActiveLibrary
  following?: any
  subjectFilter?: any[]
  gradeMin?: number
  gradeMax?: number
  createdCollection?: CreatedCollection
  scope?: Scope
  pop?: POP
  district?: string
  institutionId?: string
}

type POP = 'projects'
type CreatedCollection = 'bookmarked' | 'recent' | 'versions'
type Scope = 'public' | 'owner'
type ActiveLibrary = 'public' | 'following' | 'strategies' | 'academy'
