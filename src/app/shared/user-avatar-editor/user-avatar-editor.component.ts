import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { map, take } from 'rxjs/operators'

// Project Dependencies
import { PublicUser, User } from '../datatypes'
import { ProjectStore } from 'src/app/_store'
import { generateInitialsFromName } from 'src/app/_store/user.decorators'
import { AuthService } from 'src/app/_services'
import { userColorOptions, userEmojiOptions } from './user-avatar-values'

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
  public tab: 'emoji' | 'color' = 'color'
  public loading: boolean
  public initialized: boolean
  public error: string

  public emojiOptions: string[] = userEmojiOptions
  public colorOptions: string[] = userColorOptions

  constructor(private _auth: AuthService) {}

  ngOnInit() {
    this.userSubscription = this._auth.currentUser.subscribe(user => {
      this.user = user
    })
    // Prevent clickOutside from firing on opening click
    setTimeout(() => {
      this.initialized = true
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
    this.localUserUpdate({ initials: ':' + emoji + ':' })
  }

  setColor(color: string) {
    this.localUserUpdate({ avatar: color })
  }

  /**
   * Update local user property for display while editing (eg. initials)
   * @param values properties to update
   */
  private localUserUpdate(values) {
    this.saved = false
    this._auth.tempLocalUserUpdate(values)
  }

  /**
   * Picks random color and emoji
   */
  public randomize() {
    let options = {
      initials: ':' + this.emojiOptions[Math.floor(Math.random() * this.emojiOptions.length)] + ':',
      avatar: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)],
    }

    this.localUserUpdate(options)
  }

  /**
   * Resets avatar to default "initials"
   */
  public reset() {
    let options: any = {
      avatar: '#DEDEDE',
    }
    if (this.user.firstname && this.user.lastname) {
      options.initials = ('' + this.user.firstname[0] + this.user.lastname[0]).trim()
    } else if (this.user.fullname) {
      options.initials = generateInitialsFromName(this.user.fullname)
    } else {
      options.initials = ''
    }
    this.localUserUpdate(options)
  }

  /**
   * Saves changes to user in DB, closes tooltip
   * @fires close Output
   */
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
