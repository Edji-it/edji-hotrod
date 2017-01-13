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
      userDetails,
      this._auth.getOptions()
      )
      .take(1)
      .subscribe(
        (data) => {  },
        (error) => {  }
      )
  }
}