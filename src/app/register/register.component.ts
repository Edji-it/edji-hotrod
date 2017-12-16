import { Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy } from '@angular/core'
import { PRIMARY_OUTLET, Router, ActivatedRoute } from '@angular/router'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'
import { Angulartics2 } from 'angulartics2'

import { AuthService, BumblebeeService, Copy, ProjectService } from './../shared'

@Component({
  selector: 'edji-register',
  templateUrl: 'register.component.html',
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
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {

  /*
  Last Mod: 17 June 2017

  The page for registering a user.
  */

  private subscriptions: Subscription[] = []

  private registerForm: FormGroup
  private registerLoading: boolean = false
  private errorObject: {
    duplicateUsername?: boolean,
    duplicateEmail?: boolean,
    serverError?: boolean,
    badName?: string,
    badUsername?: string
  } = {}

  // private copy: Copy = new Copy()
  private userCopy: any

  private checkboxCopy = {
    student: "As a student! :writing_hand:",
    teacher: "As a teacher! :apple:",
    business: "For business. :briefcase:",
    personal: "My own reading and sharing :books:",
    robot: "I'm a robot. :robot_face:",
    other: "Some reason we haven't listed here! :sparkles:"
  }

  /** The reading id that the user wanted to make a copy of */
  private readingToAdd: string
  /** The project id that the user wanted to add to the dashboard */
  private tempUserId: string

  constructor (
    private _auth: AuthService,
    private _router: Router,
    private _project: ProjectService,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    private bumblebee: BumblebeeService,
    private _fb: FormBuilder,
    private _title: Title
  ) {

    this.userCopy = new Copy().getUserCopy()

    this.registerForm = _fb.group({
      username: [null, Validators.required],
      fullname: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      checkboxes: this._fb.group({
        student: true,
        teacher: null,
        business: null,
        personal: null,
        robot: null,
        other: null
      }, { validator: this.checkboxValidator }),
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
        this.tempUserId = queryParams['userId']
      })
    )

    this._title.setTitle( 'Edji | Register' )
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  /** Validates that the passwords are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the passwords are not equal
   */
  private passwordsEqual(group: FormGroup): any {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : { mismatch: true }
  }

  /**
   * Validates that at least one checkbox is checked, and assigns error if not
   * @returns error to FormGroup called 'identity'
   */
  private checkboxValidator(group: FormGroup): any {
    let valid = false
    for(let control in group.controls) {
      if (group.controls[control].value === true) {
        valid = true
      }
    }
    return valid ? null : { identity: true }
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  /** Makes call to register the user */
  private register(formValue: any): void {

    this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'attempt' }})

    this.registerLoading = true

    formValue.identities = []
    for(let field in formValue.checkboxes) {
      if (formValue.checkboxes[field]) {
        formValue.identities.push(field) // the name of the field gets added to the array, making it important to name the fields properly
      }
    }

    delete formValue.checkboxes // we don't want to store the checkboxes object

    // Attempt to register this user.
    this._auth.register(formValue)
      .take(1)
      .subscribe((data) => {
        this.registerLoading = false
        if (data.user) {
          if (this._auth.getEnv() === "prod") { 
            this.bumblebee.sendUserDetails(data.user) 
            if(data.user.identities.indexOf('teacher') > -1) {
              let spaceIndex = data.user.fullname.indexOf(' ')
              if (spaceIndex < 0) { spaceIndex = data.user.fullname.length - 1 }
              let fname = data.user.fullname.substr(0,spaceIndex)
              let lname = data.user.fullname.substr(spaceIndex + 1)
              this._auth.addToNewUsersList({ 'email' : data.user.email, 'fname' : fname, 'lname' : lname })
            }
          }

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
              .take(1)
              .subscribe(() => {
                this._router.navigate(['/new-reading'], { queryParams: { copyId: this.readingToAdd } })
              }, (err) => {
                console.error(err)
                this._router.navigate(['/new-reading'], { queryParams: { copyId: this.readingToAdd } })
              })
          } else if (this.tempUserId) {
            this._auth.convertTempUser(this.tempUserId)
              .take(1)
              .subscribe(() => {
                this._router.navigate(['/dashboard'])
              }, (err) => {
                console.error(err)
                // should also have an error put on the dashboard
                this._router.navigate(['/dashboard'])
              })
          } else {
            console.error("don't know what to do!")
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