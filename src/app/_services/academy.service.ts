import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, interval, Subscription, Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { stringify } from 'querystring'

// project dependancies
import { AuthService } from 'src/app/_services'
import { User, License, Project } from '../shared/datatypes'
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '../../../node_modules/@angular/router'
import { LockerService } from '../_services/locker.service'

@Injectable({
  providedIn: 'root',
})
export class AcademyService implements CanActivate {
  private readingTimerSubscription: Subscription

  public allLicenses: any
  public institutionLicenses: any
  private user: User

  // User status in project
  private userActivity: any
  private userActive: boolean = true

  public userStatusSubj: Subject<any> = new Subject()
  public userStatus: Observable<any> = this.userStatusSubj.asObservable()

  constructor(
    private _http: HttpClient,
    private _auth: AuthService,
    private _router: Router,
    private _locker: LockerService,
  ) {}

  /**
   * Accepts a license that is shared with the user
   * @param licenseId _id of the license to accept
   */
  public acceptLicense(licenseId: string, query: { type?: string } = {}): Observable<AcceptLicenseResponse> {
    return this._http.put<AcceptLicenseResponse>(
      `${this._auth.getUrl()}/api/v1/licenses/${licenseId}/accept?${query ? stringify(query) : ''}`,
      {},
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      },
    )
  }

  /**
   * Invites a teacher to a license
   * @param licenseId _id of the license to accept
   */
  public inviteToLicense(
    name: string,
    email: string,
    role: string,
    licenseId: string,
  ): Observable<InviteLicenseResponse> {
    return this._http.put<InviteLicenseResponse>(
      this._auth.getUrl() + '/api/v1/licenses/' + licenseId + '/invite',
      {
        email: email,
        name: name,
        role: role,
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      },
    )
  }

  /**
   * Gets the name for the institution
   * @param institutionId _id of the institution to get
   */
  public getInstitution(institutionId: string): Observable<GetInsitutionResponse> {
    return this._http.get<GetInsitutionResponse>(this._auth.getUrl() + '/api/v1/institutions/' + institutionId, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this._auth.getToken(),
      }),
    })
  }

  /**
   * Send an event to Pipo - our server for logging data!
   * @param event event data, follow this schema:
   */
  private saveToPipo(event: any): Observable<any> {
    return this._http.post<any>(
      this._auth.getPipoUrl() + '/api/v1/events',
      { data: event },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      },
    )
  }

  /**
   * Returns time on reading data from the reading group
   * @param group_id from the reading 'project'
   */
  public getTimeOnReading(group_id: string): Observable<any> {
    return this._http.get<any>(this._auth.getPipoUrl() + '/api/v1/stats/groups/' + group_id, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this._auth.getToken(),
      }),
    })
  }

  /**
   * Sends the reading report to the server with the pdf attachment and message
   * @param evalForm the evaluation form data from the reading report
   * @param pdf the pdf that is captured from the reading report
   */
  public sendReadingRecap(evalForm: any, pdf: any): Observable<any> {
    return this._http.post<any>(
      this._auth.getUrl() + '/api/v1/readings/reports',
      {
        email: evalForm.email,
        evaluation: evalForm.inputText,
        person_sharing: evalForm.personSharing,
        replyTo: evalForm.personSharingEmail,
        person_receiving: evalForm.name,
        attachment_name: evalForm.pdfName,
        pdf: pdf,
        reading_name: evalForm.readingName,
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      },
    )
  }

  /**
   * Server will return all licenses the current user can manage
   */
  public getLicenses(): Observable<any> {
    return this._http
      .get<any>(this._auth.getUrl() + '/api/v1/licenses', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      })
      .pipe(
        map(data => {
          return data.licenses
        }),
      )
  }

  /**
   * Event handler that can be called from anywhere in the app. Handles success and error 
   * @param event event data to be passed in from where the event occurs follow this schema:
   * {
      SHARED PROPERTIES:
        date: timestamp,                            -> set on the server
        type: "reading_created",                    -> set at event location
        teacher: boolean,                           -> set at event location
        hero: boolean,                              -> set at event location
        user_id: string,                            -> set at event location
        institution_id: ObjectId,                   -> set at event location
        --------------------------------------------------------------------
      SPECIFIC TO THE EVENT:
        reading_id: ObjectId,                       -> set at event location
        group_id: ObjectId                          -> set at event location
        subjects: string[],                         -> set at event location
        source: string (hostname, book title...)    -> set at event location
      }
   */
  public pipoEvent(event: any): void {
    this.saveToPipo(event).subscribe(
      data => {
        // console.log(data.event)
      },
      error => {
        console.error(error)
      },
    )
  }

  /**
   * This method stops the timer for reading
   * Shutdown Logic
   */
  public stopReadingTimer(): void {
    this.readingTimerSubscription && this.readingTimerSubscription.unsubscribe()
  }

  /**
   * Sends an event to pipo every 30 seconds once the timer is rolling
   * - Stops by using stopReadingTimer - or leaving Edji all together
   */
  public startReadingTimer(user: User, project: Project, resume?: boolean): void {
    // We broadcast out the user in a socket event if inactive for the status indicator
    this.user = user
    // Start checking for lack of activity now
    this.monitorUserReadingStatus()
    // Kick off the reading timer subscription
    this.readingTimerSubscription = interval(30000).subscribe(() => {
      // send the data to Pipo to log the new reading
      this.pipoEvent({
        // standard event info:
        event_name: 'reading_tick',
        user_id: user._id,
        teacher: project.isTeaching,
        hero: user.hero_status || false,
        institution_id: user.institution_ids || [],
        // event-specific info:
        reading_id: project.reading_id._id,
        group_id: project._id,
        reading_owner: project.teacher._id,
        reading_time: 30,
      })
    })
  }

  /**
   * Before we start the timer, we'll subscribe to an event that will monitor user activity.
   * when the user idles, we'll call on stopReadingTimer and let socket know the user went idle in the reading
   * for the live status indicators. Once the user has activity again, we'll fire another message out to indicate
   * live status and start the timer again
   */
  private monitorUserReadingStatus(resume?: boolean): void {
    this.userActivity = setTimeout(() => {
      this.userActive = false
      // this will set the user's status on the leaderboard to idle
      this.userStatusSubj.next({
        status: 'idle',
      })
    }, 120000) // if the user status indicator is going idle too much, then add more time here!
  }

  public trackActivity(): void {
    clearTimeout(this.userActivity)
    // this will set the user's status on the leaderboard to active
    if (!this.userActive) {
      this.userStatusSubj.next({
        status: 'active',
      })
    }
    this.userActive = true
    this.monitorUserReadingStatus()
  }

  /** Provides logic for sending user back to home if they are not authorized */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let user: User = this._locker.get('user')
    // is a teacher and belongs to an institution and can therefore access the academy suite
    if (!user.hero_status || !user.isAcademyAdmin || user.license_ids.length === 0) {
      this._router.navigate(['/dashboard'])
      return false
    } else {
      return true
    }
  }
}

/**
 * /api/v1/licenses/:license_id/accept Response
 */
interface AcceptLicenseResponse {
  user?: User
}

/**
 * /api/v1/institutions/:institution_id Response
 */
interface GetInsitutionResponse {
  institution: {
    _id: string
    name: string
    abbreviation: string
  }
}

/**
 * /api/v1/licenses/:license_id/invite Response
 */
interface InviteLicenseResponse {
  license: License
}
