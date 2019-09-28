import { Component, Input, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { EdjiComment, EdjiQuestion, Project, Reading, User } from '../datatypes'
import { CommentService, AuthService, ReadingService } from '../../_services'
import { ProjectStore } from 'src/app/_store'

export abstract class BaseAnswerComponent implements OnInit {
  /*
    4 Aug 2017
    Nick Pumper
    Last Mod: 4 Aug 2017

    The base class for handling display of answers for a QuestionComponent.
    - If you want to make a new Answer component for QuestionComponent to use,
      start by inheriting from this. It'll save you a lot of work.
  */

  @Input()
  public baseQuestionReference: EdjiQuestion // Provided by the EdjiQuestion hosting this.
  @Input()
  enabledAnswerTypes: any[] = ['text']

  // State
  public user: User

  constructor(
    private _projectStore: ProjectStore,
    private _readings: ReadingService,
    private _auth: AuthService,
    private _comments: CommentService,
    private _angulartics: Angulartics2,
  ) {
    this.user = this._auth.getUser()
  }

  ngOnInit() {}

  // Ask ProjectService to tell the server to save this comment.
  public saveAnswer(newAnswer: EdjiComment): void {
    newAnswer.new = true

    newAnswer.user_id = this.user._id
    if (!newAnswer.author) {
      newAnswer.author = this.user.fullname
    }

    // Please make sure the questionId is added to the answer as a reference.. this will error out otherwise
    newAnswer.questionId = this.baseQuestionReference._id // Be careful. This line literally breaks the entire thing without errors sometimes. 8.8.17

    this._angulartics.eventTrack.next({
      action: newAnswer.type + 'AnswerCreate',
      properties: { category: 'heroFeature', label: 'attempt' },
    })

    // Tell the server we've added an answer
    this._projectStore
      .saveAnswer(newAnswer)
      .then(answer => {
        answer.active = true
        this._comments.activeComment = answer
        this._projectStore.addAnswerToAnswers(answer)
        this._projectStore.saveAnswer(answer)
      })
      .catch(error => {
        console.error(error)
      })
  }

  public activeEmojiKeyboardReply(comment: EdjiComment): void {
    this._comments.activeComment = comment
    this._comments.setEmojiKeyboardActive(this.user)
  }
}
