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
            .get(this._auth.getUrl() + '/readings/all/projects', this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData)
            .then((data) => { return data.readings })
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
    if (!reading['teacher_ids'] || reading['teacher_ids'].length < 1) {
      reading['teacher_ids'] = [this._auth.getUser()._id];
    }

    if (reading['_id']) {
      let putReading = {
        title: reading.title,
        words: reading.words,
        html: reading.html,
        source: reading.source
      }

      return this.http
              .put(this._auth.getUrl() + '/readings/' + reading['_id'], { reading: putReading }, this._auth.getOptions())
              .map(data => {
                return data.json().reading;
              });
    } else {
      return this.http
              .post(this._auth.getUrl() + '/readings', { reading: reading }, this._auth.getOptions())
              .map(data => {
                return data.json().reading;
              });
    }
  }

}
