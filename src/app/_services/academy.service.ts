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
  public pipoEvent(event: any): Observable<any> {
    return this._http.get<any>(this._auth.getPipoUrl() + '/api/v1/events',
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this._auth.getToken()
        })
      }
    )
  }
}

/**
 * /api/v1/licenses/:license_id/accept Response
 */
interface AcceptLicenseResponse {
  user?: User
}