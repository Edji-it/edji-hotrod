import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ReadingService {
  private header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  });  
  // Create a request option
  private options = new RequestOptions({ headers: this.header, withCredentials: true });

  constructor(private http: Http, private _auth: AuthService) {

  }

  ngOnInit() {
      
  }

    // Pull all readings for a user
  public getAll() {
        
        return this.http
            .get(this._auth.baseUrl + '/readings', this.options)
            .toPromise()
            .then(this._auth.extractData);
  }

  // Pull one reading by ID
  public get(id : string) : Observable<any> {
    let header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    let options = new RequestOptions({ headers: header, withCredentials: true }); // Create a request option
    
    return this.http
      .get(this._auth.baseUrl + '/readings/' + id, options)
      .map(data => {
        return data.json()
      });
  }

  // Push new or update Reading
  public save(reading: any): Observable<any> {
    if (!reading['owner_id']) {
      reading['owner_id'] = this._auth.getUser()._id;
    }
    let readingObj = { 'reading': reading };
    return this.http
            .post(this._auth.baseUrl + '/readings', readingObj, this.options)
            .map(data => {
              return data.json();
            },
              error => {

            });
  }

}
