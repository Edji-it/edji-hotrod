import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

  constructor(private _projects: ProjectService) { }

  ngOnInit() {

  }

  deleteProject() {
    this._projects.delete(this.project._id)
      .then(data => {
        console.log(data);
        this.confirmModal.emit()
      }, error => {
        console.log(error);
        this.showError = true;
      });
    
  }

}