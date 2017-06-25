import { Title } from '@angular/platform-browser';
import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AuthService, ReadingService, ProjectService } from '../shared';
import { User } from './../shared/datatypes'

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'dashboard',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './dashboard.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Set our default values
  private currentUser: User; 
  private subscriptions: Subscription[] = [];
  private mobileShowJoined:boolean = true;

  // Tool Tip variables
  private toolTipsContent: any[] = [
      {
          title: "The Dashboard",
          image: "/assets/dashboard-tooltips/logo.png",
          body: "This is The Dashboard, your hub to Edji. You can find all the Readings you have Created or Joined here!"
      },
      {
          title: "Joined Readings",
          image: "/assets/dashboard-tooltips/lightning-code.png",
          body: 'These are Readings that you join to read and comment on. Join a new one by using a Lightning Code!'
      },
      {
          title: "Created Readings",
          image: "/assets/dashboard-tooltips/reading.png",
          body: 'These are Readings that you created yourself. Each reading will have Groups, and each Group has a Lightning Code!'
      },
      {
          title: "Create A New Group",
          image: "/assets/dashboard-tooltips/groups.png",
          body: 'This creates an exact copy of a Reading that you can immediately share with a new Group of users.'
      },
      {
          title: "Copy & Edit",
          image: "/assets/dashboard-tooltips/versioning.png",
          body: 'This will create a new Version of your reading. This lets you simply add to, or edit a Reading you have already made.'
      }
  ]
  private toolTipStepNo: number = 1

  // TypeScript public modifiers
  constructor (
    public _router: Router,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private _title: Title
  ) {
    // this makes the window always render scrolled to the top
    this._router.events.subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  ngOnInit() {
    this.currentUser = this._auth.getUser();

    this._title.setTitle( 'Edji | Dashboard' )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }
}
