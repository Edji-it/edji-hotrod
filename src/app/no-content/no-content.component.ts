import { Component, OnInit } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'no-content',
  template: `
    <div>
      <h1>404: page missing</h1>
    </div>
  `
})
export class NoContentComponent implements OnInit {
  constructor(private angulartics: Angulartics2) {}

  ngOnInit() {
  }
}
