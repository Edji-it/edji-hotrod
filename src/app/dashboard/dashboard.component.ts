import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AppState } from '../app.service';
import { AuthService } from '../shared/auth.service';
import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';

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
export class DashboardComponent {
  // Set our default values
  private readings: any;
  private projects: Array<any> = [];
  private currentUser: any; 
  private isTeacher: Boolean = false;
  private errorObject = {
    wrongCode : ""
  };

  // TypeScript public modifiers
  constructor(
      public appState: AppState, 
      public router: Router,
      private route: ActivatedRoute,
      private _auth: AuthService, 
      private _readings: ReadingService,
      private _projects: ProjectService
    ) {
      //
  }

  ngOnInit() {
    this.currentUser = this._auth.getUser();
    this.isTeacher = this.currentUser.isTeacher;

    this._readings.getAll()
      .then(
        (data)  => { 
          console.log(data);
          this.readings = data;
        },
        (error) => {

        });
    
    this._projects.getAll()
      .then(
        (data)  => { 
          console.log(data);
          this.projects = data;
        },
        (error) => {

        });
    
    console.log(this.route.routeConfig.path);
    console.log(this);

    // sessions.getAll().success(function(response){
    //     $scope.sessions = response;
    // });
  }

  deleteReading(reading) {

  }


}
