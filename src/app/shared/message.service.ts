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
    
  }

  /**
   * This method only exists to initialize the service
   * Startup Logic
   */
  public init(): void {
    // Start the interval call to the server to retrieve messages every set interval (1 minute right now)
    this.subscribeToRefresh()
  }

  /**
   * Gets messages (notifications) from the server
   */
  public getMessages(): Observable<GetMessagesResponse> {
    return this._http.get<GetMessagesResponse>(this._auth.getUrl() + '/api/v1/users/' + this._auth.getUser()._id + '/messages', 
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this._auth.getToken()
        })
      })
  }

  /**
   * Calls getMessages every minute and checks for messages that are returned from the server
   */
  private subscribeToRefresh(): void {
    // Subscribe to the timer and run it every minute
    this.timerSubscription = Observable.timer(0, 60000).subscribe(() => {
      if (this._auth.getUser().isLoggedIn) {
        // Make the call to getMessages and subscribe to its observable
        this.getMessages().subscribe((data: any) => {
          let messages = data.messages
          let msgLen = messages.length
          // Check through the messages
          for(var i=0; i < msgLen; i++) {
            let message = messages[i]
            // Refresh the user if message is 'user_refresh_required'
            if (message.key==='user_refresh_required') {
              this._auth.refreshUser()
            }
          }
        }, (err) => {
          console.error(err)
        })
      }
    })
  }
}

/**
 * /api/v1/users/:id/messages Response
 */
interface GetMessagesResponse {
  messages: {
    key: String, 
    added_at_time: String
  }[]
}