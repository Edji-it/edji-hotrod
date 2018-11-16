import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '.'
import { User } from '../shared/datatypes'

@Injectable()
export class BumblebeeService {

  private url: string = "//bumblebee.edji.it"
  // private url: string = "http://localhost:8333"
  private isProd: boolean = true

  constructor(private _auth: AuthService, private http: Http) {
    this.isProd = this._auth.getEnv() == 'prod'
  }

  public sendUserDetails(userDetails: any, sendType?: string): void {
    this.http.post(
      this.url + "/newuser",
      // "http://localhost:8333/newuser",
      { userDetails: userDetails, sendType: sendType },
      this._auth.getOptions()
      )
      .pipe(take(1))
      .subscribe(
        (success) => {  },
        (error) => { console.error(error) }
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
      .pipe(take(1))
      .subscribe(
        (success) => {},
        (error) => { console.error(error) }
      )
    }
  }

  public reportError(error: any): void {
    if (this.isProd) {
      this.http.post(
        this.url + "/error",
        { error: error },
        this._auth.getOptions()
      )
      .pipe(take(1))
      .subscribe(
        (success) => {},
        (error) => { console.error(error) }
      )
    }
  }
}