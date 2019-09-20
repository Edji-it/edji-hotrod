import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { Subscription } from 'rxjs'

// Project Dependencies
import { EdjiComment, EdjiQuestion, Project, Reading, User } from '../datatypes'
import { CommentService, AuthService, ProjectService, ReadingService, SocketService } from '../../_services'
import { ProjectStore } from 'src/app/_store';

enum ResponseType {
  OpenEnded = 0,
  MultipleChoice = 1,
} //

@Component({
  selector: 'edji-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit, OnDestroy {
  /*
    29 July 2017
    Last Mod: 5 Aug 2017

    Handles display of the Question.
  */

  // INPUTS

  // The question being asked, and all of it's data and logic.
  // This reference is passed onto the Answer Component
  @Input()
  public question: EdjiQuestion
  @Input()
  public answers: EdjiComment[]
  @Input()
  public readOnly: boolean
  @Input()
  public editor: boolean
  // What kind of answers is this question given?
  // The corresponding one is toggled in the template.
  @Input()
  public responseType: ResponseType = ResponseType.OpenEnded

  @Output()
  questionDelete = new EventEmitter()

  @Output()
  questionUpdate = new EventEmitter()

  // State
  public questionOrder = 0 // Is this the first question? Or the second? Etc.

  private newAnswer: EdjiComment // New answers will be loaded here.
  private currentReading: Reading
  private user: User
  private subscriptions: Subscription[] = []
  private answersById: any = {}
  private questionOptionsStatus: boolean = false
  private ownerHidden: boolean = false
  private questionPos: number = 0

  // Set which answer types are allowed and which options to toggle.
  // Answer types are passed onto which ever Answer component
  // public answerTypesActive: string[] = []
  private optionTypeStatus: any[] = []
  private answerTypesAvailable: any[] = []
  private optionTypesAvailable: any[] = [
    {
      type: 'public',
      text: 'public answers',
    },
    {
      type: 'lock',
      text: 'lock next questions',
    },
  ]

  // References
  private project: Project

  constructor(
    private projectStore: ProjectStore,
    private _readings: ReadingService,
    private _auth: AuthService,
    private _comments: CommentService,
  ) {
    // TEMP
  } // constructor

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push(
      this._readings.currentReading.subscribe(
        reading => {
          this.currentReading = reading
          this.updateSelections()
        },
        error => {
          console.error(error)
        },
      ),
    )

    // Subscribe to updates from that project once we're subscribed to the reading
    this.subscriptions.push(
      this.projectStore.currentProject.subscribe(
        project => {
          if (project) {
            this.project = project
          }
        },
        error => {
          console.error(error)
        },
      ),
    )

    // Subscribe to updates to the answer reference object
    this.subscriptions.push(
      this.projectStore.answersById.subscribe(
        answersById => {
          this.answersById = answersById
        },
        error => {
          console.error(error)
        },
      ),
    )

    // Make sure we have the most current User object
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        this.answerTypesAvailable = this._auth.getAllowedCommentMediaTypes()
        this.updateSelections()
      }),
    )
  }

  public setQuestionOrder(input: string): void {
    // Make sure there is no whitespace.
  } // setQuestionOrder

  // Has the current user already answered this question?
  public hasUserAnswered(): boolean {
    if (this.answersById[this.question._id]) {
      for (let i = 0; i < this.answersById[this.question._id].length; i++) {
        if (this.project.answers && this.answersById[this.question._id][i].user_id === this.user._id) {
          return true
        }
      }
    } else {
      return false
    }
  } // public hasUserAnswered () : boolean

  /** Toggles answer selection
   * @param type A answer type
   */
  private toggleAnswerOfType(type: string) {
    if (this.question.answer_types.indexOf(type) < 0) {
      this.question.answer_types.push(type)
    } else {
      while (this.question.answer_types.indexOf(type) > -1) {
        this.question.answer_types.splice(this.question.answer_types.indexOf(type), 1)
      }
    }
    this.questionUpdate.emit(this.question)
  } // private toggleAnswerOfType(type: string)

  /** Toggles option selection
   * @param type A option type
   */
  private enableOptionOfType(type: string) {
    this.optionTypeStatus[type] = !this.optionTypeStatus[type]
    if (this.optionTypeStatus[type]) {
      this.question.option_types.push(type)
    } else {
      for (let i = 0; i < this.question.option_types.length; i++) {
        if (this.question.option_types[i] === type) {
          this.question.option_types.splice(i, 1)
          break
        }
      }
    }
  } // private enableOptionOfType(type: string)

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
    return this._comments.getCommentPermissions(comment, this.user, this.project)
  } //  private getCommentPermissions(comment: any): number

  /** Used to set the available answer and option types and also to set the current question position
   *
   */
  private updateSelections() {
    // Initialize the options for questions
    for (let i = 0; i < this.optionTypesAvailable.length; i++) {
      this.optionTypeStatus[this.optionTypesAvailable[i].type] = false
    }

    // Select the options if we're making an edit to the reading
    for (let i = 0; i < this.question.option_types.length; i++) {
      this.optionTypeStatus[this.question.option_types[i]] = true
    }

    // Also set the question position
    this.questionPos = this.question.question_number - 1
  }

  private textAreaAdjust(el, height) {
    let elHeight = height.offsetHeight * 1.2
    let element = el.srcElement
    element.style.height = elHeight + 'px'
  }

  /**
   * Test if an answer should be visible
   */
  private isAnswerVisible(answer): boolean {
    let isReadingOwner = this.project.isTeaching
    let isAnswerer = answer.user_id === this.user._id
    // isCommentVisible accounts for comment filters
    return (isReadingOwner || isAnswerer) && this.projectStore.isCommentVisible(answer)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
} // class
