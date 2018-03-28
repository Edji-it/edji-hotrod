import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import 'rxjs/add/operator/toPromise'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Angulartics2 } from 'angulartics2'
import { AuthService } from './auth.service'

@Injectable()
export class MessageService {

  constructor(
    private _http: HttpClient,
    private angulartics: Angulartics2, 
    private _auth: AuthService
  ) {
    
  }

  /**
   * Gets messages (notifications) from the server
   */
  public getMessages() : Observable<any> {
    return this._http.get(this._auth.getUrl() + '/api/v1/users/messages', 
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this._auth.getToken()
        }), 
      })
  }
}