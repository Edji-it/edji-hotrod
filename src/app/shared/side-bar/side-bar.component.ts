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
    private isTeacher: Boolean = false;

    constructor(private _auth: AuthService) {

    }
    
    ngOnInit() {
      this.user = this._auth.getUser();
    }

    toggleCommentCounts() {

    }

    logout() {
        
    }
}
