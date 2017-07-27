import { Project } from './datatypes';
import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service'
import { Reading } from './datatypes/reading'

@Injectable()
export class ReadingService {

  /*
  Last Modified: 26 May 2017
  */

  constructor(private http: Http, private _auth: AuthService) {
  }

  ngOnInit() {
      
  }

  //set up thumbnail observables
  private readingValue: Reading = <Reading>{};
  // BehaviorSubjects push last value on subscribe
  private readingSource: BehaviorSubject<Reading> = new BehaviorSubject(this.readingValue);
  public currentReading: Observable<Reading> = this.readingSource.asObservable();

  // User's Readings observable
  private userReadingsSource = new BehaviorSubject([])
  public currentUserReadings: Observable<any> = this.userReadingsSource.asObservable()

  // Version refresh observable
  private refreshVersionSource = new Subject()
  public  refreshVersions: Observable<any> = this.refreshVersionSource.asObservable()

    // Pull all readings for a user
  public getAll() {
        return this.http
            .get(this._auth.getUrl() + '/readings/all/projects', this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData)
            .then((data) => { 
              this.userReadingsSource.next(data.readings)
              return data.readings
            })
  } //getAll()

  // Pull one reading by ID
  public get(id : string) : Observable<any> {
    
    return this.http
      .get(this._auth.getUrl() + '/readings/' + id, this._auth.getOptions())
      .map(data => {
        if (data.json()) {
          this.setReadingObj(data.json())
        }
        return data.json()
      });
  } // public get(id : string) : Observable<any>

  public setReadingObj(reading: any) : void {
    // console.log("Set", reading)
    if (reading._id) {
      this.readingValue = reading
      this.readingSource.next(this.readingValue)
    }
  }

  // Pull all versions of a particular reading
  public getAllVersions(versionId : string) : Observable<any> {
      return this.http
          .get(this._auth.getUrl() + '/readings/versions/' + versionId, this._auth.getOptions())
          .map(data => {
            return data.json()
          });
  } // public getAllVersions(versionId : string) : Observable<any>

  public clear(): void {
    this.readingValue = <Reading>{}
    this.readingSource.next(this.readingValue)
  } // public clear(): void 

  // It deletes the reading. Fairly straightforward.
  // No need to return an Observable<Reading> since we don't need to use it after the fact.
  public delete(targetReading: Reading): Observable<any> {
    // console.log("Deleting '" + targetReading.title)
    return this.http.delete(this._auth.getUrl() + '/readings/' +  targetReading._id, this._auth.getOptions())
      .map(value => {
        // Delete was successful
        let readings = this.userReadingsSource.value
        
        readings.forEach(
          (reading, index) => {
            
            if (reading.versionCount > 1) {
              // Reload content (slower but simpler)
              this.getAll()
            } else if (reading._id == targetReading._id) {
              // Single version readings we can remove instantly
              readings.splice(index, 1)
            }

          } // (reading, index) =>
        ) // readings.forEach
        this.userReadingsSource.next(readings)
        return value
      });
  } // public delete(): void

  /**
   * Remove Project from service maintained list of Readings with nested Projects
   */
  public removeProject(targetProject: Project) {
    let readings = this.userReadingsSource.value
    let projectFound = false

    readings.forEach( reading => {
      reading.projects = reading.projects.filter(
          (project) => {
            if (project._id == targetProject._id) {
              projectFound = true
            }
            return project._id != targetProject._id
          }
        )
    })

    // If we didn't find the project, it's hiding in a version
    if (!projectFound) {
      console.error("PROJECT NOT FOUND")
      this.refreshVersionSource.next(targetProject._id)
    }
    this.userReadingsSource.next(readings)
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
        draft: reading.draft
      } // let

      return this.http
              .put(this._auth.getUrl() + '/readings/' + reading['_id'], { reading: putReading }, this._auth.getOptions())
              .map(data => {
                if (data.json() && data.json().reading) {
                  this.readingValue = data.json().reading
                  this.readingSource.next(this.readingValue)
                }
                return data.json().reading;
              });
    } else {
      return this.http
              .post(this._auth.getUrl() + '/readings', { reading: reading }, this._auth.getOptions())
              .map(data => {
                if (data.json() && data.json().reading) {
                  this.readingValue = data.json().reading
                  this.readingSource.next(this.readingValue)
                }
                return data.json().reading;
              });
    } // if
  } // public save()

}
