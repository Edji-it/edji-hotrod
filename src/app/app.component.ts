/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'
import { Angulartics2 } from 'angulartics2'

// import { AppState } from './app.service'
import { AuthService, MessageService } from './shared'

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
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
    private angulartics: Angulartics2,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private _auth: AuthService,
    private _messages: MessageService
    ) {

  }

  ngOnInit() {
    if (this._auth.getUser().isLoggedIn) {
      this.angulartics.eventTrack.next({ action: 'hasAccount', properties: { category: 'edjiUsage', label: 'success' }})
    }
    // Trigger the message service to start
    this._messages.init()
  }

}