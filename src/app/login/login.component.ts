import { Title } from '@angular/platform-browser'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ProjectService } from '../_services'

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'hot-login', // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  templateUrl: './login.component.pug',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []

  // Set our default values
  private sessionCode: String
  public loginLoading: Boolean = false
  public showPassModal: boolean = false

  // TypeScript public modifiers
  constructor(
    private _auth: AuthService,
    private _project: ProjectService,
    private _router: Router,
    private route: ActivatedRoute,
    private _title: Title,
  ) {
    this.subscriptions.push(
      // this makes the window always render scrolled to the top
      this._router.events.subscribe(() => {
        window.scrollTo(0, 0)
      }),
      this.route.queryParams.subscribe(params => {
        let modalLink = params['mlink']
        if (modalLink === 'forgot') {
          this.showPassModal = true
        }
      }),
    )
  }

  ngOnInit() {
    let user = this._auth.getUser()
    if (user && user.isLoggedIn) {
      this._router.navigate(['/dashboard'])
    }

    this._title.setTitle('Edji | Login')
  }

  public loginSuccess(): void {
    this._router.navigate(['/dashboard'])
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
