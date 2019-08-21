import { Title } from '@angular/platform-browser'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { Ng4TwitterTimelineService } from './twitter-timeline'
import { AuthService, ProjectService, CopyService } from '../_services'

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home', // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [Title, Ng4TwitterTimelineService],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./home.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.pug',
})
export class HomeComponent implements OnInit, OnDestroy {
  // Set our default values
  private projectCode: string
  private joinLoading: boolean = false

  private subscriptions: Subscription[] = []

  private errorObject: {
    invalidCode?: string
    loginFailed?: string
    serverError?: string
  } = {}

  public showPassModal: boolean = false
  public showPromoVideoModal: boolean = false
  public tweetsLoaded: boolean = false
  private twitterRestyleAttempts = 0

  // TypeScript public modifiers
  constructor(
    private _auth: AuthService,
    private _project: ProjectService,
    private router: Router,
    private angulartics: Angulartics2,
    fb: FormBuilder,
    private _title: Title,
    private ng4TwitterTimelineService: Ng4TwitterTimelineService,
    private _copy: CopyService,
  ) {}

  ngOnInit() {
    this._title.setTitle('Edji')
    this.restyleTwitter()
  }

  private widgetCSS = `
    body{
      font-family: 'Open Sans';
    }
    .timeline-Header{
      display: none;
      background-color: white; 
      /** border-top-left-radius: 10px; border-top-right-radius: 10px; */
    }
    .timeline-Header-title{
      color: white;
    }
    .timeline-Tweet-text{
      color: #898989;
      font-size: 24px !important;
      line-height: 32px !important;
    }
    .timeline-Tweet {
      padding: 30px 20px;
    }
    .timeline-Tweet:hover {
      background: transparent !important;
    }
    .timeline-TweetList {
      white-space: nowrap;
      overflow-y: hidden;
      overflow-x: auto;
      display: block;
      width: 100%;
    }
    .timeline-TweetList-tweet {
      display: inline-block;
      height: 400px;
      width: 500px;
      max-width: 100vw;
      vertical-align: top;
      border-radius: 10px;
      border-top: none !important;
    }
    .timeline-TweetList-tweet:nth-of-type(2n+1){
      background: rgba(160,200,220,.12);
      border-radius: 10px;
    }
    .timeline-Footer {
      display: none;
    }
    .timeline-Body {
      border-top: none;
    }
    .timeline-Widget {
      max-width: 100%;
      width: 100vw;
      overflow-x: hidden;
    }
    `

  restyleTwitter() {
    if (this.twitterRestyleAttempts < 6) {
      setTimeout(() => {
        if (
          document.getElementById('twitter-widget-0') &&
          document.getElementById('twitter-widget-0')['contentDocument']
        ) {
          var w = document.getElementById('twitter-widget-0')['contentDocument']
          // console.log(w)
          var s = document.createElement('style')
          s.innerHTML = this.widgetCSS
          s.type = 'text/css'
          w.head.appendChild(s)
          this.tweetsLoaded = true
        } else {
          this.restyleTwitter()
        }
      }, 1000)
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe()
    })
  }

  /**
   * Validates project and then navigates to project if valid
   * @param code The project's short code
   */
  public joinSession(code: string): void {
    this.joinLoading = true
    this._project.validateProjectCode(code).subscribe(
      data => {
        this.joinLoading = false
        if (data.found) {
          this.router.navigate(['/project', data._id])
        } else {
          this.errorObject.invalidCode = "We don't think that's a real code :confused:"
        }
      },
      error => {
        this.joinLoading = false
        console.error(error)
        this.errorObject.invalidCode = "Oh no! Something went wrong and we don't know what happened!"
      },
    )
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = ''
      }
    }
  }
}
