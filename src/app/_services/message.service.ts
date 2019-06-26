import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject, Subscription, interval } from 'rxjs'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Angulartics2 } from 'angulartics2'
import { map, take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from './auth.service'
import { NavigationExtras } from '@angular/router'

const TOAST_TIME: number = 10000
@Injectable()
export class MessageService {
  private timerSubscription: Subscription

  /**
   * Message Toasts are sent/updated via Observable
   * (!) Use _messages.sendToast() to display a message toast
   */
  public toastUpdatesSource: BehaviorSubject<MessageToast[]>
  public toastUpdates: Observable<MessageToast[]>
  //- Hold timers by the toast id
  private toastTimers: {} = {}

  constructor(private _http: HttpClient, private angulartics: Angulartics2, private _auth: AuthService) {
    this.toastUpdatesSource = new BehaviorSubject([])
    this.toastUpdates = this.toastUpdatesSource.asObservable()

    // Clear all toasts on logout, etc.
    this._auth.clearAll.subscribe(clear => {
      // Clear all toasts
      this.toastUpdatesSource.next([])
    })
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
   * Send new or update toast message
   * @param toast Message and associated display data to send
   * - To send update, send with id that matches existing toast
   */
  public sendToast(toast: MessageToast): void {
    let isUpdate
    let toasts = this.toastUpdatesSource.value
    // Attach date for received
    toast.date = new Date()

    // Set timeout
    if (!toast.requireDismiss) {
      // Cancel existing timer if this is a toast *update*
      this.cancelToastTimer(toast.id)
      // Begin timer for dismissing toast
      this.toastTimers[toast.id] = setTimeout(() => {
        this.dismissToast(toast.id)
      }, TOAST_TIME)
    }

    // Check if toast with ID exists
    for (let i = 0; i < toasts.length; i++) {
      if (toasts[i].id === toast.id) {
        // Replace toast with update
        toasts[i] = toast
        isUpdate = true
        break
      }
    }
    // Push new toasts to the front of the list
    if (!isUpdate) {
      toasts.unshift(toast)
    }
    this.toastUpdatesSource.next(toasts)
  }

  /**
   * Dismiss Toast Message
   * @param toastId Toast for message to dismiss
   */
  public dismissToast(toastId: string): void {
    let toasts = this.toastUpdatesSource.value
    // Cancel timer, if exists
    this.cancelToastTimer(toastId)
    // Remove toast
    for (let i = 0; i < toasts.length; i++) {
      if (toasts[i].id === toastId) {
        toasts.splice(i, 1)
        break
      }
    }
    this.toastUpdatesSource.next(toasts)
  }

  /**
   * Cancel Toast timer, if it exists
   * @param toastId Toast of timer to cancel
   */
  public cancelToastTimer(toastId: string): void {
    if (this.toastTimers[toastId]) {
      clearTimeout(this.toastTimers[toastId])
    }
  }

  /**
   * Gets messages (notifications) from the server
   */
  public getMessages(): Observable<GetMessagesResponse> {
    return this._http.get<GetMessagesResponse>(
      this._auth.getUrl() + '/api/v1/users/' + this._auth.getUser()._id + '/messages',
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      },
    )
  }

  /**
   * Calls getMessages every minute and checks for messages that are returned from the server
   */
  private subscribeToRefresh(): void {
    // Subscribe to the timer and run it every minute
    this.timerSubscription = interval(60000).subscribe(() => {
      if (this._auth.getUser().isLoggedIn) {
        // Make the call to getMessages and subscribe to its observable
        this.getMessages()
          .pipe(take(1))
          .subscribe(
            data => {
              let messages = data.messages
              let msgLen = messages.length
              // Check through the messages
              for (var i = 0; i < msgLen; i++) {
                let message = messages[i]
                // Refresh the user if message is 'user_refresh_required'
                if (message.key === 'user_refresh_required') {
                  this._auth
                    .refreshUser()
                    .pipe(take(1))
                    .subscribe(
                      data => {
                        // do something else with user, if need be
                      },
                      error => {
                        console.error(error)
                      },
                    )
                }
              }
            },
            err => {
              console.error(err)
            },
          )
      }
    })
  }
}

/**
 * /api/v1/users/:id/messages Response
 */
interface GetMessagesResponse {
  messages: {
    key: String
    added_at_time: String
  }[]
}

export interface MessageToast {
  message: string
  type: string // "info", "heat-on", "heat-off", "promo", "new-feedback", "promoted"
  id: string
  link?: string // routerLink path
  linkFragment?: string
  date?: Date
  limitToPage?: string // identify route where message type should show
  requireDismiss?: boolean
}
