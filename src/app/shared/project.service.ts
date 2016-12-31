import { ActivatedRoute, Params } from '@angular/router';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ProjectService implements OnInit, OnDestroy {

    private header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    private options = new RequestOptions({ headers: this.header, withCredentials: true });

    private targetProjectId: string = '';
    private currentProject: any = {};

    private subscriptions: Subscription[] = [];

  constructor(private http: Http, private _auth: AuthService, private _route: ActivatedRoute) {

  }

  ngOnInit() {
    this.subscriptions.push(
        this._route.params
        .subscribe((params: Params) => { 
            if(params['id']){
                this.targetProjectId = params['id'];
                if (this.targetProjectId !== this.currentProject._id) {
                    this.get(this.targetProjectId);
                }
                
            }
        })
    );
  }
  
  // Pull all projects for a user
  public getAll() {
        return this.http
            .get(this._auth.baseUrl + '/sessions', this.options)
            .toPromise()
            .then(this._auth.extractData);
  }

  /**
   * Pull a Project object
   * @param projectId
   */
  public get(projectId: string) : Observable<any> {
        return this.http
            .get(this._auth.baseUrl + '/sessions/' + projectId, this.options)
            .map(
                data => {
                    return data.json();
                });
  }

  // Get a teacher's Projects for a Reading
  public getForReading(readingId) {
    let userId = this._auth.getUser()._id;
    
    return this.http.get(this._auth.baseUrl + '/readings/' + readingId + '/sessions/' + userId , this.options );
  }

    /**
     * Create a new Project
     * @param Requires a Reading ID
     * @param takes a Project object with the new label
     */
    public new(readingId, project) {
        return this.http
            .post(this._auth.baseUrl + '/sessions/' + readingId, { 'session' : project }, this.options)
            .toPromise()
            .then(this._auth.extractData);
    }

   ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}
