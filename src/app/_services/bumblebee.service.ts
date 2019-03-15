import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '.'
import { User } from '../shared/datatypes'

@Injectable()
export class BumblebeeService {

  private url: string = "//bumblebee.edji.it"
  private isProd: boolean = true

  constructor(private _auth: AuthService, private _http: HttpClient) {
    this.isProd = this._auth.getEnv() == 'prod'
  }

  public sendUserDetails(userDetails: any, sendType?: string): void {
    if (this.isProd) {
      this._http.post(
        this.url + "/newuser",
        { userDetails: userDetails, sendType: sendType },
        this._auth.getOptions()
      )
        .pipe(take(1))
        .subscribe(
          (success) => { },
          (error) => { console.error(error) }
        )
    }
  }

  public sendFeedback(data: any): Observable<any> {
    return this._http.post(
      this.url + "/newform",
      data,
      this._auth.getOptions()
    )
  }

  public userHeroAction(user: User, action: string): void {
    if (this.isProd) {
      this._http.post(
        this.url + "/hero",
        { user: user, action: action },
        this._auth.getOptions()
      )
        .pipe(take(1))
        .subscribe(
          (success) => { },
          (error) => { console.error(error) }
        )
    }
  }

  public reportError(error: any): void {
    if (this.isProd) {
      this._http.post(
        this.url + "/error",
        { error: error },
        this._auth.getOptions()
      )
        .pipe(take(1))
        .subscribe(
          (success) => { },
          (error) => { console.error(error) }
        )
    }
  }
}