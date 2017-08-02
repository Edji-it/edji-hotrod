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

    if (type=='emoji') {
      this.activeEmojiKeyboardReply(newAnswer)
    }

    // Tell the server we've added a comment.
    this._projects.saveComment(newAnswer)
    .then(comment => {
      comment.active = true
      this._comments.activeComment = comment
      setTimeout(() => {
      }, 100)
    })
    .catch(error => {
      // TRACK EXCEPTION
      console.log(error)
    })
  } // public createAnswer (type: string) : void

  public deleteAnswer (target : EdjiComment) : void {
    console.log("Deleting!");
  } // public deleteAnswer (target : EdjiComment)

  private activeEmojiKeyboardReply(activeReply: any): void {
    this._comments.activeComment = activeReply
    this._comments.isEmojiKeyboardActive(this.user)
  } // private activeEmojiKeyboardReply(activeReply: any): void
} // class