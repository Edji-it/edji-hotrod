import { Subscription } from 'rxjs'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

// Project Dependencies
import { Reading, User, Project, PublicUser } from './../../../shared/datatypes'
import { ReadingService, AuthService } from '../../../_services'
import { CommentFilter } from '../../../_services/project.service'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'hot-leaderboard',
  templateUrl: 'leaderboard.component.pug',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  @Input() archived: boolean = false

  private currentUser: User
  private currentReading: Reading
  private currentProject: Project
  private subscriptions: Subscription[] = []
  private answersById: any = {}
  private userAnswers: any[] = []
  private numberOfStudents = 0
  private studentStats = []

  public visible: boolean = false
  public slidePaneIn: boolean
  public appliedFilter: CommentFilter
  public showFilterHeroModal: boolean
  public coOwnerToBe: User
  // Determines display of co-owner tooltips
  public coOwnerTooltipIndex: number = -1
  // Student settings display
  public studentSettingsIndex: number = -1

  constructor(
    private _readings: ReadingService,
    private projectStore: ProjectStore,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    // Subscribe to current user
    // Subscribe to the reading
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.currentUser = user
      }),
      this._readings.currentReading.subscribe(
        reading => {
          this.currentReading = reading
        },
        error => {
          console.error(error)
        },
      ),
      // Subscribe to updates to the answer reference object
      this.projectStore.answersById.subscribe(
        answersById => {
          this.answersById = answersById
        },
        error => {
          console.error(error)
        },
      ),
      // Subscribe to updates to the project
      this.projectStore.currentProject.subscribe(project => {
        this.currentProject = project
      }),
      // Get Updates about applied comment filters so we can show the user
      this.projectStore.filterUpdates.subscribe(filter => {
        this.appliedFilter = filter
        if (this.studentStats) {
          for (let i = 0; i < this.studentStats.length; i++) {
            this.studentStats[i].filtered = this.isStudentFiltered(this.studentStats[i])
          }
        }
      }),
      this.projectStore.commentStats.subscribe(commentStats => {
        this.studentStats = commentStats.stats.userStats
        this.numberOfStudents = this.studentStats.length
      }),
      // Check for question feed opened via url
      this.route.queryParams.subscribe(params => {
        if (params['pane'] && params['pane'] === 'students') {
          this.visible = true
          this.slidePaneIn = true
          if (params.studentList === 'coteach') {
            if (this.coOwnerTooltipIndex < 0) {
              this.coOwnerTooltipIndex = 0
            }
          }
        } else {
          // Close questions
          this.slidePaneIn = false
          setTimeout(() => {
            this.visible = this.slidePaneIn
          }, 400)
        }
      }),
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  /**
   * Apply Student Filter
   * @param studentId User needs "_id" and "fullname"/"username"
   */
  public viewStudentFilter(studentId: any): void {
    // Hide dropdown
    this.studentSettingsIndex = -1
    // Toggle filter
    if (!this.isStudentFiltered(studentId)) {
      this.projectStore.filterByUser(studentId)
    } else {
      this.projectStore.clearFilters()
    }
  }

  /**
   * Page through Student Filters
   * @param pageChange how far, negative or positive, to paginate through students
   */
  public pageStudentFilter(pageChange: number): void {
    let currentIndex: number
    let newIndex: number
    let userCount: number = this.studentStats.length
    // Find the current index/page of the applied student filter
    for (let i = 0; i < userCount; i++) {
      if (this.studentStats[i]['filtered'] === true) {
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
    this.studentStats[newIndex] && this.viewStudentFilter(this.studentStats[newIndex]._id)
  }

  /**
   * Clear Filters
   * @description clears any applied filters via project service
   */
  public clearFilter(): void {
    this.projectStore.clearFilters()
  }

  /**
   * Is Student Filtered
   */
  public isStudentFiltered(student: PublicUser): boolean {
    if (this.appliedFilter && this.appliedFilter.propertyFilters.user_id) {
      return this.appliedFilter.propertyFilters.user_id === student._id
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
      relativeTo: this.route,
      queryParams: { pane: null, studentList: null },
      queryParamsHandling: 'merge',
    })
    // Clear tooltips
    this.coOwnerTooltipIndex = -1
    // Close dropdowns
    this.studentSettingsIndex = -1
  }
}
