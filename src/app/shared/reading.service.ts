import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ReadingService {

  constructor(private http: Http, private _auth: AuthService) {
  }

  ngOnInit() {
      
  }

    // Pull all readings for a user
  public getAll() {
        return this.http
            .get(this._auth.getUrl() + '/readings', this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData);
  }

  // Pull one reading by ID
  public get(id : string) : Observable<any> {
    
    return this.http
      .get(this._auth.getUrl() + '/readings/' + id, this._auth.getOptions())
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
            .post(this._auth.getUrl() + '/readings', readingObj, this._auth.getOptions())
            .map(data => {
              return data.json();
            });
  }

}
