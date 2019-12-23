import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { map, take } from 'rxjs/operators'

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
  @Output() close: EventEmitter<any> = new EventEmitter()

  private userSubscription: Subscription
  private saved: boolean = true

  public user: User

  // Display properties
  public tab: 'emoji' | 'color' = 'emoji'
  public loading: boolean
  public error: string

  public emojiOptions: string[] = [
    // faces
    'laughing',
    'slight_smile',
    'nerd',
    'sunglasses',
    'thinking',
    'smirk',
    // @todo to add when emoji updated
    // 'woman_astronaut',
    // 'man_teacher',
    'cowboy',
    'heart_eyes',
    'wink',
    'blush',
    'joy',
    'upside_down',
    'face_with_raised_eyebrow',
    'spy',
    'angel',
    'runner',
    'dancer',
    'metal',
    'vulcan',
    'v',
    'tada',
    'sparkles',
    'skull',
    'ghost',
    'alien',
    'robot',
    'pray',
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
    't_rex',
    'dragon_face',
    'deciduous_tree',
    'palm_tree',
    'shamrock',
    'hibiscus',
    'sunflower',
    'rose',
    'zap',
    'fire',
    'boom',
    'snowflake',
    'hamburger',
    'pizza',
    'taco',
    'pancakes',
    'ramen',
    'icecream',
    'cake',
    'soccer',
    'basketball',
    'football',
    'baseball',
    'tennis',
    'volleyball',
    'rugby_football',
    '8ball',
    'golf',
    'golfer',
    'ping_pong',
    'badminton',
    'hockey',
    'field_hockey',
    'fishing_pole_and_fish',
    'skier',
    'snowboarder',
    'swimmer',
    'surfer',
    'lifter',
    'bicyclist',
    'art',
    'musical_keyboard',
    'saxophone',
    'trumpet',
    'guitar',
    'video_game',
    'helicopter',
    'airplane',
    'rocket',
    'fireworks',
    'rainbow',
    'cityscape',
    'european_castle',
    'tv',
    'heart',
    'gem',
    'feet',
    '100',
  ]

  public colorOptions: string[] = [
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
    '#920000',
    '#A74812',
    '#C8C230',
    '#89AA2A',
    '#358742',
    '#309A87',
    '#2D6389',
    '#43529F',
    '#692A9A',
    '#822562',
    '#945527',
    '#2C2C2C',
  ]

  constructor(private _auth: AuthService) {}

  ngOnInit() {
    this.userSubscription = this._auth.currentUser.subscribe(user => {
      this.user = user
    })
  }

  ngOnDestroy() {
    if (!this.saved) {
      this._auth
        .updateUser(this.user)
        .pipe(take(1))
        .subscribe(data => {})
    }
    this.userSubscription && this.userSubscription.unsubscribe()
  }

  setEmoji(emoji: string) {
    // emoji = ':' + emoji + ':'

    this.tempLocalUserUpdate({ initials: ':' + emoji + ':' })
  }

  setColor(color: string) {
    this.tempLocalUserUpdate({ avatar: color })
  }

  /**
   * Update local user property for display while editing (eg. initials)
   * @todo move to AUTH
   * @param property "initials"
   * @param value "AB"
   */
  private tempLocalUserUpdate(values) {
    this.saved = false
    let user = this._auth.getUser()
    user = Object.assign(user, values)
    // This only updates the user locally, but will save update to DB when user finished
    this._auth.setUser(user)
  }

  public randomize() {
    let options = {
      initials: ':' + this.emojiOptions[Math.floor(Math.random() * this.emojiOptions.length)] + ':',
      avatar: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)],
    }

    this.tempLocalUserUpdate(options)
  }

  public reset() {
    let options = {
      initials: generateInitialsFromName(this.user.fullname),
      avatar: '#DEDEDE',
    }
    this.tempLocalUserUpdate(options)
  }

  public saveAndClose() {
    if (this.error || this.loading) {
      this.close.emit()
    }
    this.loading = true
    this.saved = true
    // Save to user in db
    this._auth
      .updateUser(this.user)
      .pipe(take(1))
      .subscribe(
        data => {
          this.loading = false
          this.close.emit()
        },
        err => {
          this.loading = false
          this.error = 'Unable to save'
        },
      )
  }
}
