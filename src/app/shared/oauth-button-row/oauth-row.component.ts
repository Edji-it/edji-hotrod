import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'edji-oauth-row',
  templateUrl: './oauth-row.component.pug'
})

export class OauthRowComponent implements OnInit {
  // We assume "sign in" state, unless specified
  @Input() signUp: boolean
  
  constructor() { }

  ngOnInit() { }
}