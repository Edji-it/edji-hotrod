import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '.';

@Injectable()
export class BumblebeeService {

  private url: string = "//edji-bumblebee.herokuapp.com";
  // private url: string = "http://localhost:8333";

  constructor(private _auth: AuthService, private http: Http) {
  }

  public sendUserDetails(userDetails: any): void {
    this.http.post(
      this.url + "/newuser",
      // "http://localhost:8333/newuser",
      { userDetails: userDetails },
      this._auth.getOptions()
      )
      .take(1)
      .subscribe(
        (success) => {  },
        (error) => { console.error(error); } //don't think this can ever happen... bumblebee doesn't return errors
      )
  }

  public sendFeedback(data: any): Observable<any> {
    return this.http.post(
      this.url + "/newform",
      data,
      this._auth.getOptions()
    )
  }
}