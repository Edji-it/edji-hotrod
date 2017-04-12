import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Locker } from 'angular2-locker';

@Injectable()
export class AuthService implements CanActivate {
    private baseUrl = "http://localhost:3354";
    public protocol = window.location.protocol ? window.location.protocol : '';
    private locker: Locker;
    private ENV: string = "dev";

    private user: any;
    private currentUserSource: BehaviorSubject<any>;
    private currentUser: Observable<any>;

    constructor(private http: Http, private _router: Router, _locker: Locker) {
        this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);

        this.user = this.getUser();
        this.currentUserSource = new BehaviorSubject<any>(this.user);
        this.currentUser = this.currentUserSource.asObservable();
        
        // Check to see if prod or dev environment
        if (window.location.host.indexOf('dev.edji.it') > -1) {
            //   baseUrl = "http://edji-dev.herokuapp.com";
            this.baseUrl = this.protocol + "//optimus-dev.edji.it";
            this.ENV = "dev";
        } else if (window.location.host.indexOf('edji.it') > -1 || window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1) {
            //   this.baseUrl = "http://edji-prod.herokuapp.com";
            this.baseUrl = this.protocol + "//optimus.edji.it";
            this.ENV = "prod";
        }
    }

    /** Provides environment variable to the rest of the app */
    public getEnv() {
        return this.ENV;
    }

    /** Give out options to any other http-using components or services */
    public getOptions(): RequestOptions {
        let header = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.getToken()
        });
        let options = new RequestOptions({
            headers: header,
            withCredentials: true
        }); // Create a request option
        return options;
    }

    public getUrl(): string {
        return this.baseUrl;
    }

    /**
     * Encodes javascript object into a URI component
     * @param obj The object to be encoded
     */
    public formEncode(obj: Object): string {
        var encodedString = '';
        for (var key in obj) {
            if (encodedString.length !== 0) {
                encodedString += '&';
            }
            encodedString += key + '=' + encodeURIComponent(obj[key]);
        }
        return encodedString.replace(/%20/g, '+');
    }

    /**
     * Takes a response object and turn the data into an object
     */
    public extractData(res: Response): any {
        let body = res.json();
        return body || {};
    }

    /**
     * Saves user to local storage
     * @param user The user should be an object to store in sessionstorage
     */
    public setUser(user: any) {
        //should have session timeout, username, baseProfileId, typeId
        user.isLoggedIn = true;
        this.currentUserSource.next(user);
        this.locker.set('user', user);
    }

    //TODO create deleteUser object

    /**
     * Gets user object from local storage
     */
    public getUser(): any {
        let user: any = this.locker.get('user');
        if (!user) {
            user = {
                _id: "",
                fullname: "guest",
                isLoggedIn: false
            }
            // this.setUser(user);
        } else {
            user.isLoggedIn = true;
        }

        return user;
    }

    public getCurrentUser(): Observable<any> {
        console.log(this.user);
        return this.currentUser;
    }

    /**
     * Updates User object
     * This pulls the latest user object in case a user has multiple sessions at once
     */
    public refreshUser(): Observable<any> {
        return this.http.get(this.baseUrl + '/users/' + this.user._id, this.getOptions())
            .map( res => {
                let data = res.json() || {}
                let user = data.user
                // If we get a user object, update our local copy
                if (user._id) {
                    this.setUser(user)
                }
                return user
            })
    }

    public setToken(token: any) {
        return this.locker.set('token', token);
    }

    public getToken(): any {
        return this.locker.get('token');
    }

    private destroyCredentials() {
        this.locker.clear();
        this.user = { isLoggedIn: false };
        this.currentUserSource.next(this.user);
    }

    /** Stores an object in local storage for you - your welcome */
    public store(key: string, value: any): void {
        if (key != "user" && key != "token") {
            this.locker.set(key, value);
        }
    }

    /** Gets an object from local storage */
    public getFromStorage(key: string): any {
        return this.locker.get(key);
    }

    /** Deletes things (not user or token) from local storage */
    public deleteFromStorage(key: string): void {
        if (key != "user" && key != "token") {
            this.locker.remove(key);
        }
    }

    login(user: any) {
        let data = {
            'user': {
                'username': user.username,
                'password': user.password
            }
        };

        return this.http
            .post(this.baseUrl + '/users/login', data, this.getOptions())
            .toPromise()
            .then(this.extractData);
    }

    logout() {
        this.destroyCredentials();
    }

    /**
     * Makes call to server in order to register a new user and set their local information
     * @returns observable which either has errors or an object which has properties: user, token
     */
    public register(user: any): Observable < any > {
        this.destroyCredentials();
        return this.http
            .post([this.baseUrl, 'users'].join('/'), {
                user: user
            }, this.getOptions())
            .map((data) => {
                let object = data.json();

                // if the response has a token, the user should be successfully registered and logged in
                if (object.token) {
                    this.setUser(object.user);
                    this.setToken(object.token);
                }

                return data.json();
            });
    }

    /**
     * Call to update user object
     * - Used primarily to update user preferences and documents
     * - Cannot be passed password
     */
    public updateUser(updatedUser: any): Observable<any> {
        console.log('updated user', updatedUser)
        return new Observable(observer => {
            //observer.next(true);  
            // Before we update the user, make sure we have the latest copy
            this.refreshUser().take(1)
                .subscribe(currentUser =>{
                    let mergedUser = Object.assign({}, currentUser)
                    
                    // Loop through and merge arrays
                    let propsToCheck = ['prefs', 'media']
                    for (let n = 0; n < propsToCheck.length; n++) {
                        let propA = propsToCheck[n]
                        for (let prop in mergedUser[propA]) {
                            if (mergedUser[propA][prop] && Object.prototype.toString.call(mergedUser[propA][prop]) === '[object Array]') {
                                console.log("found prop thats array")
                                if (updatedUser[propA] && updatedUser[propA][prop]) {
                                    mergedUser[propA][prop] = updatedUser[propA][prop].concat(mergedUser[propA][prop])
                                    let a = mergedUser[propA][prop]
                                    let isObj = typeof(mergedUser[propA][prop][0]) === 'object'

                                    // Clean out the duplicates we probably just concat'd in
                                    for(var i=0; i<a.length; i++) {
                                        for(var j = i + 1; j<a.length; j++) {
                                            if (isObj) {
                                                if (a[i]._id === a[j]._id) {
                                                    a.splice(j--, 1);
                                                }
                                            } else {
                                                if (a[i] === a[j]) {
                                                    console.log('delete duplicate')
                                                    a.splice(j--, 1);
                                                }
                                            }
                                        }
                                    }
                                    console.log("done: ", a)
                                }
                            }
                        }
                    }
                    console.log(mergedUser)

                    this.http.put( this.baseUrl + '/users', {
                            user: mergedUser
                        }, this.getOptions())
                        .map((data) => {
                            let object = data.json();

                            // if the response has a token, the user should be successfully registered and logged in
                            if (object.user) {
                                this.setUser(object.user);
                            }
                            if (object.token) {
                                this.setUser(object.token);
                            }

                            return data.json();
                        })
                        .toPromise()
                        .then( user => {
                            observer.next(user)
                        }, error => {
                            observer.error(error)
                        })
                }, 
                error => {
                    observer.error(error)
                    console.log(error)
                })
        });
    }

    /**
     * Calls to server, which creates a temp user object
     * @param username String value for the temp user's username, gets assigned to fullname property of TempUser model
     * @returns Observable object with user and token properties
     */
    public createTempUser(username: string): Observable < any > {
        let data = {
            user: {
                fullname: username
            }
        };

        return this.http.post([this.baseUrl, 'tempusers'].join('/'), data, this.getOptions())
            .map((data) => {
                let object: any = data.json();

                if (object.token) {
                    this.setUser(object.user);
                    this.setToken(object.token);
                }
                console.log(this.getOptions());
                return object;
            });
    }

    /**
     * There are two cases to use this call:
     *  1) User is logged in and resetting password => resetObject should be assigned properties oldPassword, newPassword
     *  2) User has a password recovery email => resetObject should be assigned properties: token, newPassword
     * @param resetObject Can have properties: oldPassword, newPassword, token
     * @returns Chainable promise resolved with json data containing either a user object & token or errors
     **/
    public resetPassword(resetObject: any) {
        return this.http
            .post(
                [this.baseUrl, 'users', 'reset_password'].join('/'), {
                    resetObject: resetObject
                },
                this.getOptions()
            )
            .toPromise()
            .then(this.extractData)
            .then((res) => {
                if (res.token && res.user) {
                    this.setUser(res.user);
                    this.setToken(res.token);
                }
                return res;
            });
    };

    public recoverPassword(username: string): Observable < boolean > {
        return this.http
            .post(
                [this.baseUrl, 'users', 'recover_password'].join('/'), {
                    username: username
                },
                this.getOptions()
            )
            .map((data) => {
                if (data.status === 204) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    /** Provides logic for sending user back to home if they are not authorized */
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!this.getUser().isLoggedIn) {
            this._router.navigate(['/home']);
            return false;
        } else {
            return true;
        }
    }
}