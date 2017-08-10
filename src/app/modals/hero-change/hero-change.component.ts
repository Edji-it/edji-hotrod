import { AuthService } from '../../shared';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'hero-change-modal',
  templateUrl: './hero-change.component.html',
  styleUrls: ['./hero-change.component.scss']
})
export class HeroChangeComponent implements OnInit {

  private user: any = {}
  private isUpdated: boolean = false
  private updating: boolean = false
  
  private confirmCancel: boolean = false
  private isCanceled: boolean = false
  private canceling: boolean = false
  private cancelMsg: string = ''

  // Form values
  private subtype: string = 'yearly'

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter(); // Tell the listening page to close the darned thing.

  constructor(private _auth: AuthService) { }

  ngOnInit() {
    this.user = this._auth.getUser()
    this.subtype = this.user.hero.type ? this.user.hero.type : 'yearly'
  }

  /**
   * Hook into the close event
   */
  close() : void {
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
      .take(1)
      .subscribe(
        data => {
          this.updating = false
          this.isUpdated = true
          if (data.user) {
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
    this._auth.cancelHeroSubscription(this.user.hero.subscription_id)
      .take(1)
      .subscribe(
        data => {
          this.canceling = false
          this.isCanceled = true
          if (data.user) {
            this._auth.setUser(data.user)
          }
        },
        err => {
          this.canceling = false
          this.cancelMsg = "Sorry, canceling your subscription failed. <a class='link' href='mailto:support@edji.it'>Please contact support</a>."
          console.log(err)
        }
      )
  }

}