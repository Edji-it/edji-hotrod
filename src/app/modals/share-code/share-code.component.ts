import { Subscription } from 'rxjs';
import { Project } from '../../shared/datatypes';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { UtilToolService, ProjectService } from './../../_services'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'share-code',
  templateUrl: './share-code.component.pug',
  styleUrls: ['./share-code.component.scss']
})
export class ShareCodeComponent implements OnInit, OnDestroy {

  @Input() private showOnNewReading: boolean
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  
  private codeLetters: any
  private subscriptions: Subscription[] = []
  public currentProject: Project

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private _projects: ProjectService
  ) {
    
  }

  ngOnInit() {
    // Subscribe to current Project data
    this.subscriptions.push(
      this._projects.currentProject.subscribe(
            project => {
                this.currentProject = project;
            },
            error => {
                console.error(error);
            }
        )
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  private isNumber(val) {
    return !isNaN(parseFloat(val)) && isFinite(val)
  }

  private navProject(project_id) {
    this._util.shareCodeModalClose()
    this.router.navigate(['project', project_id])
  }

  private navDashboard() {
    this._util.shareCodeModalClose()
    this.router.navigate(['dashboard'])
  }
}