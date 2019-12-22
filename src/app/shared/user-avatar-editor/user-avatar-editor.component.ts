import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

// Project Dependencies
import { PublicUser, User } from '../datatypes'
import { ProjectStore } from 'src/app/_store'
import { generateInitialsFromName } from 'src/app/_store/user.decorators'
import { AuthService } from 'src/app/_services'

@Component({
  selector: 'user-avatar-editor',
  styleUrls: ['./user-avatar-editor.component.scss'],
  templateUrl: './user-avatar-editor.component.pug',
})
export class UserAvatarEditorComponent implements OnInit {
  // Can load with either PublicUser or User id
  // (ID only supported within Project currently)
  // @Input() userId: string
  // // Not required, used as fallback fullname for deleted accounts
  // @Input() tempName: string
  // @Input() set userDetails(user: PublicUser) {
  //   this._userDetails = user
  //   this.setDisplayProperties(user)
  // }
  // get userDetails() {
  //   return this._userDetails
  // }
  // // Display/style inputs (treat as static)
  // @Input() showName: boolean
  // @Input() size: string // 'medium', 'large'
  // @Input() selected: boolean
  // @Input() subLabel: string

  private userSubscription: Subscription
  // private _userDetails: PublicUser

  public user: User

  // Display properties
  public tab: 'emoji' | 'color' = 'emoji'

  // public initials: string = ''
  // public fullname: string = ''
  // public avatar: string = ''

  public emojiOptions: string[] = [
    'dog',
    'cat',
    'mouse',
    'hamster',
    'rabbit',
    'bear',
    'panda_face',
    'lion_face',
    'cow',
    'pig',
    'frog',
    'octopus',
    'monkey_face',
    'chicken',
    'penguin',
    'bird',
    'hatching_chick',
    'wolf',
    'boar',
    'horse',
    'unicorn',
    'bee',
    'bug',
    'spider',
    'crab',
    'snake',
    'turtle',
    'tropical_fish',
    'fish',
  ]

  public colorOptions: string[] = [
    '#FFB4B4',
    '#FFB4B4',
    '#FFCFB4',
    '#FFF3B4',
    '#ECFFB4',
    '#B4FFC0',
    '#B4FFED',
    '#B4EDFF',
    '#B4C5FF',
    '#E7B4FF',
    '#FFB4EA',
    '#F3DADA',
    '#DEDEDE',
    '#F25454',
    '#F28D54',
    '#FAFC80',
    '#C9F254',
    '#54F26D',
    '#54F2CC',
    '#54AFF2',
    '#546DF2',
    '#AC54F2',
    '#F254E2',
    '#DBAC8A',
    '#888888',
  ]

  constructor(private _auth: AuthService) {}

  ngOnInit() {
    this.userSubscription = this._auth.currentUser.subscribe(user => {
      this.user = user
    })
  }

  ngOnDestroy() {
    this.userSubscription && this.userSubscription.unsubscribe()
  }

  // setDisplayProperties(user: PublicUser) {
  //   if (user) {
  //     this.user = user
  //     this.fullname = user.fullname
  //     if (user.avatar) {
  //       this.avatar = user.avatar
  //     }
  //     /**
  //      * @todo once search/discover uses a store for data, initials should be
  //      * fully handled upstream and this should be removed
  //      */
  //     if (user.initials) {
  //       this.initials = user.initials
  //     } else {
  //       this.initials = generateInitialsFromName(user.fullname)
  //     }
  //   }
  // }
}
