import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ProjectService } from '../../shared/project.service';

@Component({
  selector: 'edji-delete-project',
  templateUrl: './delete-project.component.html'
})
export class DeleteProjectComponent implements OnInit {

  @Output() confirmModal = new EventEmitter();
  @Output() closeModal = new EventEmitter();
  @Input() project: any;

  showError: boolean = false;;

  constructor(private _projects: ProjectService, private angulartics: Angulartics2) { }

  ngOnInit() {

  }

  deleteProject() {
    this.angulartics.eventTrack.next({ action: 'deleteProject', properties: { category: 'contentManagement', label: 'attempt' }});
    /*this._projects.delete(this.project._id)
      .then(data => {
        this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'success' }});
        console.log(data);
        this.confirmModal.emit();
      }, error => {
        this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'failure' }});
        console.log(error);
        this.showError = true;
      });*/
    
  }

}