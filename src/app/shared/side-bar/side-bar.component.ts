import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { AuthService } from '../auth.service';

@Component({
  selector: 'side-bar',
  styleUrls: [ './side-bar.component.scss' ],
  templateUrl: './side-bar.component.html'
})
export class SideBarComponent {
    public commentCount = 0;
    private user: any;

    constructor(private _auth: AuthService, private _router: Router) {

    }
    
    ngOnInit() {
      this.user = this._auth.getUser();
    }

    toggleCommentCounts() {

    }

    logout() {
        this._auth.logout();
        this._router.navigate(['/home']);
    }
}
