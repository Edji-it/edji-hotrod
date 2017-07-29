import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  @Input()
  private question: any

  @Input()
  private answers: any[]

  constructor() { }

  ngOnInit() {
  }

}