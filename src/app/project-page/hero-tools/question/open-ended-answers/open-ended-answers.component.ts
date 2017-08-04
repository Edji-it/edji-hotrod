import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../../shared/datatypes";
import { CommentService, AuthService, ProjectService } from "../../../../shared";
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

  @Input() public questionCopy : EdjiQuestion // Provided by the EdjiQuestion

  @Input() public answerTypesAvailable: any[] = ['emoji', 'text', 'audio']

  // The EdjiComment that holds this answer will catch these.
  @Output() public answerSubmitted: EventEmitter<any> = new EventEmitter();
  @Output() public answerDeleted  : EventEmitter<any> = new EventEmitter();
  
  private answerTypeStatus: any[] = []
  private user : User;

  constructor(
    private _projects : ProjectService, 
    private _auth : AuthService,
    private _comments : CommentService
  ) {
    this.user = this._auth.getUser();
  } // constructor

  ngOnInit() {

    for (let i = 0; i < this.answerTypesAvailable.length; i++) {
      this.answerTypeStatus[this.answerTypesAvailable[i]]=false
    }

    console.log("OpenEnded question prompt is: " + this.questionCopy.prompt);
  } // ngOnInit

  // Tell the server we've got ourselves a new answer, aka a new EdjiComment
  public outputAnswer (type: string) : void {
    
    var newResponse = <EdjiComment> {
      user_id: this.user._id,
      author: this.user.fullname,
      data: '',
      type: type
    } // var newResponse = <EdjiComment>

    newResponse.new = true;

    this.activeEmojiKeyboardReply(newResponse);

    console.log("PRE-SEND: " + newResponse.type);

    // Tell the server we've added a comment.
    this._projects.saveComment(newResponse)
    .then(comment => {
      comment.active = true
      this._comments.activeComment = comment

      // We're having an issue with questions.answers being undefined, so I put this here 8.2.17
      if (this.questionCopy.answers ===  undefined)
      {
        this.questionCopy.answers = [comment];
      } else {
        this.questionCopy.answers.push(comment);
      } // if else
      
      console.log("server said we made a comment.");
      setTimeout(() => {
      }, 100)

      this.answerSubmitted.emit(newResponse);
    })
    .catch(error => {
      // TRACK EXCEPTION
      console.log("Making an answer has failed.");
      console.log(error)
    })
  } // public createAnswer (type: string) : void

  public deleteAnswer (target : EdjiComment) : void {
    console.log("Deleting!");
    this.answerDeleted.emit(target);
  } // public deleteAnswer (target : EdjiComment)

  private activeEmojiKeyboardReply(comment: EdjiComment): void {
    this._comments.activeComment = comment
    this._comments.isEmojiKeyboardActive(this.user)
  } // private activeEmojiKeyboardReply(activeReply: any): void

  private enableAnswerOfType(type: string) {
    console.log('enabled ' + type + ' answer')
    this.answerTypeStatus[type] = !this.answerTypeStatus[type]
    console.log(this.answerTypeStatus[type])
  }
} // class