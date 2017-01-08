import { ActivatedRoute, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ProjectService {
  private targetProjectId: string = '';

  /** project will be given out as observable */
  private project: any = { title: "initial value" };
  private currentProjectSource: BehaviorSubject<any> = new BehaviorSubject<any>(this.project);
  public currentProject: Observable<any> = this.currentProjectSource.asObservable();

  // Maintain local Project data and its updates in this service
  

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
   * @returns observable with project data
   */
  public setCurrentProject(projectCode: string): Observable<any> {
    return this.http.get(this._auth.baseUrl + '/sessions/' + projectCode, this._auth.getOptions())
        .map(
            (data) => {
                this.project = data.json(); //can later have local setter to do validation/data manipulation before passing through observable
                this.currentProjectSource.next(this.project);
                return this.project;
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
                    // Update local Project object if returned
                    if (data.json()._id) {
                        this.project = data.json();
                    }
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
     * Delete a Project
     * @param Requires a Project ID
     */
    public delete(projectId) {
        return this.http
            .delete(this._auth.baseUrl + '/sessions/' + projectId, this._auth.getOptions())
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
    public saveComment(projectId: string, commentText: string, start: number, end: number, type: string, text ?: string, commentId ?: string) : Promise<any> {
        let url = this._auth.baseUrl + '/sessions/' + projectId + '/comments';
        let data = {
            'comment' : {
                'data' : commentText,
                'start' : start,
                'end' : end,
                'user_id' : this._auth.getUser()._id,
                'author' : this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username,
                'type' : type
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

    /**
     * Deletes comment via service, then updates local Project object 
     * - Project page should subscribe to the currentProject Observable to receive these updates
     */
    public deleteComment(commentId: string): Promise<any> {
        let projectId = this.project._id;
        let url = this._auth.baseUrl + '/sessions/' + projectId + '/comments/' + commentId;

        return this.http
            .delete(url, this._auth.getOptions())
            .map(data => {
                for (var i = 0; i <= this.project.comments.length; i++) {
                    if (this.project.comments[i] && this.project.comments[i]._id === commentId) {
                        // Remove comment from local object
                        this.project.comments.splice(i);
                    }
                }
                return data;
            })
            .toPromise()
            .then(this._auth.extractData);
    }
}
