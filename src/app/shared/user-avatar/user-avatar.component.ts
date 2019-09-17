import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { PublicUser } from '../datatypes';
import { ProjectStore } from 'src/app/_store';
import { map } from 'rxjs/operators';

// Project Dependencies


@Component({
  selector: 'user-avatar',
  styleUrls: ['./user-avatar.component.scss'],
  templateUrl: './user-avatar.component.pug',
})
export class UserAvatarComponent implements OnInit {
  // Can load with either PublicUser or User id 
  // (ID only supported within Project currently)
  @Input() userId: string
  @Input() userDetails: PublicUser

  private userSubscription: Subscription

  public user: PublicUser
  public initials: string

  constructor(private projectStore: ProjectStore) {
  }

  ngOnInit() {
    if (!this.userDetails && this.userId) {
      this.userSubscription = this.projectStore.joinedUsers.pipe(map(
        (users: PublicUser[]) => {
          let user: PublicUser = users.find(user => { return user._id === this.userId })
          return user
        }
      )).subscribe((user: PublicUser) => {
        console.log("User update", user)
        if (user) {
          this.user = user
          this.initials = user.initials
        }
      })
    }
  }

  ngOnDestroy() {

  }
}
