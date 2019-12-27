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
  public error: string

  public emojiOptions: string[] = userEmojiOptions
  public colorOptions: string[] = userColorOptions

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
      initials: ('' + this.user.firstname[0] + this.user.lastname[0]).trim(),
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
