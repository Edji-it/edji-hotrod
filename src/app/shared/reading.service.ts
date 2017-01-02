import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ReadingService {
  private header: Headers;
  private options: RequestOptions;

  constructor(private http: Http, private _auth: AuthService) {
    this.header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    this.options = new RequestOptions({ headers: this.header, withCredentials: true }); // Create a request option
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
  public get(id) {
    return this.http
      .get(this._auth.baseUrl + '/readings/' + id, this.options);
  }

}
