import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AudioService, AuthService, ProjectService } from '../../_services'

@Component({
  selector: 'edji-recent-activity',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [AudioService],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./recent-activity.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './recent-activity.component.pug',
})
export class RecentActivityComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  loading: boolean = true
  private projects: any = []

  public activity: any = []

  constructor(
    public router: Router,
    private _auth: AuthService,
    private angulartics: Angulartics2,
    private _project: ProjectService,
    private _audio: AudioService,
    fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.projects = []
    this.loading = true
    this._project
      .getActivity()
      .toPromise()
      .then(data => {
        this.projects = data

        this.projects.forEach(project => {
          project.curPage = 1
        })

        this.loading = false
      })
      .catch(err => {
        this.loading = false
      })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  showMore(projectId) {
    let project = this.projects.find(x => x._id === projectId)
    project.loading = true
    this._project
      .getActivity(`page=${project.curPage + 1}&project=${projectId}`)
      .toPromise()
      .then(data => {
        project.loading = false
        project.curPage++
        project.comments.push(...data[0].comments)
      })
      .catch(err => {
        project.loading = false
      })
  }

  showComment(projectId, commentId, replyId) {
    this.router.navigate([`/project/${projectId}`], { queryParams: { comment: commentId, reply: replyId } })
  }

  scroll(id) {
    document.getElementById(id).scrollIntoView({
      behavior: 'smooth',
    })
  }

  navigate(projectId) {
    this.router.navigate([`/project/${projectId}`], { queryParams: { pane: 'comments' } })
  }
}
