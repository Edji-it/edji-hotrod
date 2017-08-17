import { Component, Input, OnInit, EventEmitter } from '@angular/core'
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../shared/datatypes"
import { CommentService, AuthService, ProjectService, ReadingService } from "../../../shared"
import { Subscription } from 'rxjs/Rx'
import { Angulartics2 } from 'angulartics2'

export abstract class BaseAnswerComponent {

  /*
    4 Aug 2017
    Nick Pumper
    Last Mod: 4 Aug 2017

    The base class for handling display of answers for a QuestionComponent.
    - If you want to make a new Answer component for QuestionComponent to use,
      start by inheriting from this. It'll save you a lot of work.
  */

  @Input()
  public baseQuestionReference : EdjiQuestion // Provided by the EdjiQuestion hosting this.
  @Input()
  enabledAnswerTypes : any[] = ['text']


  // State
  public user : User;

  constructor(
    private _projects : ProjectService,
    private _readings : ReadingService,
    private _auth     : AuthService,
    private _comments : CommentService,
    private _angulartics: Angulartics2
  ) {
    this.user = this._auth.getUser()
  } // constructor

  ngOnInit () {

  }

  // Ask ProjectService to tell the server to save this comment.
  public saveAnswer(newAnswer : EdjiComment) : void {
    newAnswer.new = true

    newAnswer.user_id = this.user._id
    newAnswer.author = this.user.fullname

    // Please make sure the questionId is added to the answer as a reference.. this will error out otherwise
    newAnswer.questionId = this.baseQuestionReference._id // Be careful. This line literally breaks the entire thing without errors sometimes. 8.8.17
    
    this._angulartics.eventTrack.next({ action: newAnswer.type + 'AnswerCreate', properties: { category: 'heroFeature', label: 'attempt' }})

    // Tell the server we've added an answer
    this._projects.saveAnswer(newAnswer)
    .then(answer => {
      answer.active = true
      this._comments.activeComment = answer
      this._projects.addAnswerToAnswers(answer)
      this._projects.saveAnswer(answer)

      this._angulartics.eventTrack.next({ action: newAnswer.type + 'AnswerCreate', properties: { category: 'heroFeature', label: 'success' }})
    
      // setTimeout(() => {
      // }, 100)
    })
    .catch(error => {
      // TRACK EXCEPTION
      this._angulartics.eventTrack.next({ action: newAnswer.type + 'AnswerCreate', properties: { category: 'heroFeature', label: 'failure' }})
      console.log(error)
    })
  } // public saveAnswer (answer : EdjiComment) : void

  public activeEmojiKeyboardReply(comment: EdjiComment): void {
    this._comments.activeComment = comment
    this._comments.isEmojiKeyboardActive(this.user)
  } // public activeEmojiKeyboardReply(activeReply: any): void
} // class