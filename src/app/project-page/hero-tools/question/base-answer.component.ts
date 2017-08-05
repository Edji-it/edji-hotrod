import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../shared/datatypes";
import { CommentService, AuthService, ProjectService, ReadingService } from "../../../shared";
import { Subscription } from 'rxjs/Rx';

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

  // State
  public user : User;

  constructor(
    private _projects : ProjectService,
    private _readings : ReadingService,
    private _auth     : AuthService,
    private _comments : CommentService
  ) {
    console.log("HEY IS AUTH NULL?!?!?" + this._auth);
    this.user = this._auth.getUser();
  } // constructor

  ngOnInit () {

  }

  // Ask ProjectService to tell the server to save this comment.
  public saveAnswer (newAnswer : EdjiComment) : void {
    newAnswer.new = true;

    newAnswer.user_id = this.user._id;
    newAnswer.author = this.user.fullname;
    
    // Tell the server we've added a comment.
    this._projects.saveComment(newAnswer)
    .then(comment => {
      comment.active = true
      this._comments.activeComment = comment

      // We're having an issue with questions.answers being undefined, so I put this here
      if (this.baseQuestionReference.answers ===  undefined)
      {
        this.baseQuestionReference.answers = [comment];
      } else {
        this.baseQuestionReference.answers.push(comment);
      } // if else
      
      console.log("server said we made a comment.");
      setTimeout(() => {
      }, 100)
    })
    .catch(error => {
      // TRACK EXCEPTION
      console.log("Making an answer has failed.");
      console.log(error)
    })
  } // public saveAnswer (comment : EdjiComment) : void

  public deleteAnswer (target : EdjiComment) : void {
    console.log("Deleting!");
    this._projects.deleteComment(target);
  } // public deleteAnswer (target : EdjiComment)

  public activeEmojiKeyboardReply(comment: EdjiComment): void {
    this._comments.activeComment = comment
    this._comments.isEmojiKeyboardActive(this.user)
  } // public activeEmojiKeyboardReply(activeReply: any): void
} // class