import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

import { AuthService, BumblebeeService, UtilToolService } from '../../_services'
import { ALLSPARK } from '../../app.constants'
import { LockerService } from '../../_services/locker.service';
import { Copy } from '../../shared';

@Component({
  selector: 'request-academy-modal',
  templateUrl: './request-academy.component.pug',
  styleUrls: ['./request-academy.component.scss']
})
export class RequestAcademyModal implements OnInit {
  @Output()
  private openModal: EventEmitter<any> = new EventEmitter()

  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  // private showFeedbackModal: boolean = false
  public showRequestSuccess: boolean = false
  public feedbackForm: FormGroup
  public requestSuccess: boolean = false
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
    private angulartics: Angulartics2,
    fb: FormBuilder,
    public _util: UtilToolService,
    private _locker: LockerService
  ) {
    this.user = this._auth.getUser()

    let prevData: any = this._locker.get("requestAcademyFormData") || {}

    this.feedbackForm = fb.group({
      name: [this.user.fullname, Validators.required],
      email: [this.user.email, Validators.compose([Validators.required, this.emailValidator])],
      phone: [],
      content: [prevData.content],
      contactType: ['email']
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

  public feedbackClose(): void {
    this.closeModal.emit()
    this.angulartics.eventTrack.next({ action: 'academyRequest_academyModal_revoked', properties: { category: this._auth.setAnalyticEventCategory, label: this._auth.setAnalyticEventLabel }})
    this._util.showFeedbackModal = false
    
    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = ''
  }

  public successClose(): void {
    this.showRequestSuccess = false
  }

  /** Sends feedback to bumblebee */
  public sendFeedback(formValue: any): void {
    this.loading = true
    // Add Request type
    formValue.content = '\nRequest Type: Hero Academy Request'

    // Attach phone number
    formValue.content = formValue.content + '\nPhone: ' + formValue.phone

    // Attach contact preference
    formValue.content = formValue.content + '\nPreferred contact method: ' + formValue.contactType

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
      emailSubject: "Hero Academy Request",
      formInfo: formValue,
      type: "feedback",
      user: userSend
    }

    this._bumblebee.sendFeedback(data).pipe(take(1)).subscribe(
      (res) => {
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'academyRequest_academyModal_submitted', properties: { category: this._auth.setAnalyticEventCategory, label: this._auth.setAnalyticEventLabel }})
        this.requestSuccess = true
        this._locker.remove("requestAcademyFormData")
        this.feedbackClose()
        this.showRequestSuccess = true
      },
      (err) => {
        console.error(err)
        this.loading = false
        this.errorObject.serverError = "Something has gone wrong. Please try submitting your feedback again later!"
        this._locker.set("requestAcademyFormData", formValue)
      }
    )
  }
}