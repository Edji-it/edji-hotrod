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
        let header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
        let options = new RequestOptions({ headers: header, withCredentials: true }); // Create a request option
        
        return this.http
            .get(this._auth.baseUrl + '/readings', options)
            .toPromise()
            .then(this._auth.extractData);
  }

  // Pull one reading by ID
  public get(id) {
    let header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    let options = new RequestOptions({ headers: header, withCredentials: true }); // Create a request option
    
    return this.http
      .get(this._auth.baseUrl + '/readings/' + id, options);
  }

}
