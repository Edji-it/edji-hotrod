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

  constructor(private http: Http, private _auth: AuthService, private _route: ActivatedRoute) {
  }
  
  /**
   * Pulls all projects for a single user
   * @returns chainable promise resolved with reading data
   */
  public getAll() {
        return this.http
            .get(this._auth.baseUrl + '/sessions', this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData);
  }

  /**
   * Adds a user to a project code and updates currentProject observable
   * @param projectCode Short project code
   */
  public setCurrentProject(projectCode: string): void {
    this.http.get(this._auth.baseUrl + '/sessions/' + projectCode, this._auth.getOptions())
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
    
    return this.http.get(this._auth.baseUrl + '/readings/' + readingId + '/sessions/' + userId , this._auth.getOptions() );
  }

  /**
   * Validates whether or not a project code exists
   * @param projectCode Short project code
   * @returns Observable which will have error if response is invalid
   */
  public validateProject(projectCode: string): Observable<any> {

      return this.http.get(this._auth.baseUrl + '/sessions/' + projectCode + "/validate", this._auth.getOptions())
        
  }

    /** 
    * Pull a Project object
    * @param projectId
    */
  public get(projectId: string) : Observable<any> {
        return this.http
            .get(this._auth.baseUrl + '/sessions/' + projectId, this._auth.getOptions())
            .map(
                data => {
                    return data.json();
                });
  }

    /**
     * Create a new Project
     * @param Requires a Reading ID
     * @param takes a Project object with the new label
     */
    public new(readingId, project) {
        return this.http
            .post(this._auth.baseUrl + '/sessions/' + readingId, { 'session' : project }, this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData);
    }

    /** 
     * Update or Create a comment on a project
     * @param projectId Id of project comment is on
     * @param commentText Contents of the comment
     * @param start Index of first word
     * @param end Index of last word
     * @param text (optional) Selection of text comment was made on. Left as optional, but SHOULD be passed.
     * @param commentId (optional) If passed, will update comment with that ID
     */
    public saveComment(projectId: string, commentText: string, start: number, end: number, text ?: string, commentId ?: string) : Promise<any> {
        let url = this._auth.baseUrl + '/sessions/' + projectId + '/comments';
        let data = {
            'comment' : {
                'data' : commentText,
                'start' : start,
                'end' : end,
                'user_id' : this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username
            }
        }

        if (text) {
            data.comment['text'] = text;
        }

        // Add comment ID if passed
        if (commentId) {
            data.comment['_id'] = commentId;
        }

        return this.http
            .post(url, data, this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData);
    }
}
