import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '../../_services'
import { User } from '../datatypes'

@Component({
  selector: 'follow-tag',
  styleUrls: ['./follow-tag.component.scss'],
  templateUrl: './follow-tag.component.pug',
})
export class FollowTag implements OnInit {
  @Input() owner: User
  @Input() tagOnly: Boolean
  @Output() followEvent: EventEmitter<boolean> = new EventEmitter()

  public user: User = <User>{}
  private userSub: Subscription
  constructor(private _auth: AuthService) {}

  ngOnInit() {
    this.userSub = this._auth.currentUser.subscribe(user => {
      this.user = user
    })
  }

  ngOnDestroy() {
    this.userSub.unsubscribe()
  }

  isFollowing(): boolean {
    return this.user['following'] && this.user['following'].indexOf(this.owner._id) > -1
  }

  followUser(userId: string): void {
    if (!this.user.isLoggedIn) {
      this.followEvent.emit(true)
      return
    }
    this._auth
      .followUser(userId)
      .pipe(take(1))
      .subscribe(data => {
        this.followEvent.emit(true)
      })
  }

  unfollowUser(userId: string): void {
    this._auth
      .unfollowUser(userId)
      .pipe(take(1))
      .subscribe(data => {
        this.followEvent.emit(false)
      })
  }
}
