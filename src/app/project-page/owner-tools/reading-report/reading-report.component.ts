import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

// Project Dependencies
import { CommentFilter, ProjectService } from 'src/app/_services/project.service'
import { User, Project, EdjiComment } from '../../../shared/datatypes'
import { AuthService } from '../../../_services'
import { Subscription } from 'rxjs';

@Component({
  selector: 'hot-reading-report',
  templateUrl: './reading-report.component.pug',
  styleUrls: ['./reading-report.component.scss']
})
export class ReadingReportComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []
  private currentUser: User
  public project: Project = <Project>{}
  public appliedFilter: CommentFilter
  public comments: EdjiComment[] = []

  constructor(
    private _projects : ProjectService,
    private _auth: AuthService
  ) { }

  ngOnInit() {
    // Subscribe to current user
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe((user) => {
        this.currentUser = user
      })
    ),
    // Get Updates about applied comment filters so we can show the user
    this.subscriptions.push(
      this._projects.filterUpdates.subscribe(
        (filter) => {
          this.appliedFilter = filter
          console.log(filter)
        }
      )
    ),
    // Get Project from project service
    this.subscriptions.push(
      this._projects.currentProject.subscribe(
        (project) => {
            if (project) {
              this.project = project
              if (project && project.comments) {
                this._projects.filterByUser(this.currentUser)

                // Only handle comments that are the curent selected users'
                let commentsLength = this.project.comments.length
                for (let i=0; i<commentsLength; i++) {
                  let comment = this.project.comments[i]
                  if (this.appliedFilter.propertyFilters.user_id.test(comment.user_id)) {
                    this.comments.push(comment)
                  }
                }
              }
            }
        },
        (error) => {
            console.error(error)
        })
    )
  }

}
