import { Component, Input, OnInit } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../../../shared/datatypes";
import { CommentService, AuthService, ProjectService, ReadingService } from "../../../shared";
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  /*
    29 July 2017
    Last Mod: 2 Aug 2017

    Handles display of the Question.
  */
  
  @Input()
  public question: EdjiQuestion; // The question being asked, and all of it's data and logic.

  @Input()
  public answers: EdjiComment[];
  
  // @Input() question: any
  // @Output() deleteQuestion: EventEmitter<any> = new EventEmitter()

  // State
  public questionOrder = 0; // Is this the first question? Or the second? Etc.

  private newAnswer : EdjiComment; // New answers will be loaded here.
  private currentReading: Reading;
  private user : User;
  private subscriptions : Subscription[] = [];

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
  } // ngOnInit

  public setQuestionOrder (input : string) : void {
    // Make sure there is no whitespace.
  } // setQuestionOrder

  public addAnswerOfType (type: string) : void {
    // Tell the server we've got ourselves a new answer.
    this.createAnswer(type);
  } // public addAnswerOfType (type: string)

  // Creates a comment that is treated as an answer.
  public createAnswer (type: string) : void {
    console.log("Began creating an answer!");
    
    var newAnswer = <EdjiComment> {
      user_id: this.user._id,
      author: this.user.fullname,
      data: '',
      type: type
    } // var newAnswer = <EdjiComment>

    newAnswer.new = true;
    this.newAnswer = newAnswer;

    if (type=='emoji') {
      this.activeEmojiKeyboardReply(this.newAnswer)
    } // if

    // Tell the server we've added a comment.
    this._projects.saveComment(this.newAnswer)
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

  private activeEmojiKeyboardReply(activeReply: any): void {
    this._comments.activeComment = activeReply
    this._comments.isEmojiKeyboardActive(this.user)
  } // private activeEmojiKeyboardReply(activeReply: any): void
} // class