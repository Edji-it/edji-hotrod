import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service';

@Injectable()
export class ProjectService {
    
  constructor(private http: Http, private _auth: AuthService) {

  }

  ngOnInit() {

  }

    // Pull all projects for a user
  public getAll() {
        let header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
        let options = new RequestOptions({ headers: header, withCredentials: true }); // Create a request option
        
        return this.http
            .get(this._auth.baseUrl + '/sessions', options)
            .toPromise()
            .then(this._auth.extractData);
    }

  // Get a teacher's Projects for a Reading
  public getForReading(readingId) {
    let header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this._auth.getToken()  }); 
    let options = new RequestOptions({ headers: header, withCredentials: true }); // Create a request option
    let userId = this._auth.getUser()._id;
    
    return this.http.get(this._auth.baseUrl + '/readings/' + readingId + '/sessions/' + userId , options );
  }

}
