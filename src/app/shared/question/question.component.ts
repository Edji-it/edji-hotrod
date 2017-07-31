import { Component, Input, OnInit } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading } from "../datatypes";

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  /*
    29 July 2017
    Nick Pumper
    Last Mod: 31 July 2017

    Handles display of the Question.
  */
  
  @Input()
  public question: EdjiQuestion; // The question being asked, and all of it's data and logic.

  @Input()
  private answers: EdjiComment[] 

  // TEMP
  public tempQuestion : EdjiQuestion; //TEMP: Purely for testing.

  // State
  public questionOrder = 0; // Is this the first question? Or the second? Etc.

  private project: Project = <Project>{}

  constructor() {
    // TEMP CODE
    this.tempQuestion = new EdjiQuestion();
    this.tempQuestion.prompt = "Who is the world's greatest Air Force?";
  } // constructor

  ngOnInit() {
  }

  public setQuestionOrder (input : string) : void {
    // Make sure there is no whitespace.
  } // setQuestionOrder

} // class