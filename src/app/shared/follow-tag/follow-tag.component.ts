import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { AuthService } from "app/shared";
import { Subscription } from 'rxjs/Rx';
import { User } from '../datatypes';

@Component({
  selector: 'follow-tag',
  styleUrls: [ './follow-tag.component.scss' ],
  templateUrl: './follow-tag.component.pug'
})
export class FollowTag implements OnInit {
    @Input() owner: User
    @Output() followEvent: EventEmitter<boolean> = new EventEmitter()

    private user = {}
    private userSub: Subscription
  constructor(
      private _auth: AuthService
  ) {
      
  }

  ngOnInit() {
      this.userSub = this._auth.currentUser.subscribe(user => {
          this.user = user
      })
      console.log(this.owner)
  }

  ngOnDestroy() {
    this.userSub.unsubscribe()
  }

  isFollowing(): boolean {
    return this.user['following'] && this.user['following'].indexOf(this.owner._id) > -1
  }

  followUser(userId: string) : void {
    this._auth.followUser(userId)
      .take(1)
      .subscribe(
        data => {
          this.followEvent.emit(true)
        }
      )
  }

  unfollowUser(userId: string) : void {
    this._auth.unfollowUser(userId)
      .take(1)
      .subscribe(data => {
        this.followEvent.emit(false)
      })
  }
}
