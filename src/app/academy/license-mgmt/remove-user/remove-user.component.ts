import { FormBuilder } from '@angular/forms'
import { Component, Output, EventEmitter, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService, AcademyService, AcademyState } from '../../../_services';

@Component({
  selector: 'edji-license-remove-user',
  templateUrl: 'remove-user.component.html',
})
export class LicenseRemoveUserComponent implements OnInit {
  public currentUser: any
  public userRemove: any = {
    email: '',
    type: 'pending',
  }
  private licenses: any[]
  private activeLicense: any
  public academyState: AcademyState
  public currentAcademy: any
  public messages: {
    success?: boolean
    serviceError?: boolean
  } = {}
  public loading: boolean
  @Output() closeModal = new EventEmitter()
  @Output() openModal = new EventEmitter()

  private subscriptions: any[] = []

  constructor(private _auth: AuthService, private _academy: AcademyService, private angulartics: Angulartics2) {}

  ngOnInit() {
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.currentUser = user
      }),
      this._academy.tempLicenseRemoveUser.subscribe(user => {
        this.userRemove = user
      }),
      // Know when user swaps between academies
      this._auth.currentAcademyState.subscribe(currentState => {
        this.academyState = currentState
        if (this.licenses && this.academyState && this.academyState.selected) {
          // Do something with license
          this.activeLicense = this.licenses[this.academyState.selected]
        }
      }),
      // get the licenses the user can manage
      this._academy.getLicenses().subscribe(licenses => {
        let licenseIndex = this.academyState.selected || 0
        this.licenses = licenses
        this.activeLicense = this.licenses[licenseIndex]
      }),
    )
    this.openModal.emit()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  public onSubmit(): void {
    this.messages = {}
    this.loading = true

    this._academy
      .removeFromLicense(this.activeLicense._id, this.userRemove.email)
      .pipe(take(1))
      .subscribe(
        data => {
          this.activeLicense = data.license;
          this.messages.success = true
          this.loading = false
          this.angulartics.eventTrack.next({
            action: 'license_remove_user',
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })
        },
        err => {
          this.loading = false
          // TRACK EXCEPTION
          console.error(err)
          this.messages.serviceError = true
        },
      )
  }

  public closeAndReset() {
    this.closeModal.emit()
  }
}
