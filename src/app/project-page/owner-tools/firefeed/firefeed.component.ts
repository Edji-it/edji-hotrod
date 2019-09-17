import { Project, Reading } from '../../../shared/datatypes'
import { Subscription } from 'rxjs'
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'

// Project dependencies
import { ReadingService } from '../../../_services'
import { ProjectStore } from 'src/app/_store';

@Component({
  selector: 'hot-firefeed',
  templateUrl: './firefeed.component.pug',
  styleUrls: ['./firefeed.component.scss'],
})
export class FirefeedComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []
  private project: Project
  public currentReading: Reading

  constructor(private projectStore: ProjectStore, private _readings: ReadingService) { }

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
    )
    // Subscribe to updates from that project once we're subscribed to the reading
    this.subscriptions.push(
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
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
