import { Title } from '@angular/platform-browser'
import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { Copy } from './../../shared'
import { AuthService, ProjectService } from './../../_services'
import { ALLSPARK } from './../../app.constants'
import { LockerService } from '../../_services/locker.service'

@Component({
    selector: 'edji-register',
    styles: [
        `
      .btn-group-wrapper {
        width: 100%;
        text-align: center;
      }

      .btn-group-wrapper label {
        margin: 0;
      }

      label.btn.btn-primary.active {
        border: 3px solid #4a92bc;
      }
    `,
    ],
    templateUrl: './create-profile-page.component.pug',
})
export class CreateProfilePageComponent implements OnInit, OnDestroy {
    /*
    Last Mod: 17 June 2017
  
    The page for registering a user.
    */

    private subscriptions: Subscription[] = []

    public successObject: {
    } = {}

    /** The reading id that the user wanted to make a copy of */
    public readingToAdd: string
    public projectToAdd: string

    constructor(
        private _auth: AuthService,
        private _router: Router,
        private _project: ProjectService,
        private route: ActivatedRoute,
        private angulartics: Angulartics2,
        private _fb: FormBuilder,
        private _title: Title,
        private _locker: LockerService,
    ) { }

    ngOnInit() {
        // This makes the window always render scrolled to the top
        let startEl = document.getElementById('top')
        startEl && startEl.scrollIntoView()

        this._title.setTitle('Edji | Create Profile')

        this.subscriptions.push(
            this.route.queryParams.subscribe(queryParams => {
                this.readingToAdd = queryParams['reading']
                this.projectToAdd = queryParams['project']
            }),
        )
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe()
        })
    }
}
