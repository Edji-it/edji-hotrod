/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core'
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst'
import { Angulartics2 } from 'angulartics2'
import { PageScrollConfig } from 'ngx-page-scroll'

// import { AppState } from './app.service'
import { AuthService, MessageService } from './_services'
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
  `,
})
export class AppComponent {
  name = 'Edji'

  constructor(
    private angulartics: Angulartics2,
    angulartics2GoogleGlobalSiteTag: Angulartics2GoogleGlobalSiteTag,
    private _auth: AuthService,
    private _messages: MessageService,
  ) {
    angulartics2GoogleGlobalSiteTag.startTracking()
    // Scrollto should account for nav bar
    PageScrollConfig.defaultScrollOffset = 90
    PageScrollConfig.defaultDuration = 800
  }

  ngOnInit() {
    // Trigger the message service to start
    this._messages.init()
  }
}
