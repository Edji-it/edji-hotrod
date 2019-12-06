import { Component, OnInit } from '@angular/core'

import { Reading } from './../../../shared/datatypes'

@Component({
  selector: 'hot-tutorial-reading',
  templateUrl: './tutorial-reading.component.pug',
  styleUrls: ['./tutorial-reading.component.scss'],
})
export class TutorialReadingComponent implements OnInit {
  /** This is a special reading - if the tutorial reading is ever updated, this id should be swapped out */
  public reading: Reading = {
    _id: '593319c7da3d54001102e166',
    title: 'How to Make a Reading',
    draft: true,
    projects: [],
    reading_type: 'private',
  }

  constructor() {}

  ngOnInit() {}
}
