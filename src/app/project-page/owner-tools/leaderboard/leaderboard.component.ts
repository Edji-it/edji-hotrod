import { Subscription } from 'rxjs'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

// Project Dependencies
import { CommentStats, Reading, User, Project, PublicUser } from './../../../shared/datatypes'
import { ProjectService, ReadingService, AuthService } from '../../../_services'
import { CommentFilter } from '../../../_services/project.service'

@Component({
  selector: 'hot-leaderboard',
  templateUrl: 'leaderboard.component.pug',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  @Input() archived: boolean = false
  @Input()
  set coOwnerGuide(val) {
    if (val === true) {
      if (this.coOwnerTooltipIndex < 0) {
        this.coOwnerTooltipIndex = 0
      }
    }
  }
  // Manage visibility with 2 way binding
  private visible: boolean = false
  @Output() visibilityChange: EventEmitter<boolean> = new EventEmitter()
  @Input()
  get visibility() {
    return this.visible
  }
  set visibility(val) {
    if (this.visible !== val) {
      this.visible = val
      this.visibilityChange.emit(this.visible)
    }
  }

  /** This is a reference to the actual commentStats object which has methods for modification of properties */
  @Input() commentStats: CommentStats

  private currentUser: User
  private currentReading: Reading
  private currentProject: Project
  private subscriptions: Subscription[] = []
  private answersById: any = {}
  private userAnswers: any[] = []

  public appliedFilter: CommentFilter
  public showFilterHeroModal: boolean
  public coOwnerToBe: User
  // Determines display of co-owner tooltips
  public coOwnerTooltipIndex: number = -1
  // Student settings display
  public studentSettingsIndex: number = -1

  constructor(
    private _readings: ReadingService,
    private _projects: ProjectService,
    private _auth: AuthService,
    private _route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // Subscribe to current user
    this._auth.getCurrentUser().subscribe(user => {
      this.currentUser = user
    }),
      // Subscribe to the reading
      this.subscriptions.push(
        this._readings.currentReading.subscribe(
          reading => {
            this.currentReading = reading
          },
          error => {
            console.error(error)
          },
        ),
        // Subscribe to updates to the answer reference object
        this._projects.answersById.subscribe(
          answersById => {
            this.answersById = answersById
          },
          error => {
            console.error(error)
          },
        ),
        // Subscribe to updates to the project
        this._projects.currentProject.subscribe(project => {
          this.currentProject = project
        }),
        // Get Updates about applied comment filters so we can show the user
        this._projects.filterUpdates.subscribe(filter => {
          this.appliedFilter = filter

          if (this.commentStats.stats.userStats) {
            for (let i = 0; i < this.commentStats.stats.userStats.length; i++) {
              this.commentStats.stats.userStats[i]['filtered'] = this.isStudentFiltered(
                this.commentStats.stats.userStats[i],
              )
            }
          }
        }),
      )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Checks to see if a user answered a question to fill in the answer bubble, else it will be a hollow bubble
   * @param questionId _id of the question we're checking
   * @param userId _id of the user that made the answer
   */
  public checkIsAnswered(questionId: string, userId: string): boolean {
    if (this.answersById[questionId]) {
      const len = this.answersById[questionId].length
      for (var i = 0; i < len; i++) {
        let answer = this.answersById[questionId][i]
        if (answer.user_id === userId) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Apply Student Filter
   * @param student User needs "_id" and "fullname"/"username"
   */
  public viewStudentFilter(student: any): void {
    // Hide dropdown
    this.studentSettingsIndex = -1
    // Toggle filter
    if (!this.isStudentFiltered(student)) {
      this._projects.filterByUser(student)
    } else {
      this._projects.clearFilters()
    }
  }

  /**
   * Page through Student Filters
   * @param pageChange how far, negative or positive, to paginate through students
   */
  public pageStudentFilter(pageChange: number): void {
    let currentIndex: number
    let newIndex: number
    let userCount: number = this.commentStats.stats.userStats.length
    // Find the current index/page of the applied student filter
    for (let i = 0; i < userCount; i++) {
      if (this.commentStats.stats.userStats[i]['filtered'] === true) {
        currentIndex = i
        break
      }
    }
    // Calc index of filter to change to
    newIndex = currentIndex + pageChange
    // If already first student, loop to the end
    if (newIndex < 0) {
      newIndex = userCount - 1
    }
    // If already last student, loop to the start
    if (newIndex >= userCount) {
      newIndex = 0
    }
    // Apply filter for student navigated to
    this.viewStudentFilter(this.commentStats.stats.userStats[newIndex])
  }

  /**
   * Clear Filters
   * @description clears any applied filters via project service
   */
  public clearFilter(): void {
    this._projects.clearFilters()
  }

  /**
   * Is Student Filtered
   */
  public isStudentFiltered(student: PublicUser): boolean {
    if (this.appliedFilter && this.appliedFilter.propertyFilters.user_id) {
      return this.appliedFilter.propertyFilters.user_id.test(student._id)
    } else {
      return false
    }
  }

  /**
   * Returns if user is co-teacher
   * @param student id
   */
  public isStudentCoTeacher(student: PublicUser): boolean {
    return this.currentProject.co_owner_ids && this.currentProject.co_owner_ids.indexOf(student._id) > -1
  }

  /**
   * Toggle Student settings dropdown
   * @param studentIndex
   */
  public toggleStudentSettings(studentIndex: number): void {
    if (this.studentSettingsIndex === studentIndex) {
      this.studentSettingsIndex = -1
    } else {
      this.studentSettingsIndex = studentIndex
    }
    // Progress guidance tooltips
    this.coOwnerTooltipNext()
  }

  /**
   * Trigger confirmation modal
   */
  public confirmCoOwner(student: User) {
    // Hide dropdown
    this.studentSettingsIndex = -1
    // Clear coowner tooltips
    this.coOwnerTooltipIndex = -1
    this.coOwnerToBe = student
  }

  /**
   * Progress the co-owner guide tooltip
   */
  public coOwnerTooltipNext(): void {
    if (this.coOwnerTooltipIndex > -1) {
      this.coOwnerTooltipIndex++
    }
    if (this.coOwnerTooltipIndex > 1) {
      this.coOwnerTooltipIndex = -1
    }
  }

  /**
   * Close the student list
   */
  public close(): void {
    this.router.navigate(['./'], {
      relativeTo: this._route,
      queryParams: { studentList: null },
      queryParamsHandling: 'merge',
    })
    this.visibility = false
    // Clear tooltips
    this.coOwnerTooltipIndex = -1
    // Close dropdowns
    this.studentSettingsIndex = -1
  }
}
