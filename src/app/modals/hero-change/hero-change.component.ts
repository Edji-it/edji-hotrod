import { Angulartics2 } from 'angulartics2'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { take } from 'rxjs/operators'

import { AuthService, BumblebeeService } from './../../_services'

@Component({
  selector: 'hero-change-modal',
  templateUrl: './hero-change.component.pug',
  styleUrls: ['./hero-change.component.scss'],
})
export class HeroChangeComponent implements OnInit {
  private user: any = {}
  private isUpdated: boolean = false
  private updating: boolean = false

  public confirmCancel: boolean = false
  public isCanceled: boolean = false
  public canceling: boolean = false
  public cancelMsg: string = ''

  // Form values
  private subtype: string = 'yearly'

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter() // Tell the listening page to close the darned thing.

  constructor(private _auth: AuthService, private _bumblebee: BumblebeeService, private angulartics: Angulartics2) {}

  ngOnInit() {
    this.user = this._auth.getUser()
    this.subtype = 'yearly'
  }

  /**
   * Hook into the close event
   */
  close(): void {
    // Reset defaults
    this.isUpdated = false
    this.confirmCancel = false
    this.isCanceled = false

    this.closeModal.emit()
  }

  /**
   * @param type 'yearly' or 'monthly'
   */
  updateType(type: string) {
    this.updating = true
    this._auth
      .updateHeroSub(type)
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          this.updating = false
          this.isUpdated = true
          if (data.user) {
            this._bumblebee.userHeroAction(data.user, 'unsubscribed')
            this._auth.setUser(data.user)
          }
        },
        err => {
          this.updating = false
        },
      )
  }

  /**
   * Changes user to Hero status "unsubscribed"
   */
  cancelSub() {
    this.canceling = true
    this.cancelMsg = ''
    // console.log(this.user.hero.subscription_id)
    this._auth
      .cancelHeroSubscription()
      .pipe(take(1))
      .subscribe(
        data => {
          // fire an analytic event here for tracking purposes
          this.angulartics.eventTrack.next({
            action: 'subscription_cancel',
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })

          this.canceling = false
          this.isCanceled = true
          if (data.user) {
            this._auth.setUser(data.user)
          }
        },
        err => {
          this.canceling = false
          this.cancelMsg =
            "Sorry, canceling your subscription failed. <a class='link' href='mailto:support@edji.it'>Please contact support</a>."
          console.log(err)
        },
      )
  }
}
