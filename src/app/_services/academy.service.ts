import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'

// project dependancies
import { AuthService } from 'src/app/_services'
import { User } from '../shared/datatypes'

@Injectable({
  providedIn: 'root'
})
export class AcademyService {

  constructor(
    private _http: HttpClient,
    private _auth: AuthService
  ) { }

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
   * Event handler that can be called from anywhere in the app. Handles success and error 
   * @param event event data to be passed in from where the event occurs follow this schema:
   * {
      SHARED PROPERTIES:
        date: timestamp,                            -> set on the server
        teacher: boolean,                           -> set at event location
        hero: boolean,                              -> set at event location
        user_id: string,                            -> set at event location
        institution_id: ObjectId,                   -> set at event location
        --------------------------------------------------------------------
      SPECIFIC TO THE EVENT:
        type: "reading_created",                    -> set at event location
        reading_id: ObjectId,                       -> set at event location
        group_id: ObjectId                          -> set at event location
        reading_owner: ObjectId,                    -> set at event location
        subjects: string[],                         -> set at event location
        source: string (hostname, book title...)    -> set at event location
      }
   */
  public pipoEvent(event: any): void {
    let pipoEvent = {
      e: event.name,
      uid: event.user._id,
      t: false,
      h: false,
      iid: event.institution_id,
      dtl: event.detail
    }
    
    // If the user on the event object is the teacher, then we'll note this on the event to save
    if (event.user._id===event.teacher._id) {
      pipoEvent.t = true
    }

    // If the user is a hero, let's note that before we save the event to Pipo
    if (event.user.hero_status) {
      pipoEvent.t = true
    }

    this.saveToPipo(pipoEvent)
    .subscribe(
      data => {
        console.log(data, pipoEvent)
      },
      error => {
        console.log(error)
      })
  }
}

/**
 * /api/v1/licenses/:license_id/accept Response
 */
interface AcceptLicenseResponse {
  user?: User
}