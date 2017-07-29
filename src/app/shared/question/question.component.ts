import { Component, Input, OnInit } from '@angular/core';
import { }

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  /*
    19 July 2017
    Nick Pumper
    Last Mod: 29 July 2017

    Handles display of the Question.
  */
  
  @Input()
  private question: EdjiQuestion;

  @Input()
  private answers: any[]

  constructor() { }

  ngOnInit() {
  }

} // class