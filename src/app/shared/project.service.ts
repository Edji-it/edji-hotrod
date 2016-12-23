import { ActivatedRoute, Params } from '@angular/router';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ProjectService implements OnInit, OnDestroy {

  private targetProjectId: string = '';
  private currentProject: any = {};

  private subscriptions: Subscription[] = [];

    private header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    private options = new RequestOptions({ headers: this.header, withCredentials: true }); // Create a request option
    
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
   * Adds a user to a projectId
   */
  private get(projectId: string): void {
      
      this.subscriptions.push(
          this.http
            .get(this._auth.baseUrl + '/sessions/' + projectId, this.options)
            .subscribe(
                data => {
                    this.currentProject = data.json();
                },
                err => {
                    console.log(err);
                })
      );
  }

  /**
   * Gets all of a teacher's projects for a reading
   */
  public getForReading(readingId: string) {
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

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}
