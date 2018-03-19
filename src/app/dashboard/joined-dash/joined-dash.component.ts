import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AuthService, ReadingService, ProjectService } from '../../shared';

@Component({
  selector: 'edji-joined-dash',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './joined-dash.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './joined-dash.component.pug'
})
export class JoinedDashComponent implements OnInit, OnDestroy {
  // Set our default values
  private projects: Array<any> = [];
  private errorObject = {
    wrongCode : "",
    projectError: ""
  };
  private subscriptions: Subscription[] = [];
  private codeForm: FormGroup;

  // Joined Readings, p-datalist values
  private loading: boolean = true
  private first: number = 0 // first page 
  private rows: number = 25 // number of Readings to return
  private total: number = 25 // total Readings
  
  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService, 
    private _projects: ProjectService,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    this.codeForm = fb.group({
      projectCode: [null, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    // datalist component intializes by calling laodJoinedFeed()
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  /**
   * Load Created with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadJoinedFeed(paging?: any){
    let filters = {}
    this.loading = true

    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? (parseInt(paging.first) - 1) : this.first
    if (this.first < 0) { this.first = filters['start'] = 0 }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    this._projects.getJoined(filters)
      .subscribe(data => {
        this.loading = false;
        this.total = data.total;
        this.projects = data.projects;
      },
      (error) => {
        this.loading = false;
        this.angulartics.eventTrack.next({ action: "getAllProjects", properties: { category: "serviceCalls", label: "failure" }});
        this.errorObject.projectError = "We had some trouble getting your projects, it might be our fault";
      })
  }

  /** attempts to navigate to the session */
  private addSession(formValue: any): void {

    this._projects.setCurrentProject(formValue.projectCode)
      .subscribe(
        (project) => {
          this.router.navigate(['/project', project._id]);
        },
        (error) => {
          this.errorObject.wrongCode = "Unfortunately, we did not find that project";
        }
      );
  }


}
