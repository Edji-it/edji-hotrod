import { Component, Input, OnInit } from '@angular/core';
import { EdjiComment, EdjiQuestion, Project, Reading, User } from "../datatypes";
import { CommentService, AuthService, ProjectService, ReadingService } from "./../";
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  /*
    29 July 2017
    Nick Pumper
    Last Mod: 1 Aug 2017

    Handles display of the Question.
  */
  
  @Input()
  public question: EdjiQuestion; // The question being asked, and all of it's data and logic.

  @Input()
  public answers: EdjiComment[] = [];

  // TEMP
  public tempQuestion : EdjiQuestion; //TEMP: Purely for testing.

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
    private _projects: ProjectService, 
    private _readings: ReadingService,
    private _auth: AuthService,
    private _comments: CommentService,
  ) {
    // TEMP CODE
    this.tempQuestion = new EdjiQuestion();
    this.tempQuestion.prompt = "Who is the world's greatest Air Force?";
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
    ) )

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

    // TEMP CODE:
    let newAnswer = <EdjiComment> {
      project_id: this.project._id,
      user_id: this.user._id,
      author: this.user.fullname,
      data: '',
      type: 'emoji'
    } // newAnswer

    this.answers = [];
  } // ngOnInit

  public setQuestionOrder (input : string) : void {
    // Make sure there is no whitespace.
  } // setQuestionOrder

  public addAnswerOfType (type: string) : void {
    // Tell the server we've got ourselves a new answer.
    this.createAnswer(type);
  } // public addAnswerOfType (type: string)

  public createAnswer (type: string) : void {
    let projectId = this.project._id
    
    let newAnswer = <EdjiComment> {
      project_id: projectId,
      user_id: this.user._id,
      author: this.user.fullname,
      data: '',
      type: type
    } // newAnswer

    newAnswer.new = true; // Set the answer as new

    // Load the method-level comment into the object-level so it can be displayed.
    this.newAnswer = newAnswer;

    if (type=='emoji') {
      this.activeEmojiKeyboardReply(this.newAnswer)
    }

    // ADD server level saving here.
    // Until that is done, this is temp code.

    this.newAnswer.active = true;
    this.newAnswer.project_id = projectId;
    this._comments.activeComment = this.newAnswer;

    this.answers.push(this.newAnswer);
    // END of temp code.
  } // public createAnswer (type: string) : void
  
  private activeEmojiKeyboardReply(activeReply: any): void {
    this._comments.activeComment = activeReply
    this._comments.isEmojiKeyboardActive(this.user)
  } // private activeEmojiKeyboardReply

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
      return this._comments.getCommentPermissions(comment, this.user, this.project)
  } // private getCommentPermissions(comment: any): number
} // class