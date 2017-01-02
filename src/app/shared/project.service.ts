import { ActivatedRoute, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ProjectService {

  private targetProjectId: string = '';
  private currentProjectSource: Subject<any> = new Subject<any>();
  private project: any;
  public currentProject: Observable<any> = this.currentProjectSource.asObservable();
  
  
  private header: Headers;
  private options: RequestOptions;
    
  constructor(private http: Http, private _auth: AuthService, private _route: ActivatedRoute) {
    this.header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    this.options = new RequestOptions({ headers: this.header, withCredentials: true }); // Create a request option
  }
  
  /**
   * Pulls all projects for a single user
   * @returns chainable promise resolved with reading data
   */
  public getAll() {
        return this.http
            .get(this._auth.baseUrl + '/sessions', this.options)
            .toPromise()
            .then(this._auth.extractData);
  }

  /**
   * Adds a user to a project code and updates currentProject observable
   * @param projectCode Short project code
   */
  public setCurrentProject(projectCode: string): void {
    this.http.get(this._auth.baseUrl + '/sessions/' + projectCode, this.options)
        .subscribe(
            data => {
                this.project = data.json(); //can later have local setter to do validation/data manipulation before passing through observable
                this.currentProjectSource.next(this.project);
            },
            err => {
                console.log(err);
            });
  }

  /**
   * Gets all of a teacher's projects for a reading
   */
  public getForReading(readingId: string): Observable<any> {
    let userId = this._auth.getUser()._id;
    
    return this.http.get(this._auth.baseUrl + '/readings/' + readingId + '/sessions/' + userId , this.options );
  }

  /**
   * Validates whether or not a project code exists
   * @param projectCode Short project code
   * @returns Observable which will have error if response is invalid
   */
  public validateProject(projectCode: string): Observable<any> {

      return this.http.get(this._auth.baseUrl + '/sessions/' + projectCode + "/validate", this.options)
        
  }

}
