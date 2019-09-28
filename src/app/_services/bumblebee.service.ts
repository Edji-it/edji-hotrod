import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '.'
import { User } from '../shared/datatypes'

@Injectable()
export class BumblebeeService {
  private url: string = '//bumblebee.edji.it'
  private flakUrl: string
  private isProd: boolean = true

  constructor(private _auth: AuthService, private _http: HttpClient) {
    this.isProd = this._auth.getEnv() === 'prod'
    this.flakUrl = `//flak${this.isProd ? '' : '-dev'}.edji.it`
    // this.flakUrl = '//localhost:4200'
  }

  public postMessage(options: { target: string; message: string; target_type?: MessageTarget }): void {
    this._http.post(`${this.flakUrl}/bumblebee/messages`, options).toPromise()
  }

  public sendUserDetails(userDetails: User, sendType?: string): void {
    if (this.isProd) {
      this._http
        .post(this.url + '/newuser', { userDetails: userDetails, sendType: sendType }, this._auth.getOptions())
        .pipe(take(1))
        .subscribe(
          success => {},
          error => {
            console.error(error)
          },
        )
    } else {
      console.log('stubbing bumblebee user details', userDetails)
    }
  }

  public sendFeedback(data: any): Observable<any> {
    return this._http.post(this.url + '/newform', data, this._auth.getOptions())
  }

  public userHeroAction(user: User, action: string): void {
    if (this.isProd) {
      this._http
        .post(this.url + '/hero', { user: user, action: action }, this._auth.getOptions())
        .pipe(take(1))
        .subscribe(
          success => {},
          error => {
            console.error(error)
          },
        )
    }
  }

  public reportError(error: any): void {
    if (this.isProd) {
      this._http
        .post(this.url + '/error', { error: error }, this._auth.getOptions())
        .pipe(take(1))
        .subscribe(
          success => {},
          error => {
            console.error(error)
          },
        )
    }
  }
}

type MessageTarget = 'user' | 'channel'
