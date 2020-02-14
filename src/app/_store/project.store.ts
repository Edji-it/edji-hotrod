import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subscription, Subject, of } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'
import { Store } from '@ngrx/store'

// Internal
import { CommentStats, EdjiComment, PublicUser, Project, User, UserReadingStatus } from '../shared/datatypes'
import {
  CommentFilter,
  AuthService,
  SocketService,
  CommentPropertyFilters,
  ProjectService,
  AcademyService,
  MessageService,
} from '../_services'
import { decorateArchivedProject } from './project.decorators'
import { generateInitialsFromName } from './user.decorators'
import { AppState } from '../_reducers'
import { IncrementMetric } from '../_reducers/metrics.reducers'

@Injectable()
export class ProjectStore {
  // For verifying comment ownership on heat vision
  private user: any

  subscriptions: Subscription[] = []

  /**
   * Project Store: This value is the source of truth
   **/
  private currentProjectSource = new BehaviorSubject<any>({ title: 'initial value' })
  public currentProject = this.currentProjectSource.asObservable()

  /**
   * Subset: Observable for changes on project users
   */
  private joinedUsersSource = new BehaviorSubject<PublicUser[]>([])
  public joinedUsers = this.joinedUsersSource.asObservable()

  /**
   * Subset: Observable for user information from projects
   */
  private _commentStats = new CommentStats() // local version to store state
  private commentStatsSource = new BehaviorSubject(this._commentStats)
  public commentStats = this.commentStatsSource.asObservable()

  /**
   * Updated Reference Object
   * Reference comments by word index
   */
  private commentsByIndexSubject = new BehaviorSubject<EdjiComment[][]>([])
  public commentsByIndex = this.commentsByIndexSubject.asObservable()

  /**
   *  Updated Reference Object
   * Reference comment replies by comment id
   */
  private repliesByIdSubject = new BehaviorSubject<any>({})
  public repliesById = this.repliesByIdSubject.asObservable()

  /**
   *  Updated Reference Object
   * Reference answers by question id
   */
  private answersByIdSubject = new BehaviorSubject<any>({})
  public answersById = this.answersByIdSubject.asObservable()

  /**
   *  Comments by Position
   *  - position = lineY of a comment
   *  - Comments are indexed by their "lineY" value
   */
  public commentByPosSource: any[][] = []
  private commentByPosSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.commentByPosSource)
  public commentByPos: Observable<any> = this.commentByPosSubject.asObservable()

  // Broadcast rendering the lastword element if firefeed view image reference doesn't have the image rendered yet
  public lastWordUpdateSubj: Subject<number> = new Subject<number>()
  public lastWordUpdateState: Observable<number> = this.lastWordUpdateSubj.asObservable()

  /**
   * Comment Filters
   */
  public activeFilter: CommentFilter
  private filterUpdatesSource: Subject<CommentFilter> = new Subject<CommentFilter>()
  public filterUpdates: Observable<CommentFilter> = this.filterUpdatesSource.asObservable()

  constructor(
    private _auth: AuthService,
    private _socket: SocketService,
    private _project: ProjectService,
    private angulartics: Angulartics2,
    private _academy: AcademyService,
    private _messages: MessageService,
    private store: Store<AppState>,
  ) {
    /** Set the current user every time it changes */
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        // Update project if necessary
        this.updateCurrentProjectPermissions(this.currentProjectSource.value, this.user, true)
      }),
      this._socket.commentUpdates.subscribe(
        commentUpdate => {
          let comment = commentUpdate.comment
          let selfUpdate = comment.user_id === this.user._id
          if (selfUpdate && commentUpdate.action !== 'DELETE') {
            // A user's comment edits should not update via sockets
            // HOWEVER, a teacher can DELETE a user's comments
            return
          }
          // Process different live comment updates
          if (commentUpdate.action === 'DELETE') {
            if (comment.reply_to) {
              this.removeCommentFromReplies(comment)
            } else if (comment.questionId) {
              this.removeAnswerFromAnswers(comment)
            }
          } else if (commentUpdate.action === 'UPDATE') {
            if (comment.reply_to) {
              this.addCommentToReplies(comment)
            } else if (comment.questionId) {
              this.addAnswerToAnswers(comment)
            }
          } else if (commentUpdate.action === 'CREATE') {
            if (comment.reply_to) {
              this.addCommentToReplies(comment)
            } else if (comment.questionId) {
              this.addAnswerToAnswers(comment)
            }
          }
        },
        error => {
          console.warn(error)
        },
      ),
      /**
       * Our socket handler for group-specific socket update events
       * groupUpdate.type is the identifier for specific events
       */
      this._socket.groupUpdate.subscribe(groupUpdate => {
        switch (groupUpdate.type) {
          case 'groupUsers':
            this.addJoinedUser(groupUpdate)
            break
          case 'coteacherPromote':
            this.addProjectOwner(groupUpdate.user)
            break
          case 'updateUserStatus':
            this.setUserStatus(groupUpdate.user._id, groupUpdate.status)
            break
        }
      }),
      /**
       * We have to update the user status through the commentStats
       * commentStats is initialized here, so we observe the state changes from other components and services here
       */
      this._academy.userStatus.subscribe(userStatus => {
        let project = this.currentProjectSource.getValue()
        if (this.user._id === project.teacher_id) {
          this.commentStatsSource.getValue().setUserStatus(this.user, userStatus.status)
        } else {
          // emit the socket back to the teacher
          this._socket.groupUpdateEvent({
            type: 'updateUserStatus',
            status: userStatus.status,
            user: this.user,
          })
        }
      }),
      /**
       * Clear held values when told by _auth
       */
      this._auth.clearAll.subscribe(clear => {
        if (clear) {
          this.projectStoreDispatch(ProjectAction.ClearSuccess, <any>{ title: '' })
        }
      }),
    )
  }

  /**
   * Re-intializes observables that are referenced in multiple compontnes
   * This is done because creating new groups and switching to them without refreshing leaves 'stagnant' data from the previous project the user was on
   */
  private initializeProjectObservables() {
    // Reset the answers observable
    this.answersByIdSubject.next({})

    // Reset the replies observable
    this.repliesByIdSubject.next({})
  }

  /**
   * Use for Project Modifications
   * - Broadcasts changes to "Selector" and "Permutation" observables
   * @param action Change being made
   * @param project Updated project value
   */
  private projectStoreDispatch(action: ProjectAction, project?: Project): void {
    // Handle different action types
    switch (action) {
      case ProjectAction.ClearSuccess:
        this.joinedUsersSource.next([])
        this.currentProjectSource.next(project)
      case ProjectAction.UpdateUsersSuccess:
        // Concat and update
        let users = project.students || []
        users = users.concat(project.temps)
        // Include teacher
        users.push(project.teacher)
        // joinedUsers and currentProject are separates states
        this.joinedUsersSource.next(users)
      case ProjectAction.BuildCommentStats:
        if (project && project._id && this._commentStats) {
          this._commentStats.processComments(project)
        } else {
          this._commentStats = new CommentStats()
        }
        this.commentStatsSource.next(this._commentStats)
        break
      case ProjectAction.UpdateSuccess:
      default:
        this.currentProjectSource.next(project)
    }
  }

  /**
   * Adds a user to a project code and updates currentProject observable
   * @param projectCode Short project code
   * @returns observable with project data
   */
  public setCurrentProject(projectCode: string): Observable<any> {
    return this._project.getProject(projectCode).pipe(
      map((data: any) => {
        let project = data.project //can later have local setter to do validation/data manipulation before passing through observable
        let teacher = project.teacher
        // Decorate teacher, if needed
        if (!teacher.initials && teacher.fullname) {
          let names = teacher.fullname.split(' ')
          teacher.initials = names[0][0] + (names[1] ? names[1][0] : '')
        }
        // Decorate project if archived
        project = decorateArchivedProject(project)
        // Decorate with isTeaching
        project = this.updateCurrentProjectPermissions(project, this.user)
        // Attach convenience owners array (used for display)
        if (project.co_owner_ids && project.co_owner_ids.indexOf(teacher._id) > -1) {
          project.owners = []
        } else {
          project.owners = [project.teacher]
        }
        // Populate projectOwners with co-teachers if available
        if (project.co_owners) {
          project.owners = project.owners.concat(project.co_owners)
        }
        // Clear stats object
        this.projectStoreDispatch(ProjectAction.BuildCommentStats)
        /**
         * Set up our comments array
         * - Hide other user's comments without contents
         * - Reverse
         */
        project.comments = project.comments.filter(comment => {
          // If the comment has data/url (meaning they've filled out the comment) or its the current users comment
          return !this.isCommentHiddenDraft(comment)
        })
        project.comments.reverse()
        // Now that our project comments are ready, set it to the shared source!
        this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
        // Get and attach user information to the students_ids and temp_ids if we have at least 1 of either
        this.updateJoinedUsers(project)
        // Return the project along the current Observable
        return project
      }),
    )
  }

  /**
   * Update a project's fields
   * @param updateObj Object which contains all of the parameters to update
   * @param projectId Project id's string
   */
  public update(updateObj: any, projectId: string): Observable<any> {
    return this._project.put(updateObj, projectId).pipe(
      map(data => {
        let project = this.currentProjectSource.getValue()
        let updatedProperties = data
        for (let key of Object.keys(updatedProperties)) {
          project[key] = updatedProperties[key]
        }
        this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
        return project
      }),
    )
  }

  /**
   * Decorate current project with appropriate permissions
   * @fires this.currentProjectSource
   * @param user Current user
   */
  public updateCurrentProjectPermissions(project: Project, user: User, emit?: boolean): Project {
    if (!user || !user._id || !project._id) {
      // Do nothing if no valid user
      return project
    }
    // Check co-owners array
    let isTeacher: boolean = this.user._id === project.teacher_id
    let isCoOwner: boolean = project.co_owner_ids && project.co_owner_ids.indexOf(this.user._id) > -1
    project.isTeaching = isTeacher || isCoOwner
    // Update observable
    if (emit) {
      this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
    }
    return project
  }

  /**
   * Attempt to load/join project via code
   */
  public join(projectCode) {
    return this._project.validateProjectCode(projectCode)
  }

  /**
   * API call to add a user (of any type) to the project
   *  the call can add only the current user to the project
   * @param projectId The id of the project to which the current user should be added
   * @returns Observable which will not contain any data
   */
  public addUserToProject(projectId: string): Observable<any> {
    let project = this.currentProjectSource.value
    if (!project.temp_ids) {
      project.temp_ids = []
    }
    if (!project.student_ids) {
      project.student_ids = []
    }

    this.projectStoreDispatch(ProjectAction.BuildCommentStats, this.currentProjectSource.getValue())

    if (projectId === project._id && this._commentStats.findStudent(this.user._id)) {
      return of({ status: 'success' }) // mock response
    } else {
      return this._project.addUserToProject(projectId).pipe(
        map(data => {
          // Success! Handle update to store
          // our socket event takes a bit of user information to setup the event
          let publicUser = this._auth.getPublicUser()
          // fire the socket event so the teacher knows we just got another student
          this._socket.groupUpdateEvent({
            type: 'groupUsers',
            user: publicUser,
          })
        }),
      )
    }
  }

  /**
   * Update project owners (designed for adding co-teacher)
   * @calls currentProjectSource
   */
  public addProjectOwner(newOwner: PublicUser): void {
    let project = this.currentProjectSource.getValue()
    // Ensure co_owner_ids array exists
    if (!project.co_owner_ids) {
      project.co_owner_ids = []
    }
    // Push user into co-owner array
    if (project.co_owner_ids.indexOf(newOwner._id) === -1) {
      project.co_owner_ids.push(newOwner._id)
      project.co_owners.push(newOwner)
      project.owners.push(newOwner)
      this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
    }
  }

  /**
   * Add a user to the co-owner ids array
   */
  public makeCoOwner(student: User, project?: Project) {
    if (!project) {
      project = this.currentProjectSource.value
    }
    let coOwnerArray: string[] = project.co_owner_ids || []
    if (!coOwnerArray.includes(student._id)) {
      coOwnerArray.push(student._id)
    }
    // Assume update will succeed, since owner_ids array will be updated and can't be checked
    this.addProjectOwner(student)
    // Track in analytics
    this.angulartics.eventTrack.next({
      action: 'coTeaching_promote',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    return this._project.put({ co_owner_ids: coOwnerArray }, project._id).pipe(
      map(data => {
        // Push update to notify user
        this._socket.groupUpdateEvent({
          type: 'coteacherPromote',
          user: student,
        })
        // Display confirmation toast
        this._messages.sendToast({
          id: 'coteacherPromoted',
          type: 'promoted',
          message: '<b>' + student.fullname + '</b> has been promoted to co-teacher',
        })
      }),
    )
  }

  /**
   * Clear active comment filter, if there is one
   */
  public clearFilters(): void {
    this.activeFilter = null
    this.filterUpdatesSource.next(this.activeFilter)
  }

  /**
   * The one-time loop through all of the comments in a reading to take care of data processing
   *  the object it returns is weird, but it encapsulates all of the logic into one loop
   *  it runs all of the data processing funcitons individually
   *  so if you need to alter logic for one of the arrays/objects, you know where to go!
   * @param project The project that was just updated
   */
  public processComments(
    project: Project,
  ): {
    commentsByIndex: EdjiComment[][]
    highlightArrays: { alwaysHighlightArray: number[][]; highlightArray: number[][] }
  } {
    this.initializeProjectObservables()
    // these empty arrays will be passed into their modifier functions throughout this function
    let commentsByIndex: EdjiComment[][] = []
    let alwaysHighlightArray: number[][] = []
    let highlightArray: number[][] = []
    this.projectStoreDispatch(ProjectAction.BuildCommentStats, project)
    let user = this._auth.getUser()

    project.comments.forEach(comment => {
      // decorate the comment and push it into the array
      this.addCommentToArray(comment, project, user, commentsByIndex)

      // create and return the highlight array
      this.prepareHighlightArrays(comment, user._id, project, alwaysHighlightArray, highlightArray)
    })

    let ans = project.answers && project.answers.length
    for (let i = 0; i < ans; i++) {
      let answer = project.answers[i]

      // push the answer to the array
      this.addAnswerToAnswers(answer)
    }

    return {
      commentsByIndex: commentsByIndex,
      highlightArrays: { alwaysHighlightArray: alwaysHighlightArray, highlightArray: highlightArray },
    }
  }

  /**
   * Save a comment on a project.
   * - Give this thing an EdjiComment object, and it will handle it from there
   *   It will save it as the right comment type, whether a normal comment, a reply, or question answer.
   *   It just needs to have the appropriate type assigned and the proper data.
   * @param commentObj proto comment to save
   */
  public saveComment(commentObj: EdjiComment): Promise<any> {
    let project: Project = this.currentProjectSource.getValue()
    let comment = Object.assign({}, commentObj)
    let isUpdate: boolean

    if (!comment.user_id) {
      comment.user_id = this._auth.getUser()._id
    }
    if (!comment.author) {
      comment.author = this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username
    }
    // Identify whether NEW comment or UPDATE to comment
    if (comment._id) {
      isUpdate = true
      // Identify newly created commetns with content
      // Rounds dates to the nearest 1/10 of a second, since created/updated differ by milliseconds
      if (
        comment.createdAt &&
        comment.updatedAt &&
        comment.createdAt.toString().substr(0, 21) === comment.updatedAt.toString().substr(0, 21)
      ) {
        this.store.dispatch(new IncrementMetric('comments_created'))
      }
    } else {
      // need to set a comment context to discern between comments and replies for pipo event
      let commentContext = 'comment'
      if (comment.reply_to && comment.reply_to !== '') {
        commentContext = 'reply'
      }
      // add the comment creation event to pipo
      this._academy.pipoEvent({
        // standard event info:
        event_name: 'comment_action',
        user_id: this.user._id,
        teacher: project.isTeaching,
        hero: this.user.hero_status || false,
        institution_id: this.user.institution_ids || [],
        // event-specific info:
        reading_id: project.reading_id._id,
        group_id: project._id,
        action_type: commentContext,
        comment_type: comment.type,
        reading_owner: project.owner_id,
      })
      // fire an analytic event here for tracking purposes
      let contextTarget = ''
      if (commentContext === 'comment') {
        if (comment.loc && typeof comment.loc.x == 'number' && !comment.text && !comment.box) {
          contextTarget = 'OnImageSpot'
        } else if (comment.box) {
          contextTarget = 'OnImageWord'
        } else {
          contextTarget = 'OnText'
        }
      }
      this.angulartics.eventTrack.next({
        action: commentContext + '_' + comment.type + contextTarget + '_create',
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    return this._project
      .putComment(project._id, comment)
      .pipe(
        map((savedComment: EdjiComment) => {
          this._socket.updateComment(savedComment, isUpdate ? 'UPDATE' : 'CREATE', project._id)
          if (!isUpdate) {
            this.buildCommentsByPos()
          }
          return savedComment
        }),
      )
      .toPromise()
  }

  /**
   * Removes comment from its project
   * @todo buildCommentsByPos should be triggered by Action
   */
  public removeComment(comment: EdjiComment): Promise<any> {
    let project = this.currentProjectSource.getValue()
    // need to set a comment context to discern between comments and replies for analytic event
    let commentContext = 'comment'
    if (comment.reply_to && comment.reply_to !== '') {
      commentContext = 'reply'
    }
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: commentContext + '_' + comment.type + '_delete',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    return this._project
      .deleteComment(project._id, comment)
      .pipe(
        map(data => {
          // remove the comment
          const commentIndex = project.comments.findIndex(c => c._id === comment._id)
          if (commentIndex > -1) {
            project.comments.splice(commentIndex, 1)
          }
          // Tell other Project views that the comment is gone
          this._socket.updateComment(comment, 'DELETE', project._id)
          // Update stats
          this.projectStoreDispatch(ProjectAction.BuildCommentStats, project)

          this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
          this.buildCommentsByPos()
          return data
        }),
      )
      .toPromise()
  }

  /**
   * Decorates the comment before adding it to the array
   *  modifies the array which is passed in
   *  trying to make processComments a little more readable
   * @param comment the comment you want added to the array
   * @param projectId the id of the project that gets added to the comment
   * @param arr the array to which the comment will be added
   */
  private addCommentToArray(comment: EdjiComment, project: Project, user: User, arr: EdjiComment[][]): EdjiComment[][] {
    comment.project_id = project._id
    // Is this a teacher comment?
    if (
      comment.user_id === project.teacher_id ||
      (project.co_owner_ids && project.co_owner_ids.indexOf(comment.user_id) > -1)
    ) {
      // preset authorIsTeacher for existing data
      comment.authorIsTeacher = true
    }

    this.addCommentToReplies(comment)

    // add the comment at the index of the comment's starting word
    if (!arr[comment.start]) {
      arr[comment.start] = []
    }
    arr[comment.start].push(comment)
    return arr
  }

  public addCommentToReplies(comment: EdjiComment): void {
    let repliesById = this.repliesByIdSubject.getValue()
    let skipAdd = false
    if (comment.reply_to) {
      if (!repliesById[comment.reply_to]) {
        repliesById[comment.reply_to] = []
      }
      // Double check comment doesn't exist
      repliesById[comment.reply_to].forEach((reply, index) => {
        if (reply && reply._id === comment._id) {
          // Update with new copy
          repliesById[comment.reply_to][index] = comment
          skipAdd = true
        }
      })
      if (!skipAdd) {
        repliesById[comment.reply_to].push(comment)
      }
      this.repliesByIdSubject.next(repliesById)
    }
  }

  public removeCommentFromReplies(comment: EdjiComment): void {
    let repliesById = this.repliesByIdSubject.getValue()
    if (comment.reply_to && repliesById[comment.reply_to]) {
      for (let i = 0; i < repliesById[comment.reply_to].length; i++) {
        if (repliesById[comment.reply_to][i]._id === comment._id) {
          repliesById[comment.reply_to].splice(i, 1)
          this.repliesByIdSubject.next(repliesById)
        }
      }
    }
  }

  /**
   * Adds the answer to the array by question ID
   * If the user answers a question, add the answer to the array of that question by it's question ID
   * This groups all answers together by the question ID for the project
   * @param answer the answer you want added to the array
   */
  public addAnswerToAnswers(answer: EdjiComment): void {
    let answersById = this.answersByIdSubject.getValue()
    let project = this.currentProjectSource.getValue()
    let skipAdd = false
    if (answer.questionId) {
      if (!answersById[answer.questionId]) {
        answersById[answer.questionId] = []
      }
      // Double check comment doesn't exist
      for (let i = 0; i < answersById[answer.questionId].length; i++) {
        let answerExist = answersById[answer.questionId][i]
        if (answerExist._id === answer._id) {
          if (this.user._id !== answer.user_id) {
            // Don't update users own answers from socket
            // - Case: Pointer the emoji keyboard relies on breaks if you do so
            answersById[answer.questionId][i] = answer
          }
          skipAdd = true
        }
      }
      if (!skipAdd) {
        answersById[answer.questionId].push(answer)
        // Update observable
        this.answersByIdSubject.next(answersById)
      }
    }
    // Update Project Array
    if (!project.answers.find(existing => existing._id === answer._id)) {
      project.answers.push(answer)
      this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
    }
  }

  public removeAnswerFromAnswers(answer: EdjiComment): void {
    let answersById = this.answersByIdSubject.getValue()
    let project = this.currentProjectSource.getValue()
    if (answer.questionId) {
      for (let i = 0; i < answersById[answer.questionId].length; i++) {
        if (answersById[answer.questionId][i]._id === answer._id) {
          answersById[answer.questionId].splice(i, 1)
          this.answersByIdSubject.next(answersById)
        }
      }
    }
    // Update Project Array
    let i = project.answers.findIndex(a => a._id === answer._id)
    if (i >= 0) {
      project.answers.splice(i, 1)
      this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
    }
  }

  /**
   * Save an answer on a project.
   * - Give this thing an EdjiComment object, and it will handle it from there
   *   It will save it as the right answer type, whether a normal answer, a reply, or question answer.
   *   It just needs to have the appropriate type assigned and the proper data.
   * @param answerObj Answer of EdjiComment datatype
   */
  public saveAnswer(answerObj: EdjiComment): Promise<any> {
    let project: Project = this.currentProjectSource.getValue()
    let answer = Object.assign({}, answerObj)
    answer.project_id = project._id // Tell the answer what project it's a part of
    delete answer.active
    // Get the url of this project that we're saving to.
    if (!answer.user_id) {
      answer.user_id = this._auth.getUser()._id
    }
    if (!answer.author) {
      answer.author = this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username
    }

    let options = this._auth.getOptions()
    // Add comment ID if passed
    // Tell other Project viewers comment changed, using Socket
    if (answer._id) {
      this._socket.updateComment(answer, 'UPDATE', project._id)
    } else {
      this._socket.updateComment(answer, 'CREATE', project._id)

      // add the comment creation event to pipo
      this._academy.pipoEvent({
        // standard event info:
        event_name: 'comment_action',
        user_id: this.user._id,
        teacher: project.isTeaching,
        hero: this.user.hero_status || false,
        institution_id: this.user.institution_ids || [],
        // event-specific info:
        reading_id: project.reading_id._id,
        group_id: project._id,
        action_type: 'answer',
        comment_type: answer.type,
        reading_owner: project.owner_id,
      })
      // fire an analytic event here for tracking purposes
      this.angulartics.eventTrack.next({
        action: 'answer_' + answer.type + '_create',
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    return this._project.putAnswer(project._id, answer)
  }

  /**
   * Deletes answer via service, then updates local Project object
   * - Project page should subscribe to the currentProject Observable to receive these updates
   */
  public removeAnswer(answer: EdjiComment): Promise<any> {
    let project = this.currentProjectSource.getValue()
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'answer_' + answer.type + '_delete',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    return this._project
      .deleteAnswer(project, answer)
      .pipe(
        map(data => {
          // Tell other Project views that the comment is gone
          this._socket.updateComment(answer, 'DELETE', project._id)
          this.removeAnswerFromAnswers(answer)
          return data
        }),
      )
      .toPromise()
  }

  /**
   * Feedback is put into the report_evals array, so we put to an /evals endpoint
   * @param feedback feedback from teacher to student
   */
  public saveFeedback(feedback: Partial<EdjiComment>): Promise<EdjiComment> {
    const project = this.currentProjectSource.getValue()

    this.angulartics.eventTrack.next({
      action: 'readingRecap_feedbackGiven',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    return this._project
      .putEval(project._id, feedback)
      .pipe(
        take(1),
        map(data => {
          this._socket.groupUpdateEvent({
            type: 'feedbackUpdate',
            feedback: data,
          })
          const feedbackArray = project.report_evals || []
          feedbackArray.push(data)
          this.currentProjectSource.next(project)
          return data
        }),
      )
      .toPromise()
  }

  public getFeedbackByStudent(id: string): Array<EdjiComment> {
    const project = this.currentProjectSource.getValue()
    if (!project.report_evals) return []
    return project.report_evals.filter(evaluation => evaluation.recipient_id === id)
  }

  /**
   * Prepares two arrays, one containing numbers of all of the words that are highlighted
   *  and one containing a student's and teacher's highlights
   * @param comment the comment to base the highlights off of
   * @param userId current user's id
   * @param project the project that the highlights are being prepared for
   * @param alwaysHighlightArray the heat_vision = true highlight array, which will be modified through the function
   * @param highlightArray the heat_vision = false highlight array, which will also be modified through the function
   * @returns the two arrays, which now are modified
   */
  private prepareHighlightArrays(
    comment: EdjiComment,
    userId: string,
    project: Project,
    alwaysHighlightArray: number[][],
    highlightArray: number[][],
  ): {
    alwaysHighlightArray: number[][]
    highlightArray: number[][]
  } {
    // conditional determines which array we'll sort to - students only see highlightArray w/o heat vision on
    let alwaysHighlight = userId === comment.user_id || project.teacher_id == comment.user_id

    if (alwaysHighlight) {
      // loop through all of the indexes (corresponding to words) and increment their highlights
      alwaysHighlightArray = this.incrementHighlightIndices(comment, alwaysHighlightArray)
    } else {
      highlightArray = this.incrementHighlightIndices(comment, highlightArray)
    }

    return { alwaysHighlightArray: alwaysHighlightArray, highlightArray: highlightArray }
  }

  /**
   * Increment highlight values in array
   * @param comment Comment relevant comment highlights should be accounted for
   * @param highlightArray number[] array of values to increment
   */
  private incrementHighlightIndices(comment: EdjiComment, highlightArray: number[][]): number[][] {
    // loop through all of the indexes (corresponding to words) and increment their highlights
    for (var i = comment.start; i <= comment.end; i++) {
      if (this.isCommentVisible(comment, null, true)) {
        let bstart = comment.box ? comment.box.start : 0
        let bend = comment.box ? comment.box.end : 0

        for (let bi = bstart; bi <= bend; bi++) {
          if (highlightArray[i]) {
            if (!highlightArray[i][bi]) highlightArray[i][bi] = 0
            highlightArray[i][bi]++
          } else {
            if (!highlightArray[i]) highlightArray[i] = []
            highlightArray[i][bi] = 1
          }
        }
      }
    }
    return highlightArray
  }

  public isCommentVisible(comment: EdjiComment, inProgressFilter?: CommentFilter, initiateComments?: boolean): boolean {
    let filter = this.activeFilter || inProgressFilter
    if (filter) {
      // If a comment filter is active, only show filtered comments
      let fitsFilter = true
      let filterKeys = Object.keys(filter.propertyFilters)
      for (let key of filterKeys) {
        if (filter.propertyFilters[key] !== comment[key]) {
          fitsFilter = false
          break
        }
      }
      return fitsFilter
    } else {
      // If user is current reading Owner/Teacher or Heat Vision is on, show all comments
      let heatVisible = true
      let project = this.currentProjectSource.getValue()
      if (!initiateComments) {
        heatVisible = project.heat_vision || project.isTeaching
      }
      // Your own comments and the Owner/Teacher's comments are ALWAYS visible
      let alwaysVisible = comment.user_id == this.user._id || comment.authorIsTeacher
      return heatVisible || alwaysVisible
    }
  }

  public isCommentHiddenDraft(comment: any): boolean {
    return (
      (!comment.data || comment.data == '') && (!comment.url || comment.url == '') && comment.user_id != this.user._id
    )
  }

  /**
   * Filter comments to show one user
   * - Pass an empty string to clear the filter
   * @param userId The id for the Student you want to view the comments of
   */
  public filterByUser(userId: string): void {
    let props: CommentPropertyFilters = {}
    // Clear current filter, without notifying components
    this.activeFilter = null
    // For User id filters, we want an exact match
    props.user_id = userId
    // Get user object
    let user = (this.joinedUsersSource.getValue() || []).find(user => {
      return user._id === userId
    })
    // Construct full filter and notify components
    this.generateCommentFilter(props, 'Highlights', user.fullname ? user.fullname : user.username)
  }

  /**
   * Get highlights for all filtered comments
   * @fires filterUpdates Observable
   */
  private generateCommentFilter(propertyFilters: CommentPropertyFilters, displayType: string, displayName: string) {
    let commentFilter = <CommentFilter>{}
    let project = this.currentProjectSource.getValue()
    commentFilter.propertyFilters = propertyFilters
    commentFilter.displayType = displayType
    commentFilter.displayName = displayName
    // Get copy of comments
    let comments = project.comments.slice()
    let filterHighlightArray = []
    comments.forEach(comment => {
      // Filter out comments
      if (this.isCommentVisible(comment, commentFilter)) {
        // Generate Highlight Array
        filterHighlightArray = this.incrementHighlightIndices(comment, filterHighlightArray)
      }
    })
    commentFilter.filterHighlightArray = filterHighlightArray
    // Announce the completed filter to components!
    this.activeFilter = commentFilter
    this.filterUpdatesSource.next(this.activeFilter)
  }

  /**
   * Pulls in fullname and username for students and temp users for leaderboard and
   * @param project current project the user is on
   */
  private updateJoinedUsers(project: Project) {
    let studentIds = project.students_ids || []
    let tempIds = project.temp_ids || []
    if (studentIds.length > 0 || tempIds.length > 0) {
      this._auth.getPublicUsers(studentIds, tempIds).subscribe(
        userInfo => {
          let currentProject = this.currentProjectSource.getValue()
          // Ensure PublicUsers have initials
          userInfo[0] &&
            userInfo.forEach(user => {
              if (user && !user.initials && user.fullname) {
                user.initials = generateInitialsFromName(user.fullname)
              }
            })
          // Build students array
          currentProject.students = userInfo.filter(user => {
            return user._id && currentProject.students_ids.includes(user._id)
          })
          // Build temps array
          currentProject.temps = userInfo.filter(user => {
            return user._id && currentProject.temp_ids.includes(user._id)
          })
          this.projectStoreDispatch(ProjectAction.BuildCommentStats, currentProject)
          this.projectStoreDispatch(ProjectAction.UpdateUsersSuccess, currentProject)
        },
        error => {
          console.error(error)
        },
      )
    } else {
      // Initialize UpdateUsers
      let currentProject = this.currentProjectSource.getValue()
      currentProject.students = []
      currentProject.temps = []
      this.projectStoreDispatch(ProjectAction.UpdateUsersSuccess, currentProject)
    }
  }

  /**
   * Adds user information to the student that just joined the project so we can see them on the leaderboard
   * @param groupUpdate the object that contains user properties to properly add student to leaderboard
   */
  private addJoinedUser(groupUpdate: any) {
    if (!groupUpdate.user || !groupUpdate.user._id) {
      console.error('[Project Store] Attempted adding undefined user')
    }
    let project = this.currentProjectSource.getValue()
    // Make sure student and temp arrays exist
    if (!project.students) project.students = []
    if (!project.temps) project.temps = []
    // if the student that joined is a temp, here is their info
    if (groupUpdate.user.type && groupUpdate.user.type === 'temp') {
      project.temps.push(groupUpdate.user)
    } else {
      project.students.push(groupUpdate.user)
    }
    // update the project info across the app for the teacher based on this update
    this.projectStoreDispatch(ProjectAction.UpdateUsersSuccess, project)
    this.projectStoreDispatch(ProjectAction.BuildCommentStats, project)
  }

  /**
   * Create a new Project
   * @param Requires a Reading ID
   * @param takes a Project object with the new label
   */
  public create(readingId: string, project: any) {
    project.reading_id = readingId
    if (project.code) {
      project.code = project.code.toLowerCase()
    }

    return this._project
      .post(project)
      .pipe(take(1))
      .pipe(
        map(data => {
          project = data
          this.projectStoreDispatch(ProjectAction.UpdateSuccess, project)
          return project
        }),
      )
  }

  /**
   * Allows us to make an update to the comment stats to update the answer values
   * @param answer current answer we are adjusting
   * @param answerChange toggling the answer value
   */
  public recalculateAnswers(answer: any, answerChange: boolean): void {
    let project = this.currentProjectSource.getValue()
    this.projectStoreDispatch(ProjectAction.BuildCommentStats, project)
  }

  /**
   * Generates the "commentByPos" array, and pushes out to Subscribers
   * - Uses lineY values on the comments as the "position" value
   */
  public buildCommentsByPos(): void {
    let project = this.currentProjectSource.getValue()
    // Re-initialize the comment by position array
    this.commentByPosSource = []
    // Copy then reverse the array
    let commentsArray = project.comments ? project.comments.slice().reverse() : []
    // Loop through each comment to group comments together by line number
    let len2 = commentsArray.length
    for (let i = 0; i < len2; i++) {
      let comment = commentsArray[i]

      // If the comment has data/url (meaning they've filled out the comment)
      let dataInComment =
        (comment.data && comment.data != '') || (comment.url && comment.url != '') || comment.user_id == this.user._id
      // If user is current reading Owner/Teacher or Heat Vision is on, show all comments
      let heatVisible = project.heat_vision || project.isTeaching
      // Your own comments and the Owner/Teacher's comments are ALWAYS visible
      let alwaysVisible = comment.user_id == this.user._id || comment.user_id == project.teacher_id

      if (comment && !comment.reply_to && !comment.questionId && comment.lineY && this.isCommentVisible(comment)) {
        // lineY is determined by each individual CommentComponent
        let lineY = comment.lineY
        // Push the comment into commentByPos based on the lineY number
        if (typeof this.commentByPosSource[lineY] == 'undefined') {
          this.commentByPosSource[lineY] = [comment]
        } else {
          this.commentByPosSource[lineY].push(comment)
        }
      }
    }
    this.commentByPosSubject.next(this.commentByPosSource)
  }

  public buildCommentStats() {
    const project = this.currentProjectSource.getValue()
    if (project.comments) {
      this.projectStoreDispatch(ProjectAction.BuildCommentStats, project)
    }
  }

  public setUserStatus(userId: string, state: UserReadingStatus) {
    this._commentStats.setUserStatus(userId, state)
  }
}

export const enum ProjectAction {
  ClearSuccess = '[Project] Clear Success',
  UpdateSuccess = '[Project] Update Success',
  UpdateUsersSuccess = '[Project] Update Users Success',
  BuildCommentStats = '[Project] Build Comment Stats',
}
