import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router'
import { Observable, BehaviorSubject, Subject } from 'rxjs'
import { map, take, catchError } from 'rxjs/operators'
import { HttpClient, HttpHeaders } from '@angular/common/http'

// Project Dependencies
import { User } from '../shared/datatypes'
import { URLSearchParams } from '@angular/http/src/url_search_params'
import { Angulartics2 } from 'angulartics2'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'
import { LockerService } from '../_services/locker.service'

import { environment } from '../../environments/environment'
import { AcademyService } from './academy.service'
const { version: appVersion } = require('../../../package.json')

declare var gtag: any

@Injectable()
export class AuthService implements CanActivate {
  /*
    Last Mod: 6.27.17

    Edit user prefs from here. Everything under the datatype User should be edited through here.
    */

  private pipoBaseUrl = '//pipo-dev.edji.it'
  private flakBaseUrl = '//flak-dev.edji.it'
  private baseUrl = 'http://localhost:3354'
  private ENV: string = 'dev'

  //NOTE: (6/15/17) If this.user ever needs to be edited it, make a copy, edit the copy, THEN assign it so this.user is always fresh.
  private user: User
  private currentUserSource: BehaviorSubject<any>
  public currentUser: Observable<any>

  private academyState: AcademyState = {}
  private academyStateSource: BehaviorSubject<AcademyState>
  public currentAcademyState: Observable<AcademyState>

  // Clear observables/in-memory objects in services
  private clearAllSource: Subject<boolean> = new Subject()
  public clearAll: Observable<boolean>

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _locker: LockerService,
    private ga: Angulartics2GoogleAnalytics,
    private route: ActivatedRoute,
  ) {
    let buildEnv = environment.ENV

    this.clearAll = this.clearAllSource.asObservable()

    this.user = this.getUser()
    // Initalize Analytics user
    this.updateAnalyticsUser(this.user)
    this.currentUserSource = new BehaviorSubject<any>(this.user)
    this.currentUser = this.currentUserSource.asObservable()

    this.academyState = this._locker.get('academyState') || {}
    this.academyStateSource = new BehaviorSubject<any>(this.academyState)
    this.currentAcademyState = this.academyStateSource.asObservable()

    // Check to see if prod or dev environment
    if (window.location.host.indexOf('local.edji.it') > -1) {
      // do nothing
    } else if (window.location.host.indexOf('dev.edji.it') > -1 || buildEnv === 'test') {
      this.pipoBaseUrl = '//pipo-dev.edji.it'
      this.baseUrl = '//optimus-dev.edji.it'
      this.ENV = 'dev'
    } else if (
      window.location.host.indexOf('edji.it') > -1 ||
      window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1
    ) {
      this.pipoBaseUrl = '//pipo.edji.it'
      this.flakBaseUrl = '//flak.edji.it'
      this.baseUrl = '//optimus.edji.it'
      this.ENV = 'prod'
    }
  }

  /** Provides environment variable to the rest of the app */
  public getEnv() {
    return this.ENV
  }

  /** Give out options to any other http-using components or services */
  public getOptions(): { headers?: HttpHeaders; withCredentials?: boolean } {
    let options = {
      headers: this.getHeaders(),
      withCredentials: true,
    } // Create a request option
    return options
  }

  /**
   * Return default authorization headers
   */
  public getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.getToken(),
    })
  }

  public getUrl(): string {
    return this.baseUrl
  }

  /**
   * Returns the base url for the pipo server
   */
  public getPipoUrl(): string {
    return this.pipoBaseUrl
  }

  /**
   * Encodes javascript object into a URI component
   * @param obj The object to be encoded
   */
  public formEncode(obj: Object): string {
    var encodedString = ''
    for (var key in obj) {
      if (encodedString.length !== 0) {
        encodedString += '&'
      }
      encodedString += key + '=' + encodeURIComponent(obj[key])
    }
    return encodedString.replace(/%20/g, '+')
  }

  /**
   * Saves user to local storage
   * @param user The user should be an object to store in sessionstorage
   * @returns user Returns decorated user if needed immediately
   */
  public setUser(user: User): User {
    //should have session timeout, username, baseProfileId, typeId
    user.isLoggedIn = true
    // Set convenience "isStudent" flag
    // + Default guest/temp to student flag
    if (
      user.type === 'temp' ||
      (user.identities &&
        user.identities.includes('student') &&
        !['teacher', 'administrator'].some(id => user.identities.includes(id))) // checks if they're anything in the array
    ) {
      user.isStudent = true
    }
    // Determine if user is an Academy Admin
    if (user && user.license_ids && user.license_ids[0]) {
      this.fetchAcademies(user)
    }
    //  Store user object
    this.currentUserSource.next(user)
    this._locker.set('user', user)
    // Update Analytics
    this.updateAnalyticsUser(user)
    return user
  }

  private updateAnalyticsUser(user): void {
    // Ignore if google site tag object is not available
    if (!gtag) {
      return
    }
    if (user._id && user._id.length > 0) {
      // Use Global Site Tag to set user id directly
      gtag('set', 'user_id', user._id)
    } else {
      gtag('set', 'user_id', '')
    }
  }

  /**
   * Retrieve academy objects
   * @description Updates ACADEMY OBSERVABLE and user's isAcademyAdmin property
   */
  private fetchAcademies(user: User): void {
    // Fetch license and academy information for admins and owners
    this._http
      .get<any>(this.getUrl() + '/api/v1/licenses', { headers: this.getHeaders() })
      .pipe(take(1))
      .subscribe(
        data => {
          // Attach properties for Academy users
          if (data.licenses) {
            let licenseCount = data.licenses.length
            let academies = []
            for (let i = 0; i < licenseCount; i++) {
              let license = data.licenses[i]
              license.roles.forEach(roleObj => {
                // Detect Admin
                if (roleObj.role === 'owner' || roleObj.role === 'administrator') {
                  user.isAcademyAdmin = true
                }
              })
              // Attach academies to user
              academies.push(license.owning_institution)
            }
            this.setAcademies(academies)
          }
          this.currentUserSource.next(user)
          this._locker.set('user', user)
        },
        err => {
          // Fetch academy information for teacher (non-admin) users
          if (err.status == 404 && user.institution_ids && user.institution_ids[0]) {
            this._http
              .get<any>(this.getUrl() + '/api/v1/institutions/' + user.institution_ids[0], {
                headers: this.getHeaders(),
              })
              .pipe(take(1))
              .subscribe(data => {
                let academy = data.institution
                if (academy) {
                  let academies = [academy]
                  this.setAcademies(academies)
                }
              })
          } else {
            console.error(err)
          }
        },
      )
  }

  /**
   * Save academies to user object
   * @description sets array of Academies, and resets selected to 0
   * @param academies
   */
  private setAcademies(academies: any[]): void {
    let academyState = this.academyStateSource.value
    academyState.academies = academies
    // Reset to first academy
    academyState.selected = 0
    // Update academyState stores
    this.academyStateSource.next(academyState)
    this._locker.set('academyState', academyState)
  }

  /**
   * Select current academy
   * Select users current institution (saved as an index)
   * @param academyIndex index of academy to select
   */
  public setCurrentAcademy(academyIndex: number) {
    let academyState = this.academyStateSource.value
    if (academyState.academies && academyState.academies[academyIndex]) {
      academyState.selected = academyIndex
      // Update academyState stores
      this.academyStateSource.next(academyState)
      this._locker.set('academyState', academyState)
    }
  }

  //TODO create deleteUser object

  /**
   * Gets user object from local storage
   */
  public getUser(): User {
    let user: User = this._locker.get('user')
    if (!user) {
      // this kind of navigates around our interface... but oh well
      user = <User>{
        _id: '',
        fullname: 'guest',
        isLoggedIn: false,
      }
      // this.setUser(user)
    } else {
      user.isLoggedIn = true
    }

    return user
  }

  public getCurrentUser(): Observable<User> {
    return this.currentUser
  }

  /**
   * Updates User object
   * This pulls the latest user object in case a user has multiple sessions at once
   */
  public refreshUser(): Observable<any> {
    return this._http.get(this.baseUrl + '/users/' + this.getUser()._id, this.getOptions()).pipe(
      map((data: any) => {
        let user = data.user
        // If we get a user object, update our local copy
        if (user._id) {
          user = this.setUser(user)
        }
        return user
      }),
    )
  }

  public setToken(token: any) {
    return this._locker.set('token', token)
  }

  public getToken(): any {
    return this._locker.get('token') || ''
  }

  private destroyCredentials() {
    this._locker.clear()
    this.user = <User>{ isLoggedIn: false }
    this.currentUserSource.next(this.user)
    this.setAcademies([])
  }

  /**
   * Log in a user
   * @param loginCredentials username and password
   */
  login(loginCredentials: any) {
    let data = {
      user: {
        username: loginCredentials.username,
        password: loginCredentials.password,
      },
    }

    return this._http.post(this.baseUrl + '/api/v1/users/login', data, { headers: this.getHeaders() }).pipe(
      map((data: any) => {
        if (data.token) {
          this.setToken(data.token)
          data.user = this.setUser(data.user)
        }
        return data
      }),
    )
  }

  /**
   * Log out user
   * @param noReload ONLY use when user is expected to immediately log in to another account
   */
  logout(noReload?: boolean) {
    this.destroyCredentials()
    // Refresh window to clear components/services
    if (!noReload) {
      // Clear service in-memory objects
      this.clearAllSource.next(true)
      // Return to homepage
      this._router.navigate(['/home'])
    }
  }

  /**
   * Makes call to server in order to register a new user and set their local information
   * @returns observable which either has errors or an object which has properties: user, token
   */
  public register(user: any): Observable<any> {
    this.destroyCredentials()
    return this._http
      .post(
        [this.baseUrl, 'users'].join('/'),
        {
          user: user,
        },
        this.getOptions(),
      )
      .pipe(
        map((data: any) => {
          // if the response has a token, the user should be successfully registered and logged in
          if (data.token) {
            data.user = this.setUser(data.user)
            this.setToken(data.token)
          }

          return data
        }),
      )
  }

  /**
   * Link Oauth to an existing account
   */
  public linkOauth(oauthType: string, oauthToken: string): Observable<any> {
    return this._http.put(
      `${this.baseUrl}/api/v1/users/@me/link?oauth_type=${oauthType}&oauth_token=${oauthToken}`,
      {},
      { headers: this.getHeaders() },
    )
  }

  /**
   * Call to update user object
   * - Used primarily to update user preferences and document
   * - Cannot be passed password
   * - NOTE: Prevents user from being outright replaced, and merges instead of overwrites.
   */
  public updateUser(updatedUser: any): Observable<any> {
    return new Observable(observer => {
      //observer.next(true)
      // Before we update the user, make sure we have the latest copy
      this.refreshUser()
        .pipe(take(1))
        .subscribe(
          currentUser => {
            let mergedUser = Object.assign({}, currentUser)

            // Loop through and merge arrays
            let propsToCheck = ['prefs', 'media']
            for (let n = 0; n < propsToCheck.length; n++) {
              let propA = propsToCheck[n]
              for (let prop in mergedUser[propA]) {
                if (
                  mergedUser[propA][prop] &&
                  Object.prototype.toString.call(mergedUser[propA][prop]) === '[object Array]'
                ) {
                  if (updatedUser[propA] && updatedUser[propA][prop]) {
                    mergedUser[propA][prop] = updatedUser[propA][prop].concat(mergedUser[propA][prop])
                    let a = mergedUser[propA][prop]
                    let isObj = typeof mergedUser[propA][prop][0] === 'object'

                    // Clean out the duplicates we probably just concat'd in
                    for (var i = 0; i < a.length; i++) {
                      for (var j = i + 1; j < a.length; j++) {
                        if (isObj) {
                          if (a[i]._id === a[j]._id) {
                            a.splice(j--, 1)
                          }
                        } else {
                          if (a[i] === a[j]) {
                            a.splice(j--, 1)
                          }
                        }
                      }
                    }
                  }
                } else if (mergedUser[propA][prop] && updatedUser[propA]) {
                  mergedUser[propA][prop] = updatedUser[propA][prop]
                }
              }
            }

            // merge all the simpler properties
            for (let prop in updatedUser) {
              if (propsToCheck.indexOf(prop) < 0) {
                mergedUser[prop] = updatedUser[prop]
              }
            }

            // This is repeated code from forceUpdateDocuments() we could consolidate these. 6.14.
            this._http
              .put(
                this.baseUrl + '/users',
                {
                  user: mergedUser,
                },
                this.getOptions(),
              )
              .pipe(
                map((data: any) => {
                  // if the response has a token, the user should be successfully registered and logged in
                  if (data.user) {
                    data.user = this.setUser(data.user)
                  }
                  if (data.token) {
                    this.setToken(data.token)
                  }

                  return data
                }),
              )
              .toPromise()
              .then(
                user => {
                  observer.next(user)
                },
                error => {
                  observer.error(error)
                },
              )
          },
          error => {
            observer.error(error)
            console.error(error)
          },
        )
    })
  }

  /*
    6.15.17
    Update media.documents in user, returns a User object. Use for deleting PDF's in upload-pfd.modal.component
    We delete a PDF through front end magic since things are stored in AWS, no need to do a server call.
    - We use this to update it since updateUser only merges things together.
    - This properly replaces the contents of user, but ONLY the media.documents.
    - Insert the new set that you want to replace media.documents with.
    */
  public forceUpdateDocuments(newDocs: any[]): Observable<any> {
    // console.log("ran the baby")

    // We want to return an Observable because those are handy for timing's sake, so let's do that.
    return new Observable(observer => {
      this.refreshUser()
        .pipe(take(1))
        .subscribe(
          currentUser => {
            // Make a copy of the user object, edit it, and shove it in.
            let mergedUser = Object.assign({}, currentUser) // Get the latest copy of the user object.
            mergedUser.media.documents = newDocs // let's just shove those in there
            this.user = mergedUser // NOTE: We make a new object and assign it so that the user object is always nice and fresh.

            /* some handy console logs in case everything dies
                    console.log("User is: " + mergedUser.username)
                    this.user.media.documents.forEach((doc) => {
                        console.log(doc)
                    })
                    */

            // Let's save this here user object.
            // This is repeated code from updateUser() we could consolidate these. (6.14.17)
            this._http
              .put(
                this.baseUrl + '/users',
                {
                  user: mergedUser,
                },
                this.getOptions(),
              )
              .pipe(
                map((data: any) => {
                  // if the response has a token, the user should be successfully registered and logged in
                  if (data.user) {
                    data.user = this.setUser(data.user)
                  }
                  if (data.token) {
                    this.setToken(data.token)
                  }

                  return data
                }),
              )
              .toPromise()
              .then(
                user => {
                  observer.next(user)
                },
                error => {
                  observer.error(error)
                  console.error('Failed in forceUpdateDocuments in auth.service.ts when trying to save the user.')
                },
              )
            // console.log("got over here")
            // this.user = mergedUser
          },
          error => {
            observer.error(error)
            console.error(error)
            console.error('Failed in forceUpdateDocuments in auth.service.ts')
          },
        )
    })
  } // public forceUpdatedDocuments (any[] : newDocs) : Observable<any>

  /*
    25 June 2017
    Nick Pumper

    Overwrite the current avatar stored under the user object.
    */
  public forceUpdateAvatar(newAvatar: string): Observable<any> {
    // We want to return an Observable because those are handy for timing's sake, so let's do that.
    return new Observable(observer => {
      this.refreshUser()
        .pipe(take(1))
        .subscribe(
          currentUser => {
            // Make a copy of the user object, edit it, and shove it in.
            let mergedUser = Object.assign({}, currentUser) // Get the latest copy of the user object.
            mergedUser.avatar = newAvatar // let's just shove those in there
            this.user = mergedUser // NOTE: We make a new object and assign it so that the user object is always nice and fresh.

            // This code saves this here user object.
            // This is repeated code from updateUser() we could consolidate these. (6.27.17)
            this._http
              .put(
                this.baseUrl + '/users',
                {
                  user: mergedUser,
                },
                this.getOptions(),
              )
              .pipe(
                map((data: any) => {
                  // if the response has a token, the user should be successfully registered and logged in
                  if (data.user) {
                    data.user = this.setUser(data.user)
                  }
                  if (data.token) {
                    this.setToken(data.token)
                  }

                  console.log(this.user.avatar)

                  return data
                }),
              )
              .toPromise()
              .then(
                user => {
                  observer.next(user)
                },
                error => {
                  observer.error(error)
                  console.error('Failed in forceUpdateDocuments in auth.service.ts when trying to save the user.')
                },
              )
          },
          error => {
            observer.error(error)
            console.error(error)
            console.error('Failed in forceUpdateAvatar in auth.service.ts')
          },
        ) // subscribe / error
    })
  } // public forceUpdateAvatar (newAvatar : File)

  /**
   * Calls to server, which creates a temp user object
   * @param username String value for the temp user's username, gets assigned to fullname property of TempUser model
   * @returns Observable object with user and token properties
   */
  public createTempUser(username: string): Observable<any> {
    let data = {
      user: {
        fullname: username,
      },
    }

    return this._http.post([this.baseUrl, 'tempusers'].join('/'), data, this.getOptions()).pipe(
      map((data: any) => {
        if (data.token) {
          data.user = this.setUser(data.user)
          this.setToken(data.token)
        }
        console.log(this.getOptions())
        return data
      }),
    )
  }

  /**
   * This is only used for:
   *  1) User is logged in and resetting password => resetObject should be assigned properties oldPassword, newPassword
   * @param resetObject Can have properties: oldPassword, newPassword
   * @returns Chainable promise resolved with json data containing either a user object & token or errors
   **/
  public resetPassword(resetObject: any) {
    return this._http
      .post(
        [this.baseUrl, 'users', 'reset_password'].join('/'),
        {
          resetObject: resetObject,
        },
        this.getOptions(),
      )
      .toPromise()
      .then((data: any) => {
        if (data.token && data.user) {
          data.user = this.setUser(data.user)
          this.setToken(data.token)
        }
        return data
      })
  }

  /**
   * There are two cases to use this call:
   *  1) User is logged in and resetting value => resetObject should be assigned properties type, newValue
   *  2) User has a recovery email => resetObject should be assigned properties: token, newValue
   * Call is flexible to handle resetting of any field the server deems able
   * @param resetObject Can have properties: type (reset type), token, newValue (new password, email, etc)
   * @returns Chainable promise resolved with json data containing either a user object & token or errors
   **/
  public resetProperty(resetObject: RedeemTokenObj): Observable<any> {
    // We check if the user is logged in because we'll pass the authToken if they are
    let user = this.getUser()
    let newHeaders: HttpHeaders
    // If user is logged in and changing a property other than password, pass Auth
    // Otherwise, we want to avoid the potential of a user changing another user's password
    if (user.isLoggedIn && resetObject.type !== 'password') {
      newHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      })
    } else {
      newHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }

    return this._http.post<any>(
      this.baseUrl +
        '/api/v1/users/tokens/' +
        resetObject.type +
        '/' +
        resetObject.token +
        '/?user_id=' +
        resetObject.userId,
      { [resetObject.type]: resetObject.newValue },
      {
        headers: newHeaders,
      },
    )
  }

  /**
   * Recover Password
   * - Used for "forgotten" passwords while not logged in
   * @params resetUser simple object with either username or email
   * @returns HttpClient observable
   */
  public recoverPassword(resetUser: { username?: string; email?: string }): Observable<boolean> {
    // need to pass in the correct user search
    let userInfo: string
    if (resetUser.username) {
      userInfo = 'username=' + encodeURIComponent(resetUser.username)
    } else if (resetUser.email) {
      userInfo = 'email=' + encodeURIComponent(resetUser.email)
    }

    return this._http.get<any>(this.baseUrl + '/api/v1/users/tokens/password?' + userInfo, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    })
  }

  /** Call to convert a temp user's properties to the current user (who should already have credentials) */
  public convertTempUser(oldId: string): Observable<boolean> {
    return this._http
      .put([this.baseUrl, 'api', 'v1', 'temp_users', 'convert', oldId].join('/'), {}, this.getOptions())
      .pipe(
        map(res => {
          if (res) {
            return true
          } else {
            throw new Error('Did not get json response from convertTempUser')
          }
        }),
      )
  }

  /**
   * Return array of allowed comment media types
   */
  public getAllowedCommentMediaTypes(): string[] {
    this.user = this.getUser()
    return ['emoji', 'text', 'audio']
  }

  /** Provides logic for sending user back to home if they are not authorized */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let user: User = this.getUser()
    if (!user.isLoggedIn) {
      /**
       * Query Params
       * - We use the homepage as a landing page
       * - Additional query params can be added to customize a user's landing experience
       */
      if (route.queryParams['r']) {
        this._router.navigate(['/register'], { queryParams: { referral_id: route.queryParams['r'] } })
      } else {
        this._router.navigate(['/home'])
      }
      return false
    } else if (user.type === 'temp') {
      // Redirect temp users away from certain pages
      if (state.url.includes('/account') || state.url.includes('/new-reading')) {
        this._router.navigate(['/register'], { queryParams: { userId: user._id } })
      } else {
        return true
      }
    } else {
      return true
    }
  }

  /**
   * Submit payment and subscription type to add plan to user
   */
  public subscribeToHero(stripeToken, couponCode?: string): Observable<HeroCreateResponse> {
    let data = {
      token: stripeToken,
    }
    if (couponCode) {
      data['couponCode'] = couponCode
    }

    return this._http.post<HeroCreateResponse>(this.baseUrl + '/api/v1/stripe/subscriptions', data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      }),
    })
  }

  public validateHeroCoupon(couponCode: string): Observable<any> {
    return this._http.get(this.baseUrl + '/subscriptions/coupons/' + couponCode, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      }),
    })
  }

  public updateHeroSub(subscriptionType: string, statusChange?: string) {
    if (!statusChange) {
      statusChange = 'subscribed'
    }
    let data = {
      subscription_type: subscriptionType,
      status: statusChange,
    }

    return this._http.put(this.baseUrl + '/api/v1/subscriptions', data, this.getOptions())
  }

  public cancelHeroSubscription(): Observable<any> {
    return this._http
      .delete<any>(this.baseUrl + '/api/v1/stripe/subscriptions/', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.getToken(),
        }),
      })
      .pipe(
        map(res => {
          return res || {}
        }),
      )
  }

  public getUserWithAuthToken(type: string, token: string): Observable<LoginObject> {
    return this._http
      .get<GetWithAuthTokenResponse>(this.baseUrl + '/users?oauth_type=' + type + '&oauth_token=' + token)
      .pipe(
        map(res => {
          this.setToken(res.token)
          this.setUser(res.user)
          return res
        }),
      )
  }

  /**
   * Follow
   * - Add user to user's Following array
   * - Updates user object
   */
  public followUser(userId: string): Observable<any> {
    return this._http
      .put(this.baseUrl + '/users/following', { user_id: userId, action: 'follow' }, this.getOptions())
      .pipe(
        map((data: any) => {
          let user = data.user || {}
          if (user._id) {
            this.setUser(user)
          }
          return user
        }),
      )
  }

  /**
   * Unfollow
   * - Removes a user from user's Following array
   * - Updates user object
   */
  public unfollowUser(userId: string): Observable<any> {
    return this._http
      .put(this.baseUrl + '/users/following', { user_id: userId, action: 'unfollow' }, this.getOptions())
      .pipe(
        map((data: any) => {
          let user = data.user || {}
          if (user._id) {
            this.setUser(user)
          }
          return user
        }),
      )
  }
  public oauthLogin(type: string): void {
    // Store the route the user was at prior to logging in with oauth because we lose it once we login with other services like google
    let activeRoute = this.route.snapshot['_routerState'].url

    if (
      activeRoute.indexOf('register') === -1 &&
      activeRoute.indexOf('login') === -1 &&
      activeRoute.indexOf('hero') === -1
    ) {
      this._locker.set('oauthRedirect', activeRoute)
    }
    window.location.href = [this.baseUrl, 'api/v1/auth', type].join('/')
  }

  /**
   * Gets the existing user who referred the new user
   * @param referral_id is the referral id we'll be searching by to find the user
   */
  public getUserByReferralId(referral_id: any): Observable<any> {
    return this._http.get(this.baseUrl + '/api/v1/referrals/' + referral_id, this.getOptions()).pipe(
      map((data: any) => {
        let user = data.user
        return user
      }),
      catchError(err => {
        return err
      }),
    )
  }

  /**
   * Ask the db how many users the current user has referred
   * @param userId is the user id for the current user
   */
  public getReferralProgress(userId: string): Observable<any> {
    return this._http.get(this.getUrl() + '/api/v1/users/' + userId + '/referrals', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      }),
    })
  }

  /**
   * Returns user information for student_ids and temp_ids on the project
   * @param student_ids array of student ids
   * @param temp_ids array of temp user ids
   */
  public getUserInfoByProject(students_ids?: any[], temp_ids?: any[]): Observable<any> {
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

    return this._http.get(this.getUrl() + '/api/v1/users/public-details?' + search_params, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      }),
    })
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

  /**
   * sets the Analytics event category
   */
  public setAnalyticEventCategory(): string {
    let user = this.getUser()
    let userType = ''
    let identity = ''
    let subscription = ''
    // set the user type
    if (!user.isLoggedIn || user.type === 'temp') {
      userType = 'guest'
    } else if (this.user.hero_status) {
      userType = 'hero'
    } else {
      userType = 'regular'
    }
    // set the user identity (teacher, admin, student, other)
    identity = this.getPrimaryUserIdentity()
    // set the subscription (hero academy, hero, sidekick)
    subscription = this.getPrimarySubscription()
    return userType + '_' + identity + '_' + subscription
  }

  /**
   * returns the user's primary identity based on the identities array
   */
  public getPrimaryUserIdentity(): string {
    let user = this.getUser()
    if (!user.isLoggedIn) {
      return 'new'
    }
    if (user.identities && user.identities.includes('administrator')) {
      return 'admin'
    } else if (user.identities && user.identities.includes('teacher')) {
      return 'teacher'
    } else if (user.identities && user.identities.includes('student')) {
      return 'student'
    } else {
      return 'other'
    }
  }

  /**
   * returns the primary subscription for the user
   */
  public getPrimarySubscription(): string {
    let user = this.getUser()
    if (!user.isLoggedIn) {
      return 'recruit'
    }
    if (user.institution_ids && user.institution_ids.length > 0 && user.hero_status) {
      return 'heroAcademy'
    } else if (user.hero_status) {
      return 'hero'
    } else {
      return 'sidekick'
    }
  }

  public setAnalyticEventLabel(): string {
    let user = this.getUser()
    if (user._id) {
      if (user && user.school && user.school.district_name) {
        return user._id + '_' + appVersion + '_' + user.school ? user.school.district_name : appVersion
      } else {
        return user._id + '_' + appVersion
      }
    } else {
      return 'new' + '_' + appVersion
    }
  }

  /**
   * Returns customer information including subscriptions, but not payment source
   * @param customer_id the customer ID from Stripe that we store on the user object
   */
  public getStripeCustomer(): Observable<any> {
    return this._http
      .get<any>(this.baseUrl + '/api/v1/stripe/customers/', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.getToken(),
        }),
      })
      .pipe(
        map(customer => {
          return customer.customer
        }),
      )
  }

  /**
   * Returns customer information including subscriptions, but not payment source
   * @param customer_id the customer ID from Stripe that we store on the user object
   */
  public getStripeSubscriptions(): Observable<any> {
    return this._http
      .get<any>(this.baseUrl + '/api/v1/stripe/subscriptions/', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.getToken(),
        }),
      })
      .pipe(
        map(subscriptions => {
          return subscriptions.subscriptions
        }),
      )
  }

  /**
   * Reverses the cancellation in Stripe - only for active subscriptions
   * New subscriptions need to route through the subscribeToHero method
   */
  public rejoinHero(subscription_id: string): Observable<any> {
    return this._http
      .put<any>(
        this.baseUrl + '/api/v1/stripe/subscriptions/' + subscription_id,
        {},
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.getToken(),
          }),
        },
      )
      .pipe(
        map(res => {
          return res
        }),
      )
  }

  // Stripe sends the date back as the UTC Epoch, so we'll convert it here
  public getStripeDate(utcSeconds: number): Date {
    let date = new Date(0)
    date.setUTCSeconds(utcSeconds)
    return date
  }

  /**
   * Searches for a school or district and returns a list from the NCES data set
   * @param searchText is the text string passed in that we want to search with flak
   */
  public getSchoolDistrict(searchText: string): Observable<any> {
    searchText = encodeURIComponent(searchText)
    return this._http
      .get<any>(this.flakBaseUrl + `/schools?school_name=${searchText}&district=${searchText}&fuzziness=2`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map(res => {
          return res.hits.hits
        }),
      )
  }
}

interface LoginObject {
  user: User
  token: string
}

interface HeroCreateResponse {
  subscription: any
  user: User
}

interface GetWithAuthTokenResponse {
  token: string
  user: User
}

export interface AcademyState {
  academies?: Academy[]
  selected?: number
}

export interface Academy {
  name?: string
  abbreviation?: string
  _id?: string
}

interface RedeemTokenObj {
  newValue: string
  type: string
  userId: string
  token: string
}
