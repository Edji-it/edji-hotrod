import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService, CommentService } from '../../_services'
import { LockerService } from '../../_services/locker.service'
import { EmojiFilter, emojiFilters } from './emoji-values'

@Component({
  selector: 'emoji-keyboard',
  templateUrl: './emoji-keyboard.component.pug',
  styleUrls: ['./emoji-keyboard.component.scss'],
})
export class EmojiKeyboardComponent implements OnInit, AfterViewInit {
  private locker: LockerService

  private _isActive = false
  private currentComment: string

  @Input()
  set isActive(active: boolean) {
    this.currentComment = this._comments.activeComment.data
    if (this._isActive && active == false) {
      this.onInactivated()
    } else if (!this._isActive && active == true) {
      this.onActivated()
    }
    this._isActive = active
  }
  get isActive(): boolean {
    return this._isActive
  }

  // Handy internal element reference for controlling the emoji filter actions
  @ViewChild('emojiScrollArea', { static: false }) emojiScrollArea

  // Variables for controlling the emoji filter buttons
  private activeCategoryIndex: number = 0
  private scrollAreaOffset: number = 0

  public emojifilters: EmojiFilter[] = []
  public filtersLastIndex: number = 1

  // For search
  public searchTerm: string = ''
  public allEmoji: string[] = []
  public emojiResults: string[] = []

  constructor(private _locker: LockerService, private _auth: AuthService, private _comments: CommentService) {
    this.emojifilters = emojiFilters
    // Build "all" emoji array for searching against
    this.emojifilters.forEach((filter, index) => {
      if (filter.emoji && filter.emoji[0] && index != 0) {
        // We exclude the recent emoji array
        this.allEmoji = this.allEmoji.concat(filter.emoji)
      }
    })
  }

  ngOnInit() {
    if (this._auth.getUser().prefs && this._auth.getUser().prefs.recentEmoji) {
      this.emojifilters[0].emoji = this._auth.getUser().prefs.recentEmoji
    }
    this.filtersLastIndex = this.emojifilters.length
  }

  ngAfterViewInit() {
    this.updateScrollValues()
  }

  /**
   * Filters all emoji for those matching search term
   * @param searchTerm emoji short code
   */
  getEmojiResults(searchTerm: string) {
    if (!searchTerm) {
      this.emojiResults = []
      return
    }
    // Assume spaces are underscores
    searchTerm = searchTerm.replace(' ', '_')
    // Set to lowercase
    searchTerm = searchTerm.toLowerCase()
    this.emojiResults = this.allEmoji.filter(name => {
      return name.indexOf(searchTerm) > -1
    })
  }

  /**
   * Fired when active state of Keyboard is toggled off
   */
  onInactivated() {
    // Clear search
    this.searchTerm = ''
    this.emojiResults = []
    // Update user object with recent emoji
    let user = this._auth.getUser()
    if (!user.prefs) {
      user.prefs = {}
    }
    user.prefs.recentEmoji = this.emojifilters[0].emoji
    this._auth
      .updateUser(user)
      .pipe(take(1))
      .subscribe(data => {
        let user = data.user
        // UpdateUser does merging magic, bring back the merges!
        if (user && user.prefs && user.prefs.recentEmoji) {
          this.emojifilters[0].emoji = user.prefs.recentEmoji
        }
      })
    document.querySelector('.main').className = 'main'
  }

  onActivated() {
    document.querySelector('.main').className = 'main keyboard-adjust'
    /**
     * When set to active, keyboard loads all remaining emoji
     * We want to update the scroll values (used by categories), once:
     * - Icon/image (<i>) elements exist in the DOM (does not need to wait for images to load)
     * - Keyboard animation is complete
     */
    setTimeout(() => {
      this.updateScrollValues()
    }, 500)
  }

  // When clicking a category, jump to that section
  goToCategory(index): void {
    let scrollOffset = this.emojiScrollArea.nativeElement.querySelector('#category' + index).offsetTop
    this.emojiScrollArea.nativeElement.scrollTop = scrollOffset
    this.scrollAreaOffset = this.emojifilters[index]['scrollY']
  }

  scrollUpdate(event) {
    this.scrollAreaOffset = event.target.scrollTop
  }

  // Runs on view init and onresize, to keep scroll event light
  updateScrollValues() {
    // Get Y values for categories
    if (this._comments.emojiActive) {
      let filtersLength = this.emojifilters.length
      for (let i = 0; i < filtersLength; i++) {
        this.emojifilters[i]['scrollY'] = this.emojiScrollArea.nativeElement.querySelector('#category' + i).offsetTop
      }
    }
  }

  addEmoji(emoji: string): void {
    this._comments.emitInputToActive(emoji)
    // Update Recent Emoji
    let emojiLabel = emoji.replace(/:/g, '')
    let index = this.emojifilters[0].emoji.indexOf(emojiLabel)
    if (index < 0) {
      this.emojifilters[0].emoji.unshift(emojiLabel)
    } else {
      this.emojifilters[0].emoji.splice(index, 1)
      this.emojifilters[0].emoji.unshift(emojiLabel)
    }
    // Limit to 20
    if (this.emojifilters[0].emoji.length > 20) {
      this.emojifilters[0].emoji = this.emojifilters[0].emoji.slice(0, 19)
    }
    // Save to localstorage (which is then saved to the user object)
    this._locker.set('recentEmojis', this.emojifilters[0].emoji)
  }

  makeInactive(): void {
    // Hide keyboard
    this._comments.setEmojiActive(false)
    // Deactivate focused comment
    this._comments.deactivateComment()
  }
}
