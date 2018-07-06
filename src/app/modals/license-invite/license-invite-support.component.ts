import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ALLSPARK } from '../../app.constants';
import { AcademyService } from '../../_services';

@Component({
  selector: 'license-invite-support',
  templateUrl: './license-invite-support.component.pug',
  styleUrls: ['./license-invite-support.component.scss']
})
export class LicenseInviteComponent implements OnInit {
  @Input() showModal: boolean
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter()

  public licenseInvite: FormGroup

  constructor(
    private _fb: FormBuilder,
    private _academy: AcademyService
  ) {
    this.licenseInvite = this._fb.group({
      name: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])]
    })
  }

  ngOnInit() {
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  private formSubmit(form: FormGroup): void {
    this._academy.inviteToLicense(form.controls.name.value, form.controls.email.value, licenseId)
    .subscribe(data => {
      
    },
    (error) => {
      
    })
    this.closeModal.emit(true)
  }
}
