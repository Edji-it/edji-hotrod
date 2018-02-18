/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'
import { Angulartics2 } from 'angulartics2'

import { AppState } from './app.service'
import { AuthService } from './shared'

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../sass/main.scss'
  ],
  template: `
    <main class="main">
      <router-outlet></router-outlet>
    </main>
    <footer></footer>
  `
})
export class AppComponent {
  name = 'Edji';

  constructor(
    public appState: AppState,
    private angulartics: Angulartics2,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private _auth: AuthService
    ) {

  }

  ngOnInit() {
    if (this._auth.getUser().isLoggedIn) {
      this.angulartics.eventTrack.next({ action: 'hasAccount', properties: { category: 'edjiUsage', label: 'success' }})
    }
  }

}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
