import { Component, OnInit } from '@angular/core'

import { Reading } from './../../../shared/datatypes'

@Component({
  selector: 'hot-tutorial-reading',
  templateUrl: 'tutorial-reading.component.html',
  styleUrls: ['./tutorial-reading.component.scss']
})

export class TutorialReadingComponent implements OnInit {
  /** This is a special reading - if the tutorial reading is ever updated, this id should be swapped out */
  private reading: Reading = {
      _id: "59153ba3613e6373274c11ff",
      title: "How to Make a Reading",
      draft: true,
      projects: []
    }

  constructor() { }

  ngOnInit() { }
}