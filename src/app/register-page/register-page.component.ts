import { Title } from '@angular/platform-browser'
import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { Copy } from './../shared'
import { AuthService, ProjectService } from './../_services'
import { ALLSPARK } from './../app.constants'
import { LockerService } from '../_services/locker.service'

@Component({
  selector: 'edji-register',
  styles: [
    `
      .btn-group-wrapper {
        width: 100%;
        text-align: center;
      }

      .btn-group-wrapper label {
        margin: 0;
      }

      label.btn.btn-primary.active {
        border: 3px solid #4a92bc;
      }
    `,
  ],
  templateUrl: './register-page.component.pug',
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  /*
  Last Mod: 17 June 2017

  The page for registering a user.
  */

  private subscriptions: Subscription[] = []

  public successObject: {
    referral?: boolean
  } = {}
  public referringUserName: string = ''

  /** The reading id that the user wanted to make a copy of */
  public readingToAdd: string
  public projectToAdd: string
  /** The project id that the user wanted to add to the dashboard */
  public tempUserId: string
  public referralId: string

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _project: ProjectService,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    private _fb: FormBuilder,
    private _title: Title,
    private _locker: LockerService,
  ) {}

  ngOnInit() {
    // This makes the window always render scrolled to the top
    let startEl = document.getElementById('top')
    startEl && startEl.scrollIntoView()

    this.subscriptions.push(
      this.route.queryParams.subscribe(queryParams => {
        this.readingToAdd = queryParams['reading']
        this.projectToAdd = queryParams['project']
        this.tempUserId = queryParams['userId']
        this.referralId = queryParams['referral_id']
      }),
    )

    this._title.setTitle('Edji | Register')

    if (typeof this.referralId != 'undefined' && this.referralId != '') {
      // Preserve (and display) referral
      this.setReferral(this.referralId)
    } else if (this._locker.get('referral_id')) {
      // Restore referral if user browsed away from /register
      this.referralId = this._locker.get('referral_id')
      this.setReferral(this.referralId)
    }
  }

  /**
   * Set referral id, and display referral message
   * @param referralId
   */
  setReferral(referralId: string): void {
    // Store the referral_id in the locker in case the user signs up with oauth
    this._locker.set('referral_id', referralId)
    // We're going to ask the server to get the user that referred this new one so we can show a name
    this.subscriptions.push(
      this._auth.getUserByReferralId(referralId).subscribe(
        user => {
          this.referringUserName = user.fullname
        },
        err => {
          // If the servor throws an error, then let's make sure the copy is at least protected
          this.referringUserName = 'A special someone'
        },
      ),
    )
    // We need to activate the success object so we can show the user a friendly message
    this.successObject.referral = true
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
