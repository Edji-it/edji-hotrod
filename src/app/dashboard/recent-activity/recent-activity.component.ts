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
      this.projects = []
      this.loading = true
      this._project.getActivity().toPromise().then(data => {
        this.projects = data

        this.projects.forEach((project) => {
          let toAdd = project.comments.length < 5 ? project.comments.length : 5
          for(let i = 0; i < toAdd; i++) {
            project.comments[i].show = true
            project.comments[i].index = i
          }
          project.curStart = toAdd
        });

        this.loading = false
      }).catch(err => {
        this.loading = false
      })

      // Rest of this is test stuff
      this.loading = false;
      this.projects = [
        {
          name: "Test Activity",
          group: "Test Group",
          _id: "ID",
          date: "2021-03-13T19:36:12.667Z",
          comments: [
            {
              show: false,
              _id: "ID",
              author: {
                _id: "604d142cb74936003ff2613b",
                fullname: "Ben Nylund",
                firstname: "Ben",
                lastname: "Nylund",
                initials: "BN",
                hero_status: true,
                avatar: "#822562",
                createdAt: "2021-03-13T19:36:12.667Z",
                updatedAt: "2021-07-02T02:29:10.354Z",
              },
              date: "2021-06-30T12:00:00.667Z",
              type: "reply",
              data: "Comment data here",
              text: "Text from reading here",
              replyTo: {
                _id: "ID",
                author: {
                  _id: "604d142cb74936003ff2613b",
                  fullname: "Ben Nylund",
                  firstname: "Ben",
                  lastname: "Nylund",
                  initials: "BN",
                  hero_status: true,
                  avatar: "#822562",
                  createdAt: "2021-03-13T19:36:12.667Z",
                  updatedAt: "2021-07-02T02:29:10.354Z",
                },
                date: "2021-03-13T19:36:12.667Z",
                type: "comment",
                data: "Comment to reply to",
                text: "Text from reading here",
              }
            }
          ]
        }
      ]

      for(let i = 0; i < 10; i++) {
        let newCom = JSON.parse(JSON.stringify(this.projects[0].comments[0]));
        if(i % 2 === 0) {
          newCom.replyTo = undefined;
          newCom.type = "comment";
        }
        this.projects[0].comments.push(newCom);
      }

      this.projects.forEach((project) => {
        let toAdd = project.comments.length < 5 ? project.comments.length : 5
        for(let i = 0; i < toAdd; i++) {
          project.comments[i].show = true
          project.comments[i].index = i
        }
        project.curStart = toAdd
      });
    }
  
    ngOnDestroy() {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe()
      })
    }

    showMore(projectId) {
      let project = this.projects.find(x => x._id === projectId)
      let endIndex = project.comments.length < (project.curStart+5) ? project.comments.length : (project.curStart+5)
      for(let i = 0; i < endIndex; i++) {
        project.comments[i].show = true
        project.comments[i].index = i
      }
      project.curStart = endIndex
    }

    showComment(projectId, commentId, replyId) {
      this.router.navigate([`/project/${projectId}`], { queryParams: { comment: commentId, reply: replyId }})
    }

    scroll(id) {
      document.getElementById(id).scrollIntoView({
        behavior: 'smooth',
      });
    }

    navigate(projectId) {
      this.router.navigate([`/project/${projectId}`], { queryParams: { pane: 'comments' } })
    }
}