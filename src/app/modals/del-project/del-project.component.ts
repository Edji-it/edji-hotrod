import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectService } from '../../shared';
import { Project }        from '../../shared/datatypes';

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
  @Output()
  refreshReadings : EventEmitter<any> = new EventEmitter(); // Pass up to created-dash.component

  @Input()
  // We need the project info because we want to say the project title in the prompt
  project : Project;

  public showError : boolean = false;

  constructor( 
    private _projects : ProjectService;
  ) { }

  ngOnInit() { }

  // upon recieving a deleteReading event, our del-project modal will trigger this
  deleteThisProject(project : Project) : void {
    // Listen for an Observable from project.service.ts
    this._projects.delete(project)
      .take(1) // so we don't need to unsubscribe
      .subscribe(
      data => { 
        // I'm just gonna ask created-dash to refresh the readings
        // instead of refreshing the project listing.
        this.refreshReadings.emit();
      },
      err => {
        
    })
  } // deleteProject(project : Project)

} // class DeleteProjectModule