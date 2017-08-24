import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Http } from '@angular/http'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'

import { AuthService, BumblebeeService, Copy, UtilToolService } from './..'

@Component({
  selector: 'edji-feedback',
  templateUrl: 'feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  @Output()
  private openModal: EventEmitter<any> = new EventEmitter()

  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  private showFeedbackModal: boolean = false
  private showFeedbackSuccess: boolean = false
  private feedbackForm: FormGroup
  private feedbackSuccess: boolean = false
  private user: any
  private userCopy: any
  private window

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
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  private open(): void {
    this.openModal.emit()
    this.showFeedbackModal = true

    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = 'hidden'
  }

  private feedbackClose(): void {
    this.closeModal.emit()
    this.showFeedbackModal = false
    
    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = ''
  }

  private successClose(): void {
    this.showFeedbackSuccess = false
  }

  /** Sends feedback to bumblebee */
  private sendFeedback(formValue: any): void {
    this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'attempt' }})

    var w = this.window.navigator
    // Set a message and the following properties to return:
    // Device
    // Browser
    // Browser Version
    // Edji Version

    formValue.content = formValue.content + '\n\n\n\n' + this._util.getPlatform(w) 
        + '\n' + this._util.getBrowser(w.userAgent) 
        + '\n' + this._util.getBrowserVersion(w.userAgent) 
        + '\n' + this._util.getEdjiVersion()

    let data: any = {
      emailSubject: "Feedback form submitted!",
      formInfo: formValue,
      type: "feedback",
      user: this.user
    }

    this._bumblebee.sendFeedback(data).take(1).subscribe(
      (res) => {
        if (res.status === 204) {
          this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'success' }})
          this.feedbackSuccess = true
          this._auth.deleteFromStorage("feedbackFormData")
          this.feedbackClose()
          this.showFeedbackSuccess = true
        }
      },
      (err) => {
        this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'failure' }})
        console.log(err)
        this.errorObject.serverError = "Something has gone wrong. Please try submitting your feedback again later!"
        this._auth.store("feedbackFormData", formValue)
      }
    )
  }
}