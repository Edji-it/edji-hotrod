import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from ".";
import { Observable } from "rxjs";
import { PublicUser } from "../shared/datatypes";
import { map } from "rxjs/operators";
import { Store, createAction } from "@ngrx/store";
import { PublicUsersState } from "../_reducers/user-details.reducers";


@Injectable()
export class UserDetailsService {
  // User details dictionary
  private usersById: { [id: string]: PublicUser } = {}
  // public userByIdObs: { }


  constructor(private _http: HttpClient, private _auth: AuthService, private store: Store<PublicUsersState>) { }


  /**
   * Returns user information for student_ids and temp_ids on the project
   * @param student_ids array of student ids
   * @param temp_ids array of temp user ids
   */
  public getUserDetails(students_ids?: any[], temp_ids?: any[]): Observable<any> {
    let search_params: string = ''
    // if the students_ids is already converted to the leaderboard-friendly format, strip it out and use _ids only
    if (students_ids.length > 0 && students_ids[0].hasOwnProperty('_id')) {
      let length = students_ids.length
      for (var i = 0; i < length; i++) {
        students_ids[i] = students_ids[i]._id
      }
    }
    // if the students_ids is already converted to the leaderboard-friendly format, strip it out and use _ids only
    if (temp_ids.length > 0 && temp_ids[0].hasOwnProperty('_id')) {
      let length = temp_ids.length
      for (var i = 0; i < length; i++) {
        temp_ids[i] = temp_ids[i]._id
      }
    }
    // Attach student ids to query string
    search_params = this.arrayParamsToString('students_ids[]', students_ids, search_params)
    // Attach temp ids to query string
    search_params = this.arrayParamsToString('temp_ids[]', temp_ids, search_params)

    return this._http.get(this._auth.getUrl() + '/api/v1/users/public-details?' + search_params, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this._auth.getToken(),
      }),
    })
      .pipe(map(userInfo => {
        let users = userInfo['users']

        // Update user details state
        users.forEach(user => {
          this.cachePublicUser(user)
        })

        return users
      }))
  }

  cachePublicUser(user: PublicUser) {
    if (!user.initials) {
      let splitFull = user.fullname.split(' ')
      user.initials = splitFull[0][0] + (splitFull[1] ? splitFull[1][0] : '')
    }

    // add logic for avatar display

    this.usersById[user._id] = user


  }

  /**
   * Generate query params string from array
   * @param key param key string
   * @param array array of string values to be used as param values
   * @param init_string query string to attach values to
   */
  public arrayParamsToString(key: string, array: string[], init_string?: string): string {
    let len: number = array.length
    let query_string: string = init_string || ''
    for (var i = 0; i < len; i++) {
      if (query_string.length > 0) {
        query_string += '&' + key + '=' + array[i]
      } else {
        query_string = key + '=' + array[i]
      }
    }
    return query_string
  }

}