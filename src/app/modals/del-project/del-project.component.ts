import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ProjectService } from '../../_services'
import { Project } from '../../shared/datatypes'

@Component({
  selector: 'hot-del-project',
  templateUrl: 'del-project.component.html'
})
export class DeleteProjectModal implements OnInit {

  /*
  29 May 2017
  by Nick Pumper
  
  A prompt asking if we really want to delete a project.
  If no, it closes. Otherwise. it deletes it.
  */

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter(); // Tell the listening page to close the darned thing.
  @Output()
  deleteProject: EventEmitter<any> = new EventEmitter(); // Tell the listening page to enact the delete procedures. This is done in reading-card and reading.service

  @Input()
  // We need the project info because we want to say the project title in the prompt
  project : Project;

  public showError : boolean = false;

  constructor( 
    private _projects : ProjectService
  ) { }

  ngOnInit() { }

  // upon recieving a deleteReading event, our del-project modal will trigger this
  deleteThisProject(project : Project) : void {
    // Listen for an Observable from project.service.ts
    this._projects.delete(project)
      .pipe(take(1)) // so we don't need to unsubscribe
      .subscribe(
      data => { 
        // Data is updated through observables on the Reading service
      },
      err => {
        this.showError = true;
    })
  } // deleteProject(project : Project)

} // class DeleteProjectModule