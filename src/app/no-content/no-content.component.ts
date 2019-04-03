import { Title } from '@angular/platform-browser'
import { Component, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

@Component({
  selector: 'no-content',
  templateUrl: 'no-content.component.html',
})
export class NoContentComponent implements OnInit {
  constructor(private angulartics: Angulartics2, private _title: Title) {}

  ngOnInit() {
    this._title.setTitle('Edji | 404')
  }
}
