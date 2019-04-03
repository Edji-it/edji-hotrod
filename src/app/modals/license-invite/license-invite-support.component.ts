import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { AcademyService } from '../../_services'

@Component({
  selector: 'license-invite-support',
  templateUrl: './license-invite-support.component.pug',
  styleUrls: ['./license-invite-support.component.scss'],
})
export class LicenseInviteComponent implements OnInit {
  @Input() showModal: boolean
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter()

  public licenseInvite: FormGroup

  constructor(private _fb: FormBuilder, private _academy: AcademyService) {
    this.licenseInvite = this._fb.group({
      // name: [null, Validators.required],
      // email: [null, [Validators.required, this.emailValidator]]
    })
  }

  ngOnInit() {}

  private formSubmit(form: FormGroup): void {}
}
