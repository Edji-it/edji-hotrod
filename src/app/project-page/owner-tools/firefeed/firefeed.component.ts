import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Project dependencies
import { ProjectService } from '../../../shared/project.service';
import { ReadingService } from '../../../shared/reading.service';

@Component({
  selector: 'hot-firefeed',
  templateUrl: 'firefeed.component.html',
  styleUrls: ['./firefeed.component.scss']
})

export class FirefeedComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private project: any
  private currentReading: any

  constructor(
        private _projects: ProjectService, 
        private _readings: ReadingService
  ) { }

  ngOnInit() {
      // Subscribe to updates from that project
      this._projects.currentProject.subscribe(
          (project) => {
              if (project) {
                  this.project = project
              }
          },
          (error) => {
            // Show error
            console.log('cannot subscribe to project')
          })

      this._readings.currentReading.subscribe(
            reading => {
                this.currentReading = reading;
            },
            error => {
                console.error(error);
            }
        )
   }
}