import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

import { AuthService, BumblebeeService, UtilToolService } from '../../_services'
import { ALLSPARK } from '../../app.constants'
import { LockerService } from '../../_services/locker.service'
import { Copy } from '..'

@Component({
  selector: 'edji-feedback',
  templateUrl: './feedback.component.pug',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  @Input()
  public prefillMessage: string
  @Input()
  public showModal: boolean
  @Input()
  public title: string = 'How can we help?'
  @Input()
  public subHeading: string = 'Found a problem? Have questions? Just want to say hello?\nLet us know below!'
  @Input()
  public optionForContact: boolean

  @Output()
  private openModal: EventEmitter<any> = new EventEmitter()
  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  // private showFeedbackModal: boolean = false
  public showFeedbackSuccess: boolean = false
  public feedbackForm: FormGroup
  public feedbackSuccess: boolean = false
  public user: any
  public userCopy: any
  private window
  public loading: boolean = false

  public errorObject: {
    serverError?: string
  } = {}

  constructor(
    private _auth: AuthService,
    private _bumblebee: BumblebeeService,
    private http: HttpClient,
    private angulartics: Angulartics2,
    fb: FormBuilder,
    public _util: UtilToolService,
    private _locker: LockerService,
  ) {
    this.user = this._auth.getUser()

    let prevData: any = this._locker.get('feedbackFormData') || {}

    this.feedbackForm = fb.group({
      name: [this.user.fullname, Validators.required],
      email: [this.user.email, [Validators.required, this.emailValidator]],
      content: [prevData.content, Validators.required],
      shouldContact: [true]
    })

    this.window = window
  }

  ngOnInit() {
    this.userCopy = new Copy().getUserCopy()
    if (this.prefillMessage) {
      this.feedbackForm.controls.content.setValue(this.prefillMessage)
    }
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { emailIncorrect: true }
  }

  private open(): void {
    this.openModal.emit()
    this._util.showFeedbackModal = true

    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = 'hidden'
  }

  public feedbackClose(): void {
    this.closeModal.emit()
    this._util.showFeedbackModal = false

    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = ''
  }

  public successClose(): void {
    this.showFeedbackSuccess = false
  }

  /** Sends feedback to bumblebee */
  public sendFeedback(formValue: any): void {
    this.loading = true
    var w = this.window.navigator
    // Set a message and the following properties to return:
    // Device
    // Browser
    // Browser Version
    // Edji Version

    formValue.content =
      formValue.content +
      '<br><br>' +
      this._util.getPlatform(w) +
      '<br>' +
      this._util.getBrowser(w.userAgent) +
      '<br>' +
      this._util.getBrowserVersion(w.userAgent) +
      '<br>' +
      this._util.getEdjiVersion() +
      '<br>' +
      window.location.href
    // Attach whether or not they wish to be contacted
    if (this.optionForContact) {
      formValue.content += '\n\n*Would like to be contacted with updates:* ' + formValue.shouldContact
    }

    // Only send the user properties we need to bumblebee
    var userSend: any = {
      username: this.user.username,
      fullname: this.user.fullname,
      email: this.user.email,
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
      hero: this.user.hero,
    }

    let data: any = {
      emailSubject: 'Feedback form submitted!',
      formInfo: formValue,
      type: 'feedback',
      user: userSend,
    }
    this._bumblebee
      .sendFeedback(data)
      .pipe(take(1))
      .subscribe(
        res => {
          this.loading = false
          // fire an analytic event here for tracking purposes
          this.angulartics.eventTrack.next({
            action: 'send_feedback',
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })
          this.feedbackSuccess = true
          this._locker.remove('feedbackFormData')
          this.feedbackClose()
          this.showFeedbackSuccess = true
        },
        err => {
          console.error(err)
          this.loading = false
          this.errorObject.serverError = 'Something has gone wrong. Please try submitting your feedback again later!'
          this._locker.set('feedbackFormData', formValue)
        },
      )
  }
}
