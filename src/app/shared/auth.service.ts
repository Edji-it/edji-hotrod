import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Locker } from 'angular2-locker';

@Injectable()
export class AuthService {
    public baseUrl = "http://localhost:3354";
    // Check to see if prod or dev environment
    public protocol = window.location.protocol ? window.location.protocol : '';
    private locker : any;

    private header: Headers;
    private options: RequestOptions;

  constructor(private http: Http, private _locker: Locker) {
      this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
      this.header = new Headers({ 'Content-Type' : 'application/json', 'Authorization' : this.getToken()  });
      this.options = new RequestOptions({ headers: this.header, withCredentials: true }); // Create a request option
  }

  ngOnInit() {
    if ( window.location.host.indexOf('dev.edji.it') > -1 ) {
        //   baseUrl = "http://edji-dev.herokuapp.com";
        this.baseUrl = this.protocol + "//optimus-dev.edji.it"; 
    } else if ( window.location.host.indexOf('edji.it') > -1 || window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1 ) {
        //   this.baseUrl = "http://edji-prod.herokuapp.com";
        this.baseUrl = this.protocol + "//optimus.edji.it";
    }
  }

  /**
   * Encodes javascript object into a URI component
   * @param obj The object to be encoded
   */
  public formEncode(obj: Object): string {
      var encodedString = '';
      for (var key in obj) {
          if (encodedString.length !== 0) {
              encodedString += '&';
          }
          encodedString += key + '=' + encodeURIComponent(obj[key]);
      }
      return encodedString.replace(/%20/g, '+');
  }

  /**
   * Takes a response object and turn the data into an object
   */
  public extractData(res: Response): any {
      let body = res.json();
      return body || { };
  }

    /**
   * Saves user to local storage
   * @param user The user should be an object to store in sessionstorage
   */
    public setUser(user: any) {
        //should have session timeout, username, baseProfileId, typeId
        this.locker.set('user', user);
    }

    //TODO create deleteUser object

    /**
     * Gets user object from local storage
     */
    public getUser() : any {
        return this.locker.get('user');
    }

    public setToken(token: any) {
        return this.locker.set('token', token);
    }

    public getToken() : any {
        return this.locker.get('token');
    }

    private destroyCredentials() {
        this.locker.remove('token');
        this.locker.remove('user');
    }

    login(user: any) {
        let data = {
                'user' : {
                    'username' : user.username,
                    'password' : user.password
                } 
            };

        return this.http
            .post(this.baseUrl + '/users/login', data, this.options)
            .toPromise()
            .then(this.extractData);
    }

    logout() {
        this.destroyCredentials();
    }

    /**
     * There are two cases to use this call:
     *  1) User is logged in and resetting password => resetObject should be assigned properties oldPassword, newPassword
     *  2) User has a password recovery email => resetObject should be assigned properties: token, newPassword
     * @param resetObject Can have properties: oldPassword, newPassword, token
     * @returns Chainable promise resolved with json data containing either a user object & token or errors
    **/
    resetPassword(resetObject: any) {
    return this.http
        .post(
            [this.baseUrl, 'users', 'reset_password'].join("/"),
            { resetObject: resetObject },
            this.options)
        .toPromise()
        .then(this.extractData);
    };

}
