import { Subscription } from 'rxjs'
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core'

// Project Dependencies
import { AuthService, ReadingService, SocketService } from '../../_services'
import { CommentStats, Project, Reading } from './../../shared/datatypes'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'reader-tools',
  templateUrl: './reader-tools.component.pug',
  styleUrls: ['./reader-tools.component.scss'],
})
export class ReaderToolsComponent implements OnInit, OnDestroy {
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []

  public commentStats: CommentStats
  public currentProject: Project
  public currentReading: Reading
  public user: any = {}

  public readerToolShow: boolean

  // State vars
  public powersLoading: any = {}

  constructor(private projectStore: ProjectStore, private _auth: AuthService, private _readings: ReadingService) {}

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
      this.projectStore.currentProject.subscribe(
        project => {
          this.currentProject = project
        },
        error => {
          console.error(error)
        },
      ),
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      this.projectStore.commentStats.subscribe(stats => {
        this.commentStats = stats
      }),
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
