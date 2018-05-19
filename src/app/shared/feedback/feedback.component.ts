import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Http } from '@angular/http'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

import { AuthService, BumblebeeService, Copy, UtilToolService } from './..'
import { ALLSPARK } from '../../app.constants'

@Component({
  selector: 'edji-feedback',
  template: require('pug-loader!feedback.component.pug'),
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  @Output()
  private openModal: EventEmitter<any> = new EventEmitter()

  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  // private showFeedbackModal: boolean = false
  private showFeedbackSuccess: boolean = false
  private feedbackForm: FormGroup
  private feedbackSuccess: boolean = false
  private user: any
  private userCopy: any
  private window
  private loading: boolean = false

  private errorObject: {
    serverError?: string
  } = {}

  constructor(
    private _auth: AuthService,
    private _bumblebee: BumblebeeService,
    private http: Http,
    private angulartics: Angulartics2,
    fb: FormBuilder,
    private _util: UtilToolService
  ) {
    this.user = this._auth.getUser()

    let prevData: any = this._auth.getFromStorage("feedbackFormData") || {}

    this.feedbackForm = fb.group({
      name: [this.user.fullname, Validators.required],
      email: [this.user.email, Validators.compose([Validators.required, this.emailValidator])],
      content: [prevData.content, Validators.required]
    })

    this.window = window
  }

  ngOnInit() {
    this.userCopy = new Copy().getUserCopy()
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  private open(): void {
    this.openModal.emit()
    this._util.showFeedbackModal = true

    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = 'hidden'
  }

  private feedbackClose(): void {
    this.closeModal.emit()
    this._util.showFeedbackModal = false
    
    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = ''
  }

  private successClose(): void {
    this.showFeedbackSuccess = false
  }

  /** Sends feedback to bumblebee */
  private sendFeedback(formValue: any): void {
    this.loading = true
    this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'attempt' }})

    var w = this.window.navigator
    // Set a message and the following properties to return:
    // Device
    // Browser
    // Browser Version
    // Edji Version

    formValue.content = formValue.content + '<br><br>' + this._util.getPlatform(w) 
        + '<br>' + this._util.getBrowser(w.userAgent) 
        + '<br>' + this._util.getBrowserVersion(w.userAgent) 
        + '<br>' + this._util.getEdjiVersion()
        + '<br>' + window.location.href

    // Only send the user properties we need to bumblebee
    var userSend: any = {
      username: this.user.username,
      fullname: this.user.fullname,
      email: this.user.email,
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
      hero: this.user.hero
    }

    let data: any = {
      emailSubject: "Feedback form submitted!",
      formInfo: formValue,
      type: "feedback",
      user: userSend
    }

    this._bumblebee.sendFeedback(data).pipe(take(1)).subscribe(
      (res) => {
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'success' }})
        this.feedbackSuccess = true
        this._auth.deleteFromStorage("feedbackFormData")
        this.feedbackClose()
        this.showFeedbackSuccess = true
      },
      (err) => {
        console.error(err)
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'failure' }})
        this.errorObject.serverError = "Something has gone wrong. Please try submitting your feedback again later!"
        this._auth.store("feedbackFormData", formValue)
      }
    )
  }
}