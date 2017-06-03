import { Component, OnInit } from '@angular/core'

import { Reading } from './../../../shared/datatypes'

@Component({
  selector: 'hot-tutorial-reading',
  templateUrl: 'tutorial-reading.component.html'
})

export class TutorialReadingComponent implements OnInit {
  private reading: Reading = {
      _id: "58be15b2ab0b2900111652cc",
      title: "How to Make a Reading",
      draft: true,
      projects: []
    }

  constructor() { }

  ngOnInit() { }
}