import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Project dependencies
import { ProjectService } from '../../../shared/project.service';

@Component({
  selector: 'hot-firefeed',
  templateUrl: 'firefeed.component.html',
  styleUrls: ['./firefeed.component.scss']
})

export class FirefeedComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private project: any

  constructor(
        private _projects: ProjectService
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
   }
}