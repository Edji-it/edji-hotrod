import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../../shared/datatypes";
import { CommentService, AuthService, ProjectService } from "../../../../shared";
import { BaseAnswerComponent } from "./../base-answer.component";
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'open-ended-answers',
  templateUrl: './open-ended-answers.component.html',
  styleUrls: ['./open-ended-answers.component.scss']
})
export class OpenEndedAnswersComponent extends BaseAnswerComponent { // (BaseAnswerComponent as {new(); any;}) {

  /*
    3 Aug 2017
    Nick Pumper
    Last Mod: 4 Aug 2017

    Handles the display and processing of open ended answers for EdjiQuestion's.
    - A child of BaseAnswerComponent.

    NOTES:
      - 8.4.17 - For some reason inheriting from the abstract required me to use 
        " extends (BaseAnswerComponent as {new();})". No idea why, just follow it.
  */

  // This variable will allow the user to pick their preferred comment type.
  @Input() 
  public answerTypesAvailable : any[] = ['emoji', 'text', 'audio']

  private answerTypeStatus: any[] = []

  constructor () {
    super();
  } // constructor

  ngOnInit() {

    // Logic for making certain comment types available
    for (let i = 0; i < this.answerTypesAvailable.length; i++) {
      this.answerTypeStatus[this.answerTypesAvailable[i]]=false
    }

    console.log("OpenEnded question prompt is: " + this.baseQuestionReference.prompt);
  } // ngOnInit

  // Tell the server we've got ourselves a new answer, aka a new EdjiComment
  public outputAnswer (type: string) : void {
    
    // Make the comment to provide as the answer.
    var newResponse = <EdjiComment> {
      data: '',
      type: type
    } // var newResponse = <EdjiComment>

    if (type=='emoji') {
      this.activeEmojiKeyboardReply(newResponse);
    } // if
    // console.log("PRE-SEND: " + newResponse.type);

    // Ask the base class to send the comment to the server.
    this.saveAnswer(newResponse);
  } // public createAnswer (type: string) : void

  private enableAnswerOfType(type: string) {
    console.log('enabled ' + type + ' answer')
    this.answerTypeStatus[type] = !this.answerTypeStatus[type]
    console.log(this.answerTypeStatus[type])
  } // private enableAnswerOfType(type: string)
} // class