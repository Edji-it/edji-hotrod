import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '../../_services'
import { Angulartics2 } from 'angulartics2'

@Component({
  selector: 'tutorial-box',
  templateUrl: './tutorial-box.component.html',
  styleUrls: ['./tutorial-box.component.scss'],
})
export class TutorialBoxComponent implements OnInit {
  /*
    NOTE: IF there is no image, the TutorialBox will not display properly at all.
    */

  @Input() private pageObjs: any[]
  @Input() private tutorialName: string
  @Input() public forceShow: boolean
  @Input() public forceHide: boolean

  public pageNo: number = 1
  public subscriptions: Subscription[] = []
  public isCompleted: boolean = false

  @Output() pageChange: EventEmitter<any>
  @Output() dismiss: EventEmitter<any>

  @Input() set pager(pageNo: number) {
    this.pageNo = pageNo
  }
  get pager() {
    return this.pageNo
  }

  public increment() {
    this.pageNo = this.pageNo + 1
    this.pageChange.emit(this.pageNo)
  }

  public decrement() {
    this.pageNo = this.pageNo - 1
    this.pageChange.emit(this.pageNo)
  }

  constructor(private _auth: AuthService, private _angulartics: Angulartics2) {
    this.pageChange = new EventEmitter()
    this.dismiss = new EventEmitter()
  }

  private completeAndDismiss(): void {
    if (!this.tutorialName) {
      return
    }
    // Hide and emit output for closing box
    this.isCompleted = true
    this.forceShow = false
    this.dismiss.emit()
    // save completed guide to user object
    let user = this._auth.getUser()
    if (!user.prefs) {
      user.prefs = {}
    }
    if (!user.prefs.onboarding) {
      user.prefs.onboarding = {}
    }
    if (!user.prefs.onboarding[this.tutorialName]) {
      user.prefs.onboarding[this.tutorialName] = {
        firstDone: Date.now(),
        lastDone: Date.now(),
      }
    } else {
      user.prefs.onboarding[this.tutorialName].lastDone = Date.now()
      if (!user.prefs.onboarding[this.tutorialName].firstDone) {
        user.prefs.onboarding[this.tutorialName].firstDone = Date.now()
      }
    }
    // Save progress to user preferences
    this._auth
      .updateUser(user)
      .pipe(take(1))
      .subscribe(data => {
        let user = data.user
      })
    // Report to GA
    let action = this.pageNo === this.pageObjs.length ? `_completed` : `_dismissedAt${this.pageNo}Of${this.pageObjs.length}`
    this._angulartics.eventTrack.next({
      action: 'tutorialBox_' + this.tutorialName + action,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        if (
          user.prefs &&
          user.prefs.onboarding &&
          user.prefs.onboarding[this.tutorialName] &&
          user.prefs.onboarding[this.tutorialName].firstDone
        ) {
          this.isCompleted = true
        }
      }),
    )
  }

  /**
   * Opens and reports tutorial
   */
  openTutorial() {
    this.forceShow = true

    this._angulartics.eventTrack.next({
      action: 'tutorialBox_' + this.tutorialName + '_open',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }
}
