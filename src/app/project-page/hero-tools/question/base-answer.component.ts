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
  */

  @Input()
  public baseQuestionReference : EdjiQuestion // Provided by the EdjiQuestion hosting this.

  // State
  public user : User;
  
  // References
  public _projects : ProjectService;
  public _auth : AuthService;
  public _comments : CommentService;

  constructor() {
    this.user = this._auth.getUser();
  } // constructor

  ngOnInit () {}

  // Ask ProjectService to tell the server to save this comment.
  public saveAnswer (newAnswer : EdjiComment) : void {
    newAnswer.new = true;

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

} // class