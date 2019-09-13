import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'

// Project Dependencies
import { AuthService, ProjectService, LockerService } from '../../_services'
import { Copy } from '../../shared'
import { ALLSPARK } from '../../app.constants'
import { take } from 'rxjs/operators'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'hot-register-form',
  templateUrl: './register.component.pug',
  styleUrls: ['./register.component.scss'],
})
export class RegisterFormComponent implements OnInit {
  @Input() tempUserId: string
  @Input() referralId: string
  @Input() noRedirect: boolean

  @Output() registerSuccess: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []

  /** Redirect params */
  public readingToAdd: string
  public readingToPreview: string
  public projectToAdd: string

  public registerForm: FormGroup
  public registerLoading: boolean = false
  public errorObject: {
    duplicateUsername?: boolean
    duplicateEmail?: boolean
    serverError?: boolean
    badUsername?: string
  } = {}
  public successObject: {
    referral?: boolean
  } = {}
  public userReferral: any = {}

  public userCopy: any

  constructor(
    private _auth: AuthService,
    private _project: ProjectService,
    private _fb: FormBuilder,
    private _title: Title,
    private _locker: LockerService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    this.userCopy = new Copy().getUserCopy()

    this.registerForm = _fb.group(
      {
        // fullname: [null, Validators.required],
        email: [null, [Validators.required, this.emailValidator]],
        password: [null, [Validators.required, Validators.minLength(6)]],
        passwordConfirm: [null, Validators.required],
      },
      { validator: this.passwordsEqual },
    )
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParams.subscribe(queryParams => {
        this.readingToAdd = queryParams['reading']
        this.readingToPreview = queryParams['preview']
        this.projectToAdd = queryParams['project']
      }),
    )
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  /** Validates that the passwords are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the passwords are not equal
   */
  private passwordsEqual(group: FormGroup): any {
    return group.get('password').value === group.get('passwordConfirm').value ? null : { mismatch: true }
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { emailIncorrect: true }
  }

  private usernameValidator(control: FormControl): any {
    // If you change the RegExp for the username validator here, change it on the email validator as well
    let usernameRe: RegExp = ALLSPARK.EMAILREGEX
    return !usernameRe.test(control.value) ? null : { usernameIncorrect: true }
  }

  /** Makes call to register the user */
  public register(formValue: any): void {
    this.errorObject = {}
    this.registerLoading = true

    formValue.identities = []
    for (let field in formValue.checkboxes) {
      if (formValue.checkboxes[field]) {
        formValue.identities.push(field) // the name of the field gets added to the array, making it important to name the fields properly
      }
    }

    delete formValue.checkboxes // we don't want to store the checkboxes object

    // If the new user was referred and there is a referral id, then let's add it here
    if (typeof this.referralId != 'undefined' && this.referralId != '') {
      formValue.referred_by = this.referralId
    }

    formValue.fullname = ''

    // Attempt to register this user.
    this._auth
      .register(formValue)
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          this.registerLoading = false
          if (this.readingToAdd && this.tempUserId) {
            this._auth
              .convertTempUser(this.tempUserId)
              .pipe(take(1))
              .subscribe(
                () => {
                  this._router.navigate(['/register/profile'], { queryParams: { reading: this.readingToAdd } })
                },
                err => {
                  console.error(err)
                  this._router.navigate(['/register/profile'], { queryParams: { reading: this.readingToAdd } })
                },
              )
          } else if (this.tempUserId) {
            this._auth
              .convertTempUser(this.tempUserId)
              .pipe(take(1))
              .subscribe(
                () => {
                  this._router.navigate(['/register/profile'])
                },
                err => {
                  console.error(err)
                  // should also have an error put on the dashboard
                  this._router.navigate(['/register/profile'])
                },
              )
          } else if (this.readingToPreview) {
            this._router.navigate(['/register/profile'], { queryParams: { preview: this.readingToPreview } })
          } else if (this.noRedirect) {
            this.registerSuccess.emit(data.user)
          } else {
            // default case where nothing special happens
            this._router.navigate(['/register/profile'])
          }
          // If there is a failure with registering the user...
        },
        (err) => {
          let error = err.error
          this.registerLoading = false
          let errorCaught: boolean = false
          if (error.validationErrors) {
            // if the username has bad words
            if (error.validationErrors.username === 'badWords') {
              this.errorObject.badUsername = ':anguished: Would you mind choosing another username?'
              errorCaught = true
            }
            // if the username has whitespace
            if (error.validationErrors.username === 'whitespace') {
              this.errorObject.badUsername = 'Whoops! Usernames can not have spaces.'
              errorCaught = true
            }
          } else if (error.duplicateFieldError) {
            let field = error.duplicateFieldError.field
            if (field === 'username') {
              this.errorObject.duplicateUsername = true
              errorCaught = true
            } else if (field === 'email') {
              this.errorObject.duplicateEmail = true
              errorCaught = true
            }
          }
          if (!errorCaught) {
            console.error(err)
            this.errorObject.serverError = true
          }
        },
      )
  }
}
