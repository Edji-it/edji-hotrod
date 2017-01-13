import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from '.';

@Injectable()
export class BumblebeeService {

  constructor(private _auth: AuthService, private http: Http) {
  }

  public sendUserDetails(userDetails: any) {
    this.http.post(
      "http://bumblebee-prod-1.us-west-2.elasticbeanstalk.com/newuser",
      // "http://localhost:8333/newuser",
      { userDetails: userDetails },
      this._auth.getOptions()
      )
      .take(1)
      .subscribe(
        (success) => { console.log("bumblebee posted to slack!"); },
        (error) => { console.error(error); } //don't think this can ever happen... bumblebee doesn't return errors
      )
  }
}