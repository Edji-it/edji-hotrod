import { Angulartics2 } from 'angulartics2'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { take } from 'rxjs/operators'

import { AuthService, BumblebeeService } from './../../_services'

@Component({
  selector: 'hero-change-modal',
  templateUrl: './hero-change.component.html',
  styleUrls: ['./hero-change.component.scss']
})
export class HeroChangeComponent implements OnInit {

  private user: any = {}
  private isUpdated = false
  private updating = false

  public confirmCancel = false
  public isCanceled = false
  public canceling = false
  public cancelMsg = ''

  // Form values
  private subtype = 'yearly'

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter() // Tell the listening page to close the darned thing.

  constructor(
    private _auth: AuthService,
    private _bumblebee: BumblebeeService,
    private angulartics: Angulartics2
  ) { }

  ngOnInit() {
    this.user = this._auth.getUser()
    this.subtype = this.user.hero.type ? this.user.hero.type : 'yearly'
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
    this._auth.updateHeroSub(type)
      .pipe(take(1))
      .subscribe(
        data => {
          this.updating = false
          this.isUpdated = true
          if (data.user) {
            this._bumblebee.userHeroAction(data.user, 'unsubscribed')
            this._auth.setUser(data.user)
          }
        },
        err => {
          this.updating = false
        }
      )
  }

  /**
   * Changes user to Hero status "unsubscribed"
   */
  cancelSub() {
    this.canceling = true
    this.cancelMsg = ''
    // track user cancelling hero subscription in analytics
    this.angulartics.eventTrack.next({ action: 'cancelSubscription', properties: { category: 'heroFeature', label: 'attempt' }})
    this._auth.cancelHeroSubscription(this.user.hero.subscription_id)
      .pipe(take(1))
      .subscribe(
        data => {
          // track user cancelling hero subscription in analytics
          this.angulartics.eventTrack.next({ action: 'cancelSubscription', properties: { category: 'heroFeature', label: 'success' }})

          this.canceling = false
          this.isCanceled = true
          if (data.user) {
            this._auth.setUser(data.user)
          }
        },
        err => {
          // track user cancelling hero subscription in analytics
          this.angulartics.eventTrack.next({ action: 'cancelSubscription', properties: { category: 'heroFeature', label: 'failure' }})

          this.canceling = false
          this.cancelMsg = 'Sorry, canceling your subscription failed. <a class=\'link\' href=\'mailto:support@edji.it\'>Please contact support</a>.'
          console.log(err)
        }
      )
  }

}
