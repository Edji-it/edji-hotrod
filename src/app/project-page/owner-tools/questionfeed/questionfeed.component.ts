import { Project, Reading } from '../../../shared/datatypes'
import { Subscription } from 'rxjs'
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'

// Project dependencies
import { ReadingService } from '../../../_services'
import { ProjectStore } from 'src/app/_store'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'hot-questionfeed',
  templateUrl: 'questionfeed.component.html',
  styleUrls: ['./questionfeed.component.scss'],
})
export class QuestionfeedComponent implements OnInit, OnDestroy {
  public visible = false
  public slidePaneIn = false

  private project: Project
  private subscriptions: Subscription[] = []
  public currentReading: Reading

  constructor(
    private projectStore: ProjectStore,
    private _readings: ReadingService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
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
      // Subscribe to updates from that project once we're subscribed to the reading
      this.projectStore.currentProject.subscribe(
        project => {
          if (project) {
            this.project = project
          }
        },
        error => {
          console.error(error)
        },
      ),
      // Check for question feed opened via url
      this.route.queryParams.subscribe(params => {
        if (params['pane'] && params['pane'] === 'questions') {
          this.visible = true
          this.slidePaneIn = true
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
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Close Report
   * - Allows for animation to close before destroying the component
   */
  public close() {
    // Clear URL params
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { pane: null },
      queryParamsHandling: 'merge',
    })
  }
}
