import { Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy } from '@angular/core'
import { PRIMARY_OUTLET, Router, ActivatedRoute } from '@angular/router'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'

import { AuthService, Copy, ProjectService } from './../shared'
import { ALLSPARK } from './../app.constants'
import { LockerService } from '../_services/locker.service';

@Component({
  selector: 'edji-register',
  styles: [`
    .btn-group-wrapper {
      width: 100%;
      text-align: center;
    }

    .btn-group-wrapper label {
      margin: 0;
    }

    label.btn.btn-primary.active {
      border: 3px solid #4A92BC;
    }
  `],
  templateUrl: './register.component.pug'
})
export class RegisterComponent implements OnInit, OnDestroy {

  /*
  Last Mod: 17 June 2017

  The page for registering a user.
  */

  private subscriptions: Subscription[] = []

  public registerForm: FormGroup
  public registerLoading: boolean = false
  public errorObject: {
    duplicateUsername?: boolean,
    duplicateEmail?: boolean,
    serverError?: boolean,
    badName?: string,
    badUsername?: string
  } = {}
  public successObject: {
    referral?: boolean
  } = {}
  public userReferral: any = {}

  // public copy: Copy = new Copy()
  public userCopy: any

  public checkboxCopy = {
    student: "As a student! :writing_hand:",
    teacher: "As a teacher! :apple:",
    business: "For business. :briefcase:",
    personal: "My own reading and sharing :books:",
    robot: "I'm a robot. :robot_face:",
    other: "Some reason we haven't listed here! :sparkles:"
  }

  /** The reading id that the user wanted to make a copy of */
  public readingToAdd: string
  public projectToAdd: string
  /** The project id that the user wanted to add to the dashboard */
  public tempUserId: string
  public referralId: string

  constructor (
    private _auth: AuthService,
    private _router: Router,
    private _project: ProjectService,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    private _fb: FormBuilder,
    private _title: Title,
    private _locker: LockerService
  ) {

    this.userCopy = new Copy().getUserCopy()

    this.registerForm = _fb.group({
      username: [null, Validators.compose([Validators.required, this.usernameValidator])],
      fullname: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      passwordConfirm: [null, Validators.required],
    }, { validator: this.passwordsEqual })
  }

  ngOnInit() {
    // this makes the window always render scrolled to the top
    this._router.events.subscribe(() => {
      window.scrollTo(0, 0)
    })

    this.subscriptions.push(
      this.route.queryParams.subscribe((queryParams) => {
        this.readingToAdd = queryParams['reading']
        this.projectToAdd = queryParams['project']
        this.tempUserId = queryParams['userId']
        this.referralId = queryParams['referral_id']
      })
    )

    this._title.setTitle( 'Edji | Register' )

    if (typeof(this.referralId)!='undefined' && this.referralId!='') {
      // Store the referral_id in the locker in case the user signs up with oauth
      this._locker.set("referral_id", this.referralId)
      // We're going to ask the server to get the user that referred this new one so we can show a name
      this.subscriptions.push(
        this._auth.getUserByReferralId(this.referralId).subscribe((user) => {
          this.userReferral = user
        }, (err) => {
          // If the servor throws an error, then let's make sure the copy is at least protected
          this.userReferral = {fullname: "A special someone"}
        })
      )
      // We need to activate the success object so we can show the user a friendly message
      this.successObject.referral = true
    }
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  /** Validates that the passwords are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the passwords are not equal
   */
  private passwordsEqual(group: FormGroup): any {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : { mismatch: true }
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  private usernameValidator(control: FormControl): any {
    // If you change the RegExp for the username validator here, change it on the email validator as well
    let usernameRe: RegExp = ALLSPARK.EMAILREGEX
    return !usernameRe.test(control.value) ? null : { 'usernameIncorrect': true }
  }

  /** Makes call to register the user */
  public register(formValue: any): void {
    this.errorObject = {}

    this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'attempt' }})

    this.registerLoading = true

    formValue.identities = []
    for(let field in formValue.checkboxes) {
      if (formValue.checkboxes[field]) {
        formValue.identities.push(field) // the name of the field gets added to the array, making it important to name the fields properly
      }
    }

    delete formValue.checkboxes // we don't want to store the checkboxes object

    // If the new user was referred and there is a referral id, then let's add it here
    if (typeof(this.referralId)!='undefined' && this.referralId!='') {
      formValue.referred_by = this.referralId
    }

    // Attempt to register this user.
    this._auth.register(formValue)
      .pipe(take(1))
      .subscribe((data: any) => {
        this.registerLoading = false
        if (data.user) {

          data.user.username && this.angulartics.setUsername.next(data.user.username)
          data.user.email && this.angulartics.setUserProperties.next({ email: data.user.email})
          if (data.user.identities) {
            data.user.identities.forEach((identity) => {
              let userProperty: any = {}
              userProperty[identity] = true
              this.angulartics.setUserProperties.next(userProperty)
            })
          }
          this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'success' }})
          if (this.readingToAdd && this.tempUserId) {
            this._auth.convertTempUser(this.tempUserId)
              .pipe(take(1))
              .subscribe(() => {
                this._router.navigate(['/new-reading'], { queryParams: { copyId: this.readingToAdd } })
              }, (err) => {
                console.error(err)
                this._router.navigate(['/new-reading'], { queryParams: { copyId: this.readingToAdd } })
              })
          } else if (this.tempUserId) {
            this._auth.convertTempUser(this.tempUserId)
              .pipe(take(1))
              .subscribe(() => {
                this._router.navigate(['/dashboard'])
              }, (err) => {
                console.error(err)
                // should also have an error put on the dashboard
                this._router.navigate(['/dashboard'])
              })
          } else {
            // default case where nothing special happens
            this._router.navigate(['/dashboard'])
          }
          
        } else {
          // TRACK EXCEPTION... there was no data
          this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'failure' }})
        }

      // If there is a failure with registering the user...
      }, (err) => {
        this.registerLoading = false

        // ...then let's throw an error
        switch (err.status) {
          case 406:
            let error = err.json() || {}
            if (error.validationErrors) {
              // Use these print statements to see what's goin on
              //console.log("[register.component.ts] ");
              //console.log( error.validationErrors.username);

              let errorCaught: boolean = false
              // If the full name has bad words
              if (error.validationErrors.fullname === "badWords") {
                this.errorObject.badName = ":anguished: Would you mind choosing another name?"
                errorCaught = true
              } 
              // if the username has bad words
              if (error.validationErrors.username === "badWords") {
                this.errorObject.badUsername = ":anguished: Would you mind choosing another username?"
                errorCaught = true
              }

              // if the username has whitespace
              if (error.validationErrors.username === "whitespace")
              {
                this.errorObject.badUsername = "Whoops! Usernames can not have spaces."
                errorCaught = true
              } // if whitespaced username
              
              // If we havent caught an error that we know about yet...
              if (!errorCaught) {
                this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'failure' }})
                // form validation should have caught any other errors
              }
            }

            if (error.duplicateFieldError) {
              let field = error.duplicateFieldError.field
              if (field === 'username') {
                this.errorObject.duplicateUsername = true
              } else if (field === 'email') {
                this.errorObject.duplicateEmail = true
              } else {
                this.errorObject.serverError = true
              }
            }
            break
          default:
            this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'failure' }})
            this.errorObject.serverError = true
            console.error(err)
        }
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}