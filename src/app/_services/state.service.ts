import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AuthService } from './auth.service'

@Injectable()
export class StateService {
  constructor(private _http: HttpClient, private _auth: AuthService) {}
  getState(key: string): Observable<any> {
    return this._http.get<any>(`${this._auth.getUrl()}/api/v1/users/@me/state/${key}`, {
      headers: this._auth.getHeaders(),
    })
  }
  setState(key: string, state: any): Observable<any> {
    return this._http.post<{}>(`${this._auth.getUrl()}/api/v1/users/@me/state/${key}`, state, {
      headers: this._auth.getHeaders(),
    })
  }
}

/** @todo define state tracking interface and use in metrics reducers and state response */
/** @todo define keys we track with a type? */
