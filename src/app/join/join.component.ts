import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from './../shared/auth.service';
import { ProjectService } from './../shared/project.service';

@Component({
  selector: 'edji-join',
  templateUrl: 'join.component.html'
})
export class JoinComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  private projectId: string;
  // private guestForm: FormGroup;
  private loginForm: FormGroup;
  private loginLoading: boolean = false;
  private guestLoading: boolean = false;

  private errorObject: {
    invalidCode?:string,
    badName?:string,
    tempError?:string,
    loginError?:string
  } = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private _project: ProjectService,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    // this makes the window always render scrolled to the top
    this.router.events.subscribe(() => {
      window.scrollTo(0, 0);
    });

    // this.guestForm = fb.group({
    //   guestName: [null, Validators.required]
    // });

    this.loginForm = fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.projectId = params['projectId'];
      })
    );

    this.router.navigate(['/project', this.projectId]);

    if (this._auth.getUser().isLoggedIn) {
      this.router.navigate(['/project', this.projectId]);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() });
  }

  /**
   * Called upon completion of login by one of the forms
   */
  private loginSuccess(): void {
    this.router.navigate(['/project', this.projectId]);
  }
}