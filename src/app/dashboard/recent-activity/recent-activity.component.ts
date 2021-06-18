import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ProjectService } from '../../_services'
import { act } from '@ngrx/effects'

@Component({
  selector: 'edji-recent-activity',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./recent-activity.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './recent-activity.component.pug',
})
export class RecentActivityComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = []
    private loading: boolean = true
    private projects: any = []

    public activity: any = []
  
    constructor(
      public router: Router,
      private _auth: AuthService,
      private angulartics: Angulartics2,
      private _project: ProjectService,
      fb: FormBuilder,
    ) { }
  
    ngOnInit() {
      this.loading = true
      this._project.getActivity().toPromise().then(data => {
        this.projects = data
        this.loading = false
      }).catch(err => {
        this.loading = false
      })
    }
  
    ngOnDestroy() {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe()
      })
    }
}