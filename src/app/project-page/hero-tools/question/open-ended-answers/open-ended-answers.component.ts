import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../../shared/datatypes";
import { CommentService, AuthService } from "../../../../shared";
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'open-ended-answers',
  templateUrl: './open-ended-answers.component.html',
  styleUrls: ['./open-ended-answers.component.scss']
})
export class OpenEndedAnswersComponent implements OnInit {

  /*
    3 Aug 2017
    Last Mod: 3 Aug 2017

    Handles the display and processing of open ended answers for EdjiQuestion's.
  */

  @Input() public answerTypesAvailable: any[] = ['emoji', 'text', 'audio']

  // The EdjiComment that holds this answer will catch these.
  @Output() public answerSubmitted: EventEmitter<EdjiComment> = new EventEmitter()
  @Output() public answerDeleted  : EventEmitter<EdjiComment> = new EventEmitter()
  
  private answerTypeStatus: any[] = []
  private user : User;

  constructor(
    private _auth : AuthService,
    private _comments : CommentService
  ) {
    this.user = this._auth.getUser();
  } // constructor

  ngOnInit() {

    for (let i = 0; i < this.answerTypesAvailable.length; i++) {
      this.answerTypeStatus[this.answerTypesAvailable[i]]=false
    }
  } // ngOnInit

  // Tell the server we've got ourselves a new answer, aka a new EdjiComment
  public outputAnswer (type: string) : void {
    console.log("Began creating an answer!");
    
    var newAnswer = <EdjiComment> {
      user_id: this.user._id,
      author: this.user.fullname,
      data: '',
      type: type
    } // var newAnswer = <EdjiComment>

    newAnswer.new = true;

    this.answerSubmitted.emit(newAnswer);
  } // public createAnswer (type: string) : void

  public deleteAnswer (target : EdjiComment) : void {
    console.log("Deleting!");
    this.answerDeleted.emit(target);
  } // public deleteAnswer (target : EdjiComment)

  private activeEmojiKeyboardReply(activeReply: any): void {
    this._comments.activeComment = activeReply
    this._comments.isEmojiKeyboardActive(this.user)
  } // private activeEmojiKeyboardReply(activeReply: any): void

  private enableAnswerOfType(type: string) {
    console.log('enabled ' + type + ' answer')
    this.answerTypeStatus[type] = !this.answerTypeStatus[type]
    console.log(this.answerTypeStatus[type])
  }
} // class