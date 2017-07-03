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
  templateUrl: './joined-dash.component.html'
})
export class JoinedDashComponent implements OnInit, OnDestroy {
  // Set our default values
  private projects: Array<any> = [];
  private errorObject = {
    wrongCode : "",
    projectError: ""
  };
  private subscriptions: Subscription[] = [];
  private isLoading: boolean = false;

  private codeForm: FormGroup;
  
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
      projectCode: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(4)])]
    });
  }

  ngOnInit() {
    this.isLoading = true;

    this._projects.getAll()
      .then(
        (data)  => {
          this.isLoading = false;
          this.projects = data;
        },
        (error) => {
          this.isLoading = false;
          this.angulartics.eventTrack.next({ action: "getAllProjects", properties: { category: "serviceCalls", label: "failure" }});
          this.errorObject.projectError = "We had some trouble getting your projects, it might be our fault";
        });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  /** attempts to navigate to the session */
  private addSession(formValue: any): void {

    this._projects.setCurrentProject(formValue.projectCode)
      .subscribe(
        (project) => {
          if (project) {
            this.router.navigate(['/project', project._id]);
          }
        },
        (error) => {
          this.errorObject.wrongCode = "Unfortunately, we did not find that project";
        }
      );
  }


}
