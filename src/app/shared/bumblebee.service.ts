import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { Observable } from 'rxjs/Observable'

import { AuthService } from '.'
import { User } from './datatypes'

@Injectable()
export class BumblebeeService {

  private url: string = "//bumblebee.edji.it"
  // private url: string = "http://localhost:8333"
  private isProd: boolean = true

  constructor(private _auth: AuthService, private http: Http) {
    this.isProd = this._auth.getUrl() == 'prod'
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
        (error) => { console.error(error) } //don't think this can ever happen... bumblebee doesn't return errors
      )
  }

  public sendFeedback(data: any): Observable<any> {
    return this.http.post(
      this.url + "/newform",
      data,
      this._auth.getOptions()
    )
  }

  public userHeroAction(user: User, action: string): void {
    if (this.isProd) {
      this.http.post(
        this.url + "/hero",
        { user: user, action: action },
        this._auth.getOptions()
      )
      .take(1)
      .subscribe(
        (success) => {},
        (error) => { console.error(error) }
      )
    }
  }
}