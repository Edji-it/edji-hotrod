import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import 'rxjs/add/operator/toPromise'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Angulartics2 } from 'angulartics2'
import { AuthService } from './auth.service'
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable()
export class MessageService {

  private timerSubscription: AnonymousSubscription

  constructor(
    private _http: HttpClient,
    private angulartics: Angulartics2, 
    private _auth: AuthService
  ) {
    // Start the interval call to the server to retrieve messages every set interval (1 minute right now)
    this.subscribeToRefresh()
  }

  /**
   * This method only exists to initialize the service
   */
  public init(): void {
    // Startup Logic
  }

  /**
   * Gets messages (notifications) from the server
   */
  public getMessages(): Observable<any> {
    return this._http.get(this._auth.getUrl() + '/api/v1/users/messages', 
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this._auth.getToken()
        })
      })
  }

  private subscribeToRefresh(): void {
    this.timerSubscription = Observable.timer(0, 60000).subscribe(() => 
      this.getMessages()
    )
  }
}