import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators';

// Project Dependencies
import { PublicUser } from '../datatypes';
import { ProjectStore } from 'src/app/_store';
import { generateInitialsFromName } from 'src/app/_store/user.decorators';

@Component({
  selector: 'user-avatar',
  styleUrls: ['./user-avatar.component.scss'],
  templateUrl: './user-avatar.component.pug',
})
export class UserAvatarComponent implements OnInit {
  // Can load with either PublicUser or User id 
  // (ID only supported within Project currently)
  @Input() userId: string
  @Input() set userDetails(user: PublicUser) {
    this._userDetails = user
    this.setDisplayProperties(user)
  }
  get userDetails() {
    return this._userDetails
  }
  // Display/style inputs (treat as static)
  @Input() showName: boolean
  @Input() size: string // 'medium', 'large'

  private userSubscription: Subscription
  private _userDetails: PublicUser

  public user: PublicUser

  // Display properties
  public initials: string = ''
  public fullname: string = ''

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
        this.setDisplayProperties(user)
      })
    }
  }

  ngOnDestroy() {

  }

  setDisplayProperties(user: PublicUser) {
    if (user) {
      this.user = user
      this.fullname = user.fullname
      /**
       * @todo once search/discover uses a store for data, initials should be 
       * fully handled upstream and this should be removed
       */
      if (user.initials) {
        this.initials = user.initials
      } else {
        this.initials = generateInitialsFromName(user.fullname)
      }
    }
  }
}
