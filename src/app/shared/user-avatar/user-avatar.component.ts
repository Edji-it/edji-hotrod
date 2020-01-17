import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

// Project Dependencies
import { PublicUser } from '../datatypes'
import { ProjectStore } from 'src/app/_store'
import { generateInitialsFromName } from 'src/app/_store/user.decorators'

@Component({
  selector: 'user-avatar',
  styleUrls: ['./user-avatar.component.scss'],
  templateUrl: './user-avatar.component.pug',
})
export class UserAvatarComponent implements OnInit {
  // Can load with either PublicUser or User id
  // (ID only supported within Project currently)
  @Input() set userId(id: string) {
    let idChange = this._userId && id !== this._userId
    this._userId = id
    if (idChange) {
      this.resetDisplayProperties()
      // Refresh subscription
      this.subscribeToUserDetails()
    }
  }
  get userId() {
    return this._userId
  }
  // Not required, used as fallback fullname for deleted accounts
  @Input() tempName: string
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
  @Input() selected: boolean
  @Input() subLabel: string

  private userSubscription: Subscription
  private _userDetails: PublicUser
  private _userId: string

  public user: PublicUser

  // Display properties
  public initials: string = ''
  public fullname: string = ''
  public avatar: string = ''
  public background: string

  constructor(private projectStore: ProjectStore) {}

  ngOnInit() {
    this.subscribeToUserDetails()
  }

  ngOnDestroy() {
    this.userSubscription && this.userSubscription.unsubscribe()
  }

  subscribeToUserDetails() {
    this.userSubscription && this.userSubscription.unsubscribe()
    // Subscribe if only id is available
    if (!this.userDetails && this.userId) {
      this.userSubscription = this.projectStore.joinedUsers
        .pipe(
          map((users: PublicUser[]) => {
            if (users && users[0]) {
              let user: PublicUser = users.find(user => {
                return user._id === this.userId
              })
              if (!user && this.tempName) {
                user = {
                  _id: this.userId,
                  fullname: this.tempName,
                  initials: generateInitialsFromName(this.tempName),
                }
              }
              return user
            } else {
              return {}
            }
          }),
        )
        .subscribe((user: PublicUser) => {
          this.setDisplayProperties(user)
        })
    }
  }

  setDisplayProperties(user: PublicUser) {
    if (user) {
      this.user = user
      this.fullname = user.fullname
      if (user.avatar) {
        if (user.avatar.indexOf('#') === 0) {
          this.background = user.avatar
        } else {
          this.avatar = user.avatar
        }
      }
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

  resetDisplayProperties() {
    this.initials = ''
    this.fullname = ''
    this.avatar = ''
    this.background = ''
  }
}
