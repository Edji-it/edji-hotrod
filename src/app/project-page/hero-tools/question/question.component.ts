import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../shared/datatypes";
import { CommentService, AuthService, ProjectService, ReadingService } from "../../../shared";
import { Subscription } from 'rxjs/Rx';

enum ResponseType {
  OpenEnded = 0,
  MultipleChoice = 1
} // 

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  /*
    29 July 2017
    Last Mod: 3 Aug 2017

    Handles display of the Question.
  */
  
  // These inputs are added into the template
  @Input()
  public question: EdjiQuestion; // The question being asked, and all of it's data and logic.
  @Input()
  public answers: EdjiComment[];
  @Input() // What kind of answers is this question given?
  public responseType : ResponseType = ResponseType.OpenEnded;
  
  // These inputs are caught events.
  @Input()
  public answerSubmitted : EventEmitter<any> = new EventEmitter();
  @Input()
  public answerDeleted : EventEmitter<any> = new EventEmitter();

  // State
  public questionOrder = 0; // Is this the first question? Or the second? Etc.

  private newAnswer : EdjiComment; // New answers will be loaded here.
  private currentReading: Reading;
  private user : User;
  private subscriptions : Subscription[] = [];
  public answerTypeStatus: any[] = []
  private optionTypeStatus: any[] = []
  private answerTypesAvailable: any[] = ['emoji', 'text', 'audio']
  private optionTypesAvailable: any[] = [{'type':'public','text':'public answers'}, {'type':'lock','text':'lock next questions'}]

  // Trigger Bools
  public userHasAnswered = false;

  // References
  private project: Project;

  constructor(
    private _projects : ProjectService, 
    private _readings : ReadingService,
    private _auth     : AuthService,
    private _comments : CommentService
  ) {
    this.user = this._auth.getUser();

    // TEMP
    this.question = new EdjiQuestion();
    console.log(this.question, this.question.prompt);
  } // constructor

  ngOnInit() {

    // Subscribe to the reading
    this.subscriptions.push( this._readings.currentReading.subscribe(
      reading => {
        this.currentReading = reading;
      },
      error => {
        console.error(error);
      }
    ))
    
    // Subscribe to updates from that project once we're subscribed to the reading
    this.subscriptions.push( this._projects.currentProject.subscribe(
      (project) => {
        if (project) {
          this.project = project
        }
      },
      (error) => {
        console.error(error)
      }
    ) )

    this.subscriptions.push(
        this._auth.getCurrentUser().subscribe((user) => {
            this.user = user
        })
    )

    for (let i = 0; i < this.answerTypesAvailable.length; i++) {
      this.answerTypeStatus[this.answerTypesAvailable[i]]=false
    }

    for (let i = 0; i < this.optionTypesAvailable.length; i++) {
      this.optionTypeStatus[this.optionTypesAvailable[i]]=false
    }
  } // ngOnInit

  public setQuestionOrder (input : string) : void {
    // Make sure there is no whitespace.
  } // setQuestionOrder

  // Tell the server we've got ourselves a new answer, aka a new EdjiComment
  public createAnswer (answer : any) : void {
    console.log("Began saving an answer!");

    let newAnswer : EdjiComment = answer as EdjiComment;

    // Tell the server we've added a comment.
    this._projects.saveComment(newAnswer)
    .then(comment => {
      comment.active = true
      this._comments.activeComment = comment

      // We're having an issue with questions.answers being undefined, so I put this here 8.2.17
      if (this.question.answers ===  undefined)
      {
        this.question.answers = [comment];
      } else {
        this.question.answers.push(comment);
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
  } // public createAnswer (type: string) : void

  public deleteAnswer (target : EdjiComment) : void {
    console.log("Deleting!");
  } // public deleteAnswer (target : EdjiComment)

  // Has the current user already answered this question?
  public hasUserAnswered () : boolean {

    if (this.question.answers != undefined)
    {
      for (let i = 0; i < this.question.answers.length; i++)
      {
        if (this.question.answers[i].author === this.user.fullname)
        {
          return true;
        } // if
      } // for
    } else {
      return false
    } // else

    return false;
  } // public hasCurrentUserAnswered () : boolean

  private enableAnswerOfType(type: string) {
    console.log('enabled ' + type + ' answer')
    this.answerTypeStatus[type] = !this.answerTypeStatus[type]
    console.log(this.answerTypeStatus[type])
  } // private enableAnswerOfType(type: string) 

  private enableOptionOfType(type: string) {
    console.log('enabled ' + type + ' option')
    this.optionTypeStatus[type] = !this.optionTypeStatus[type]
    console.log(this.optionTypeStatus[type])
  } // private enableOptionOfType(type: string)

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
      return this._comments.getCommentPermissions(comment, this.user, this.project)
  } //  private getCommentPermissions(comment: any): number
} // class