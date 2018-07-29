import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, interval, Subscription } from 'rxjs'

// project dependancies
import { AuthService } from 'src/app/_services'
import { User } from '../shared/datatypes'
import { resolve } from 'url';

@Injectable({
  providedIn: 'root'
})
export class AcademyService {
  private readingTimerSubscription: Subscription

  private user: User
  private project: any

  constructor(
    private _http: HttpClient,
    private _auth: AuthService
  ) { }

  /**
   * Accepts a license that is shared with the user
   * @param licenseId _id of the license to accept
   */
  public acceptLicense(licenseId: string): Observable<AcceptLicenseResponse> {
    return this._http.put<AcceptLicenseResponse>(this._auth.getUrl() + '/api/v1/licenses/' + licenseId + '/accept',
    {},
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this._auth.getToken()
      })
    })
  }

  /**
   * Gets the name for the institution
   * @param institutionId _id of the institution to get
   */
  public getInstitution(institutionId: string): Observable<GetInsitutionResponse> {
    return this._http.get<GetInsitutionResponse>(this._auth.getUrl() + '/api/v1/institutions/' + institutionId,
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this._auth.getToken()
      })
    })
  }

  /**
   * Send an event to Pipo - our server for logging data!
   * @param event event data, follow this schema:
   */
  private saveToPipo(event: any): Observable<any> {
    return this._http.post<any>(this._auth.getPipoUrl() + '/api/v1/events',
      {"data": event},
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this._auth.getToken()
        })
      }
    )
  }

  /**
   * Sends the reading report to the server with the pdf attachment and message
   * @param evalForm the evaluation form data from the reading report
   * @param pdf the pdf that is captured from the reading report
   */
  public sendReadingReport(evalForm: any, pdf: any): Observable<any> {
    return this._http.post<any>(this._auth.getUrl() + '/api/v1/readings/reports',
      {
        "email": evalForm.email,
        "eval": evalForm.inputText,
        "person_sharing": evalForm.personSharing,
        "pdfName": evalForm.pdfName,
        "pdf": pdf
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this._auth.getToken()
        })
      }
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
    this.saveToPipo(event)
    .subscribe(
      data => {
        // console.log(data.event)
      },
      error => {
        console.error(error)
      })
  }

  /**
   * This method starts the timer
   * Startup Logic
   */
  public initReadingTimer(user: User, project: any): void {
    this.user = user
    this.project = project
    // Start the interval to track time on a reading (30 seconds right now)
    this.readingTimer()
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
   * Starts by using initReadingTimer()
   * Stops by using stopReadingTimer - or leaving Edji all together
   */
  private readingTimer(): void {
    this.readingTimerSubscription = interval(30000).subscribe(() => {
      // send the data to Pipo to log the new reading
      this.pipoEvent({
        // standard event info:
        event_name: "reading_tick",
        user_id: this.user._id,
        teacher: (this.project.teacher._id===this.user._id),
        hero: this.user.hero_status || false,
        institution_id: this.user.institution_ids || [],
        // event-specific info:
        reading_id: this.project.reading_id._id,
        group_id: this.project._id,
        reading_owner: this.project.teacher._id,
        reading_time: 30
      })
    })
  }
}

/**
 * /api/v1/licenses/:license_id/accept Response
 */
interface AcceptLicenseResponse {
  user?: User
}

/**
 * 
 */
interface GetInsitutionResponse {
  institution: {
    _id: string
    name: string
    abbreviation: string
  }
}