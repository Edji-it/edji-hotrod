import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Locker } from 'angular2-locker';

import { User } from './datatypes'

@Injectable()
export class AuthService implements CanActivate {

    /*
    Last Mod: 6.27.17

    Edit user prefs from here. Everything under the datatype User should be edited through here.
    */

    private baseUrl = "http://localhost:3354";
    public protocol = window.location.protocol ? window.location.protocol : '';
    private locker: Locker;
    private ENV: string = "dev";

    //NOTE: (6/15/17) If this.user ever needs to be edited it, make a copy, edit the copy, THEN assign it so this.user is always fresh.
    private user: User; 
    private currentUserSource: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    /**
     * Global Feature Flag object
     * - Keep updated when flags are added or removed, for reference
     * - Update via url param subscriptions inside of relevant components
     */
    public secretSwitches = {
        heroAvailable : false
    }

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
    public getUser(): User {
        let user: User = this.locker.get('user');
        if (!user) {
            // this kind of navigates around our interface... but oh well
            user = <User>{
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

    public getCurrentUser(): Observable<User> {
        return this.currentUser;
    }

    /**
     * Updates User object
     * This pulls the latest user object in case a user has multiple sessions at once
     */
    public refreshUser(): Observable<any> {
        return this.http.get(this.baseUrl + '/users/' + this.getUser()._id, this.getOptions())
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
        this.user = <User>{ isLoggedIn: false }
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
     * - Used primarily to update user preferences and document
     * - Cannot be passed password
     * - NOTE: Prevents user from being outright replaced, and merges instead of overwrites.
     */
    public updateUser(updatedUser: any): Observable<any> {
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
                                                    a.splice(j--, 1);
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

                    // This is repeated code from forceUpdateDocuments() we could consolidate these. 6.14.
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
                    console.error(error)
                })
        });
    }

    /*
    6.15.17
    Update media.documents in user, returns a User object. Use for deleting PDF's in upload-pfd.modal.component
    We delete a PDF through front end magic since things are stored in AWS, no need to do a server call.
    - We use this to update it since updateUser only merges things together.
    - This properly replaces the contents of user, but ONLY the media.documents.
    - Insert the new set that you want to replace media.documents with.
    */
    public forceUpdateDocuments (newDocs : any[]) : Observable<any> {
        // console.log("ran the baby");

        // We want to return an Observable because those are handy for timing's sake, so let's do that.
        return new Observable(observer => {
            this.refreshUser().take(1)
                .subscribe(currentUser =>{
                    // Make a copy of the user object, edit it, and shove it in.
                    let mergedUser = Object.assign({}, currentUser)// Get the latest copy of the user object.
                    mergedUser.media.documents = newDocs; // let's just shove those in there
                    this.user = mergedUser; // NOTE: We make a new object and assign it so that the user object is always nice and fresh.
                
                    /* some handy console logs in case everything dies
                    console.log("User is: " + mergedUser.username);
                    this.user.media.documents.forEach((doc) => {
                        console.log(doc);
                    });
                    */
                    
                    // Let's save this here user object.
                    // This is repeated code from updateUser() we could consolidate these. (6.14.17)
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
                            console.error("Failed in forceUpdateDocuments in auth.service.ts when trying to save the user.");
                        })
                    // console.log("got over here");
                    // this.user = mergedUser;
                },
                error => {
                    observer.error(error)
                    console.error(error)
                    console.error("Failed in forceUpdateDocuments in auth.service.ts");
                })
        });
    } // public forceUpdatedDocuments (any[] : newDocs) : Observable<any>

    /*
    25 June 2017
    Nick Pumper

    Overwrite the current avatar stored under the user object.
    */
    public forceUpdateAvatar (newAvatar : string) : Observable<any> {
        // We want to return an Observable because those are handy for timing's sake, so let's do that.
        return new Observable(observer => {
            this.refreshUser().take(1)
            .subscribe(currentUser =>{
                // Make a copy of the user object, edit it, and shove it in.
                let mergedUser = Object.assign({}, currentUser);// Get the latest copy of the user object.
                mergedUser.avatar = newAvatar; // let's just shove those in there
                this.user = mergedUser; // NOTE: We make a new object and assign it so that the user object is always nice and fresh.

                // This code saves this here user object.
                // This is repeated code from updateUser() we could consolidate these. (6.27.17)
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
                        this.setToken(object.token);
                    }

                    console.log(this.user.avatar);

                    return data.json();
                })
                .toPromise()
                .then( user => {
                    observer.next(user)
                }, error => {
                    observer.error(error)
                    console.error("Failed in forceUpdateDocuments in auth.service.ts when trying to save the user.");
                })
            },
            error => {
                observer.error(error)
                console.error(error)
                console.error("Failed in forceUpdateAvatar in auth.service.ts");
            }) // subscribe / error
        });
    } // public forceUpdateAvatar (newAvatar : File) 

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

    /** Call to convert a temp user's properties to the current user (who should already have credentials) */
    public convertTempUser(oldId: string): Observable<boolean> {
        return this.http.put(
            [this.baseUrl, 'users', 'convert', oldId].join("/"),
            {},
            this.getOptions()
            )
        .map((res) => {
            if (res) {
                return true
            } else {
                throw new Error("Did not get json response from convertTempUser")
            }
        })
    }

     /**
     * Add users interested in Hero to the Mailchimp Hero update list
     */
    public addToHeroList(user) {
        let body = user
        body['list'] = 'hero'
        return this.http.post( this.baseUrl + '/mailchimp/add', body, this.getOptions())
            .map( res => {
                return res.json()
            })
    }
    
    /**
     * Add users who subscribe to Hero to the Mailchimp Hero Subscribed list
     */
    public addToActiveHeroList(user) {
        let spaceIndex = user.fullname.indexOf(' ')
        if (spaceIndex < 0) { spaceIndex = user.fullname.length }
        let fname = user.fullname.substr(0,spaceIndex)
        let lname = user.fullname.substr(spaceIndex + 1)
        let body = { 
            'email' : user.email, 
            'fname' : fname, 
            'lname' : lname 
        }
        body['list'] = 'hero-subscribed'
        return this.http.post( this.baseUrl + '/mailchimp/add', body, this.getOptions())
            .map( res => {
                return res.json()
            })
    }
    

    /**
     * Add newly registered users to the sign up Mailchimp list
     */
    public addToNewUsersList(user) : void {
        let body = user
        body['list'] = 'new'
        this.http.post( this.baseUrl + '/mailchimp/add', body, this.getOptions())
            .map( res => {
                return res.json()
            })
            .take(1)
            .subscribe(
                (success) => {  },
                (error) => { console.error(error); }
            )
    }

    /**
     * Return array of allowed comment types
     */
    public getAllowedCommentTypes() : string[] {
        this.user = this.getUser()
        if (this.user['hero'] && this.user['hero']['active']) {
            return ['emoji','text','audio','reply']
        } else {
            return ['emoji','text']
        }
    }

    /**
     * Return array of allowed comment media types
     */
    public getAllowedCommentMediaTypes() : string[] {
        this.user = this.getUser()
        if (this.user['hero'] && this.user['hero']['active']) {
            return ['emoji','text','audio']
        } else {
            return ['emoji','text']
        }
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

    /**
     * Submit payment and subscription type to add plan to user
     */
    public subscribeToHero(subscriptionType, tokenId, couponCode ?: string): Observable<any> {
        let data = {
            subscriptionType : subscriptionType,
            token: tokenId
        }
        if (couponCode) {
            data['couponCode'] = couponCode
        }

        return this.http.post(this.baseUrl + '/subscriptions', data, this.getOptions())
            .map( res => {
                if (res && res.json()) {
                    // Add user to mailchimp list
                    this.addToActiveHeroList(this.getUser())
                    .toPromise()
                    .then( res => {
                        console.log(res)
                    })
                }
                return res.json()
            })

    }

    public updateHeroSub(subscriptionType: string, statusChange ?: string) {
        if (!statusChange) {
            statusChange = 'subscribed'
        }
        let data = {
            subscription_type : subscriptionType,
            status : statusChange
        }

        return this.http.put(this.baseUrl + '/subscriptions', data, this.getOptions())
            .map( res => {
                return res.json()
            })
    }

    public cancelHeroSubscription(subscriptionId: string) {
        return this.http.delete([this.baseUrl, 'subscriptions', subscriptionId].join("/"), this.getOptions())
            .map((res) => {
                return res.json() || {}
            })
    }

    public getHeroPrice() {
        return this.http.get(this.baseUrl + '/subscriptions/coupons/HERO_LAUNCH', this.getOptions())
            .map( res => {
                return res.json()
            })
    }

    /**
     * Follow
     * - Add user to user's Following array
     * - Updates user object
     */
    public followUser(userId: string) : Observable<any> {
        return this.http.post(this.baseUrl + '/users/follow/' + userId, null, this.getOptions())
            .map( res => {
                let user = res.json() || {}
                if(user._id) {
                    this.setUser(user)
                }
                return user
            })
    }

    /**
     * Unfollow
     * - Removes a user from user's Following array
     * - Updates user object
     */
    public unfollowUser(userId: string) : Observable<any> {
        return this.http.post(this.baseUrl + '/users/unfollow/' + userId, null, this.getOptions())
            .map( res => {
                let user = res.json() || {}
                if(user._id) {
                    this.setUser(user)
                }
                return user
            })
    }
}