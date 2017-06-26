import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'edji-account',
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {
  private currentUser: any;
  private showPassModal: boolean = false;
  
  constructor(private _auth: AuthService, private _title: Title) {
    this.currentUser = this._auth.getUser();
  }

  ngOnInit() {
    this._title.setTitle('Edji | "' + this.currentUser['fullname'] + '"')
  }
}