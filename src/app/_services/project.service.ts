import { ActivatedRoute, Params } from '@angular/router'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

// Project Dependencies
import { AuthService } from './auth.service'
import { SocketService } from './socket.service'
import { CommentStats, EdjiComment, Project, User, PublicUser } from '../shared/datatypes'
import { ReadingService } from './reading.service'
import { AcademyService } from './academy.service'

@Injectable()
export class ProjectService {
  private targetProjectId: string = ''

  // For verifying comment ownership on heat vision
  private user: any
  private userInfo: any

  /** project will be given out as observable */
  private project: any = { title: 'initial value' }
  private currentProjectSource: BehaviorSubject<any> = new BehaviorSubject<any>(this.project)
  public currentProject: Observable<any> = this.currentProjectSource.asObservable()
  // Maintain local Project data and its updates in this service

  /**
   * VERY IMPORTANT: please don't construct more than one of these (please)
   *  components don't know how to handle it if the reference to the commentStats object changes
   * This stores all of the comment stats for a project and all of the logic to manipulate the stats
   */
  _commentStats: CommentStats
  subscriptions: Subscription[] = []

  /**
   * Updated Reference Object
   * Reference comments by word index
   */
  private commentsByIndexSubject: BehaviorSubject<EdjiComment[][]> = new BehaviorSubject<EdjiComment[][]>([])
  public commentsByIndex: Observable<EdjiComment[][]> = this.commentsByIndexSubject.asObservable()

  /**
   *  Updated Reference Object
   * Reference comment replies by comment id
   */
  private repliesByIdSource: any = {}
  private repliesByIdSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.repliesByIdSource)
  public repliesById: Observable<any> = this.repliesByIdSubject.asObservable()

  /**
   *  Updated Reference Object
   * Reference answers by question id
   */
  private answersByIdSource: any = {}
  private answersByIdSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.answersByIdSource)
  public answersById: Observable<any> = this.answersByIdSubject.asObservable()

  /**
   *  Comments by Position
   *  - position = lineY of a comment
   *  - Comments are indexed by their "lineY" value
   */
  public commentByPosSource: any[][] = []
  private commentByPosSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.commentByPosSource)
  public commentByPos: Observable<any> = this.commentByPosSubject.asObservable()

  // Broadcast closing the comment pane
  public commentPaneStateSubj: Subject<boolean> = new Subject<boolean>()
  public commentPaneState: Observable<boolean> = this.commentPaneStateSubj.asObservable()

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
    private _http: HttpClient,
    private _auth: AuthService,
    private _route: ActivatedRoute,
    private _socket: SocketService,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private _academy: AcademyService,
  ) {
    // needs to be constructed here or else it returns undefined
    this._commentStats = new CommentStats()
    this._socket.commentUpdates.subscribe(update => {
      // console.log(update)
    })

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
          // Process different live comment updates
          if (commentUpdate.action === 'DELETE') {
            if (comment.reply_to) {
              this.removeCommentFromReplies(comment)
            } else if (comment.questionId) {
              this.removeAnswerFromAnswers(comment)
            }
          } else if (commentUpdate.action === 'UPDATE') {
            // Socket updates don't come through with a timestamp
            comment.createdAt = Date.now()
            if (comment.reply_to) {
              this.addCommentToReplies(comment)
            } else if (comment.questionId) {
              this.addAnswerToAnswers(comment)
            }
          } else if (commentUpdate.action === 'CREATE') {
            // Socket updates don't come through with a timestamp
            comment.createdAt = Date.now()
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
        if (groupUpdate.type === 'refreshLeaderboard' && this.project.isTeaching) {
          this.addUserInfoToProject(groupUpdate)
        } else if (groupUpdate.type === 'coteacherPromote') {
          this.addProjectOwner(groupUpdate.user)
        } else if (groupUpdate.type === 'updateUserStatus' && this.user._id === this.project.teacher_id) {
          this.commentStats.userStatus(groupUpdate.user, groupUpdate.status)
        }
      }),
      /**
       * We have to update the user status through the commentStats
       * commentStats is initialized here, so we observe the state changes from other components and services here
       */
      this._academy.userStatus.subscribe(userStatus => {
        if (this.user._id === this.project.teacher_id) {
          this.commentStats.userStatus(this.user, userStatus.status)
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
          this.project = { title: '' }
          this.currentProjectSource.next(this.project)
        }
      }),
    )
  } // constructor

  /**
   * Update project owners (designed for adding co-teacher)
   * @calls currentProjectSource
   */
  public addProjectOwner(newOwner: PublicUser): void {
    // Ensure co_owner_ids array exists
    if (!this.project.co_owner_ids) {
      this.project.co_owner_ids = []
    }
    // Push user into co-owner array
    if (this.project.co_owner_ids.indexOf(newOwner._id) === -1) {
      this.project.co_owner_ids.push(newOwner._id)
      this.project.co_owners.push(newOwner)
      this.project.owners.push(newOwner)
      this.currentProjectSource.next(this.project)
    }
  }

  /**
   * Pulls projects user has joined, paginated
   * @param filters object containing pagination values (to eventually include other filters)
   */
  public getJoined(filters?: ProjectFilters): Observable<GetProjectsResponse> {
    let feedParams = new HttpParams()
    // Set Pagination values
    if (filters) {
      if (filters.size) {
        feedParams = feedParams.append('size', filters.size.toString())
      }
      if (filters.start) {
        feedParams = feedParams.append('start', filters.start.toString())
      }
    }
    // Populate Reading to show user Title
    feedParams = feedParams.append('pop', 'reading')
    // Populate Teacher to show Reading Creator
    feedParams = feedParams.append('pop', 'teacher')

    return this._http
      .get<GetProjectsResponse>(this._auth.getUrl() + '/api/v1/projects', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
        params: feedParams,
      })
      .pipe(
        map(data => {
          let projects = data.projects.slice()
          // Loop through projects and mark archived for display
          for (let i = 0; i < projects.length; i++) {
            projects[i] = this.decorateArchivedProject(projects[i])
          }
          //  Update return value
          data.projects = projects
          return data
        }),
      )
  }

  /**
   * Re-intializes observables that are referenced in multiple compontnes
   * This is done because creating new groups and switching to them without refreshing leaves 'stagnant' data from the previous project the user was on
   */
  private initializeProjectObservables() {
    // Reset the answers observable
    this.answersByIdSource = {}
    this.answersByIdSubject.next(this.answersByIdSource)

    // Reset the replies observable
    this.repliesByIdSource = {}
    this.repliesByIdSubject.next(this.repliesByIdSource)
  }

  /**
   * Adds a user to a project code and updates currentProject observable
   * @param projectCode Short project code
   * @returns observable with project data
   */
  public setCurrentProject(projectCode: string): Observable<any> {
    return this._http
      .get(
        this._auth.getUrl() +
          '/api/v1/projects/' +
          encodeURIComponent(projectCode) +
          '?pop[]=reading_id&pop[]=teacher&pop[]=co_owners',
        this._auth.getOptions(),
      )
      .pipe(
        map((data: any) => {
          let project = data.project //can later have local setter to do validation/data manipulation before passing through observable
          let teacher = project.teacher
          // Decorate project if archived
          project = this.decorateArchivedProject(project)
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
          this._commentStats.resetStats()
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
          this.project = project
          this.currentProjectSource.next(this.project)
          // Get and attach user information to the students_ids and temp_ids if we have at least 1 of either
          if ((project.students_ids.length > 0 || project.temp_ids.length > 0) && this.project.isTeaching) {
            this.getUserInfoFromProject(project)
          }
          // Return the project along the current Observable
          return this.project
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
      // Check teacher id
      this.currentProjectSource.next(project)
    }
    return project
  }

  /**
   * Determine if project is archived, and adds flag
   * @param project to determine if archive
   * @return project with updated flag
   */
  public decorateArchivedProject(project: Project): Project {
    let teacher = project.teacher
    // Identify and set archived
    if (teacher && !teacher.hero_status && teacher.archive_readings_before) {
      /**
       * Readings are "archived" if all are true:
       * - Updated date is prior to archived before date
       * - Readings before Hero v2 (2019-01-01) are "legacy" and not archived
       * - Teacher is NOT Hero
       */
      let archivedBefore = new Date(teacher.archive_readings_before)
      let projectDate = new Date(project.createdAt)
      if (projectDate < archivedBefore && projectDate > new Date('2019-01-01')) {
        project.archived = true
      }
    }
    return project
  }

  /**
   * Pulls in fullname and username for students and temp users for leaderboard and
   * @param project current project the user is on
   */
  public getUserInfoFromProject(project: Project) {
    this._auth.getUserInfoByProject(project.students_ids, project.temp_ids).subscribe(
      userInfo => {
        userInfo = userInfo.users
        // attach the basic user information to each students_id
        this.project.students = this.project.students_ids.map(obj => {
          return userInfo.find(el => {
            return el._id === obj
          })
        })
        // attach the basic user information to each temp_id
        this.project.temps = this.project.temp_ids.map(obj => {
          return userInfo.find(el => {
            return el._id === obj
          })
        })
        this.currentProjectSource.next(this.project)
        this._commentStats.addUsersToStats(this.commentStats._stats, this.project)
      },
      error => {
        console.error(error)
      },
    )
  }

  /**
   * Adds user information to the student that just joined the project so we can see them on the leaderboard
   * @param groupUpdate the object that contains user properties to properly add student to leaderboard
   */
  private addUserInfoToProject(groupUpdate: any) {
    // Make sure student and temp arrays exist
    if (!this.project.students) this.project.students = []
    if (!this.project.temps) this.project.temps = []
    // if the student that joined is registered, here is their info
    if (groupUpdate.userType && groupUpdate.userType === 'registered') {
      this.project.students.push({
        _id: groupUpdate._id,
        fullname: groupUpdate.fullname,
        username: groupUpdate.username,
        userType: groupUpdate.userType,
      })
    }
    // if the student that joined is a temp, here is their info
    if (groupUpdate.userType && groupUpdate.userType === 'temp') {
      this.project.temps.push({
        _id: groupUpdate._id,
        fullname: groupUpdate.fullname,
        userType: groupUpdate.userType,
      })
    }
    // update the project info across the app for the teacher based on this update
    this.currentProjectSource.next(this.project)
    this._commentStats.addUsersToStats(this.commentStats._stats, this.project)
  }

  /**
   * Provide a getter for the private commentStats object
   */
  get commentStats(): CommentStats {
    return this._commentStats
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
    this._commentStats.initStats(project)
    let user = this._auth.getUser()

    // using a cached-length for loop for speediness
    // doing my best to only loop through this once for efficiency
    // abstracted the logic related to the different items so that it's more readable
    // you can look in any one of those funcitons if you want to change what is returning
    let len = project.comments.length
    for (let i = 0; i < len; i++) {
      let comment = project.comments[i]

      // decorate the comment and push it into the array
      this.addCommentToArray(comment, project, user, commentsByIndex)

      // create and return the highlight array
      this.prepareHighlightArrays(comment, user._id, project, alwaysHighlightArray, highlightArray)

      // add the comment to the stats object
      this._commentStats.addCommentToStats(comment, 1)
    }

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
  } //  public processComments(project: Project):

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
      comment.user_id === this.project.teacher_id ||
      (this.project.co_owner_ids && this.project.co_owner_ids.indexOf(comment.user_id) > -1)
    ) {
      // preset authorIsTeacher for existing data
      comment.authorIsTeacher = true
    }
    // get the user help decorate the comment
    if (comment.user_id === user._id || comment.authorIsTeacher) {
      comment.showAvatar = true
    }
    // if (comment.loc && comment.loc.y && comment.text==="") {
    //     comment.imagePos = Math.round(comment.loc.y/8)*8
    // }

    // this.decorateComment(comment)

    this.addCommentToReplies(comment)

    // add the comment at the index of the comment's starting word
    if (!arr[comment.start]) {
      arr[comment.start] = []
    }
    arr[comment.start].push(comment)
    return arr
  } // private addCommentToArray(comment: EdjiComment, project: Project, user: User, arr: EdjiComment[][]): EdjiComment[][]

  public addCommentToReplies(comment: EdjiComment): void {
    let skipAdd = false
    if (comment.reply_to) {
      if (!this.repliesByIdSource[comment.reply_to]) {
        this.repliesByIdSource[comment.reply_to] = []
      }
      // Double check comment doesn't exist
      for (let reply of this.repliesByIdSource[comment.reply_to]) {
        if (reply._id == comment._id) {
          skipAdd = true
        }
      }
      if (!skipAdd) {
        this.repliesByIdSource[comment.reply_to].push(comment)
        this.repliesByIdSubject.next(this.repliesByIdSource)
      }
    }
  } // public addCommentToReplies(comment: EdjiComment): void

  public removeCommentFromReplies(comment: EdjiComment): void {
    if (comment.reply_to && this.repliesByIdSource[comment.reply_to]) {
      for (let i = 0; i < this.repliesByIdSource[comment.reply_to].length; i++) {
        if (this.repliesByIdSource[comment.reply_to][i]._id === comment._id) {
          this.repliesByIdSource[comment.reply_to].splice(i, 1)
          this.repliesByIdSubject.next(this.repliesByIdSource)
        }
      }
    }
  } // public removeCommentFromReplies(comment: EdjiComment) : void

  /**
   * Adds the answer to the array by question ID
   * If the user answers a question, add the answer to the array of that question by it's question ID
   * This groups all answers together by the question ID for the project
   * @param answer the answer you want added to the array
   */
  public addAnswerToAnswers(answer: EdjiComment): void {
    let skipAdd = false
    if (answer.questionId) {
      if (!this.answersByIdSource[answer.questionId]) {
        this.answersByIdSource[answer.questionId] = []
      }
      // Double check comment doesn't exist
      for (let i = 0; i < this.answersByIdSource[answer.questionId].length; i++) {
        let answerExist = this.answersByIdSource[answer.questionId][i]
        if (answerExist._id === answer._id) {
          if (this.user._id !== answer.user_id) {
            // Don't update users own answers from socket
            // - Case: Pointer the emoji keyboard relies on breaks if you do so
            this.answersByIdSource[answer.questionId][i] = answer
          }
          skipAdd = true
        }
      }
      if (!skipAdd) {
        this.answersByIdSource[answer.questionId].push(answer)
      }
      // Update observable
      this.answersByIdSubject.next(this.answersByIdSource)
    }
  } // public addAnswerToAnswers(answer: EdjiComment): void

  public removeAnswerFromAnswers(answer: EdjiComment): void {
    if (answer.questionId) {
      for (let i = 0; i < this.answersByIdSource[answer.questionId].length; i++) {
        if (this.answersByIdSource[answer.questionId][i]._id === answer._id) {
          this.answersByIdSource[answer.questionId].splice(i, 1)
          this.answersByIdSubject.next(this.answersByIdSource)
        }
      } // for
    }
  } //  public removeAnswerFromAnswers(answer: EdjiComment) : void

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

  /**
   * Gets all of a teacher's projects for a reading
   */
  public getForReading(readingId: string): Observable<any> {
    return this._http.get(this._auth.getUrl() + '/projects/reading/' + readingId, this._auth.getOptions())
  }

  /**
   * Validates whether or not a project code exists
   * @param projectCode Short project code
   * @returns Observable which will have error if response is invalid
   */
  public validateProjectCode(projectCode: string): Observable<any> {
    projectCode = encodeURIComponent(projectCode.toLowerCase())

    return this._http.get<validateProjectCodeResponse>(
      this._auth.getUrl() + '/api/v1/projects/' + projectCode + '/validate',
      this._auth.getOptions(),
    )
  } // public validateProjectCode(projectCode: string): Observable<any>

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

    return this._http
      .post(this._auth.getUrl() + '/api/v1/projects/', project, this._auth.getOptions())
      .pipe(take(1))
      .pipe(
        map(data => {
          this.project = data
          this.currentProjectSource.next(this.project)
          return this.project
        }),
      )
  }

  /**
   * Update a project's fields
   * @param updateObj Object which contains all of the parameters to update
   * @param projectId Project id's string
   */
  public update(updateObj: any, projectId: string): Observable<any> {
    return this._http
      .put(this._auth.getUrl() + '/api/v1/projects/' + projectId, updateObj, this._auth.getOptions())
      .pipe(
        map(data => {
          let updatedProperties = data
          for (let key of Object.keys(updatedProperties)) {
            this.project[key] = updatedProperties[key]
          }
          this.currentProjectSource.next(this.project)
          return this.project
        }),
      )
  } // public update (updateObj: any, projectId: string): Observable<any>

  /** .
   * Delete a Project
   * @param Requires a Project ID
   */
  public delete(targetProject: Project): Observable<any> {
    return this._http
      .delete(this._auth.getUrl() + '/api/v1/projects/' + targetProject._id, this._auth.getOptions())
      .pipe(
        map(data => {
          this._readings.removeProject(targetProject)
        }),
      )
  } // public delete(projectId)

  /**
   * Save a comment on a project.
   * - Give this thing an EdjiComment object, and it will handle it from there
   *   It will save it as the right comment type, whether a normal comment, a reply, or question answer.
   *   It just needs to have the appropriate type assigned and the proper data.
   * @param projectId Id of project comment is on
   * @param commentText Contents of the comment
   * @param start Index of first word
   * @param end Index of last word
   * @param text (optional) Selection of text comment was made on. Left as optional, but SHOULD be passed.
   * @param commentId (optional) If passed, will update comment with that ID
   */
  public saveComment(commentObj: EdjiComment): Promise<any> {
    let projectId: string = this.project._id
    let comment = Object.assign({}, commentObj)

    comment.project_id = projectId // Tell the comment what project it's a part of

    // Clean frontend only properties
    delete comment['active']
    delete comment['new']
    delete comment['showAvatar']

    if (!comment.user_id) {
      comment.user_id = this._auth.getUser()._id
    }
    if (!comment.author) {
      comment.author = this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username
    }

    let options = this._auth.getOptions()
    // Add comment ID if passed
    // Tell other Project viewers comment changed, using Socket
    if (comment._id) {
      this._socket.updateComment(comment, 'UPDATE', this.project._id)
    } else {
      this._socket.updateComment(comment, 'CREATE', this.project._id)

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
        teacher: this.project.isTeaching,
        hero: this.user.hero_status || false,
        institution_id: this.user.institution_ids || [],
        // event-specific info:
        reading_id: this.project.reading_id._id,
        group_id: this.project._id,
        action_type: commentContext,
        comment_type: comment.type,
        reading_owner: this.project.owner_id,
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
    return this._http
      .put(this._auth.getUrl() + '/api/v1/projects/' + projectId + '/comments', comment, this._auth.getOptions())
      .toPromise()
  }

  /**
   * Deletes comment via service, then updates local Project object
   * - Project page should subscribe to the currentProject Observable to receive these updates
   */
  public deleteComment(comment: EdjiComment): Promise<any> {
    let projectId = this.project._id

    let search_params: string = '?comment_id=' + comment._id
    // Attach replies ids to query string
    search_params = this._auth.arrayParamsToString('reply_ids[]', comment.replies, search_params)

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

    return this._http
      .delete(
        this._auth.getUrl() + '/api/v1/projects/' + projectId + '/comments' + search_params,
        this._auth.getOptions(),
      )
      .pipe(
        map(data => {
          // Tell other Project views that the comment is gone
          this._socket.updateComment(comment, 'DELETE', this.project._id)
          // Update stats
          this.commentStats.addCommentToStats(comment, -1)

          for (var i = 0; i <= this.project.comments.length; i++) {
            if (this.project.comments[i] && this.project.comments[i]._id === comment._id) {
              // Remove comment from local object
              this.project.comments.splice(i, 1)
            }
          }

          this.buildCommentsByPos()
          return data
        }),
      )
      .toPromise()
  } //  public deleteComment(comment): Promise<any>

  /**
   * Save an answer on a project.
   * - Give this thing an EdjiComment object, and it will handle it from there
   *   It will save it as the right answer type, whether a normal answer, a reply, or question answer.
   *   It just needs to have the appropriate type assigned and the proper data.
   * @param answerObj Answer of EdjiComment datatype
   */
  public saveAnswer(answerObj: EdjiComment): Promise<any> {
    let projectId: string = this.project._id
    let answer = Object.assign({}, answerObj)

    answer.project_id = projectId // Tell the answer what project it's a part of

    // Clean frontend only properties
    delete answer['active']
    delete answer['new']
    delete answer['showAvatar']

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
      this._socket.updateComment(answer, 'UPDATE', this.project._id)
    } else {
      this._socket.updateComment(answer, 'CREATE', this.project._id)

      // add the comment creation event to pipo
      this._academy.pipoEvent({
        // standard event info:
        event_name: 'comment_action',
        user_id: this.user._id,
        teacher: this.project.isTeaching,
        hero: this.user.hero_status || false,
        institution_id: this.user.institution_ids || [],
        // event-specific info:
        reading_id: this.project.reading_id._id,
        group_id: this.project._id,
        action_type: 'answer',
        comment_type: answer.type,
        reading_owner: this.project.owner_id,
      })
      // fire an analytic event here for tracking purposes
      this.angulartics.eventTrack.next({
        action: 'answer_' + answer.type + '_create',
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    return this._http
      .put(this._auth.getUrl() + '/api/v1/projects/' + projectId + '/answers', answer, this._auth.getOptions())
      .toPromise()
  }

  /**
   * Deletes answer via service, then updates local Project object
   * - Project page should subscribe to the currentProject Observable to receive these updates
   */
  public deleteAnswer(answer: EdjiComment): Promise<any> {
    let projectId = this.project._id

    let search_params: string = '?comment_id=' + answer._id

    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'answer_' + answer.type + '_delete',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    return this._http
      .delete(
        this._auth.getUrl() + '/api/v1/projects/' + projectId + '/answers' + search_params,
        this._auth.getOptions(),
      )
      .pipe(
        map(data => {
          // Tell other Project views that the comment is gone
          this._socket.updateComment(answer, 'DELETE', this.project._id)
          this.removeAnswerFromAnswers(answer)
          return data
        }),
      )
      .toPromise()
  }

  /**
   * API call to add a user (of any type) to the project
   *  the call can add only the current user to the project
   * @param projectId The id of the project to which the current user should be added
   * @returns Observable which will not contain any data
   */
  public addUserToProject(projectId: string): Observable<any> {
    let project = this.currentProjectSource.value

    // check if student already is in the student_ids or temp_ids arrays
    let alreadyJoined = false
    if (this.user.type && this.user.type === 'temp') {
      alreadyJoined = project && project.temp_ids.includes(this.user._id)
    } else {
      alreadyJoined = project && project.students_ids.includes(this.user._id)
    }

    if (projectId === project._id && alreadyJoined) {
      return of({ status: 'success' }) // mock response
    } else {
      return this._http.put(
        this._auth.getUrl() + '/api/v1/projects/' + projectId + '/students',
        {},
        this._auth.getOptions(),
      )
    }
  }

  /**
   * Allows us to make an update to the comment stats to update the answer values
   * @param answer current answer we are adjusting
   * @param answerChange toggling the answer value
   */
  public recalculateAnswers(answer: any, answerChange: boolean): void {
    this.commentStats.recalculateAnswers(answer, answerChange, this.project)
  }

  /**
   * Generates the "commentByPos" array, and pushes out to Subscribers
   * - Uses lineY values on the comments as the "position" value
   */
  public buildCommentsByPos(): void {
    // Re-initialize the comment by position array
    this.commentByPosSource = []
    // Copy then reverse the array
    let commentsArray = this.project.comments ? this.project.comments.slice().reverse() : []
    // Loop through each comment to group comments together by line number
    let len2 = commentsArray.length
    for (let i = 0; i < len2; i++) {
      let comment = commentsArray[i]

      // If the comment has data/url (meaning they've filled out the comment)
      let dataInComment =
        (comment.data && comment.data != '') || (comment.url && comment.url != '') || comment.user_id == this.user._id
      // If user is current reading Owner/Teacher or Heat Vision is on, show all comments
      let heatVisible = this.project.heat_vision || this.project.isTeaching
      // Your own comments and the Owner/Teacher's comments are ALWAYS visible
      let alwaysVisible = comment.user_id == this.user._id || comment.user_id == this.project.teacher_id

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

  public isCommentVisible(comment: EdjiComment, inProgressFilter?: CommentFilter, initiateComments?: boolean): boolean {
    let filter = this.activeFilter || inProgressFilter
    if (filter) {
      // If a comment filter is active, only show filtered comments
      let fitsFilter = true
      let filterKeys = Object.keys(filter.propertyFilters)
      for (let key of filterKeys) {
        if (filter.propertyFilters[key].test(comment[key]) === false) {
          fitsFilter = false
          break
        }
      }
      return fitsFilter
    } else {
      // If user is current reading Owner/Teacher or Heat Vision is on, show all comments
      let heatVisible = true
      if (!initiateComments) {
        heatVisible = this.project.heat_vision || this.project.isTeaching
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
   * Clear active comment filter, if there is one
   */
  public clearFilters(): void {
    this.activeFilter = null
    this.filterUpdatesSource.next(this.activeFilter)
  }

  /**
   * Filter comments to show one user
   * - Pass an empty string to clear the filter
   * @param userId The id for the Student you want to view the comments of
   */
  public filterByUser(user: User): void {
    let props: CommentPropertyFilters = {}
    // Clear current filter, without notifying components
    this.activeFilter = null
    // For User id filters, we want an exact match
    props.user_id = new RegExp('^' + user._id + '$')
    // Construct full filter and notify components
    this.generateCommentFilter(props, 'Student', user.fullname ? user.fullname : user.username)
  }

  /**
   * Get highlights for all filtered comments
   * @fires filterUpdates Observable
   */
  private generateCommentFilter(propertyFilters: CommentPropertyFilters, displayType: string, displayName: string) {
    let commentFilter = <CommentFilter>{}
    commentFilter.propertyFilters = propertyFilters
    commentFilter.displayType = displayType
    commentFilter.displayName = displayName
    // Get copy of comments
    let comments = this.project.comments.slice()
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
    return this.update({ co_owner_ids: coOwnerArray }, project._id)
  }
} // _project

/**
 * /api/v1/projects Response
 */
interface GetProjectsResponse {
  projects: Project[]
  total: number
}

interface ProjectFilters {
  size?: number
  start?: number
}

export interface CommentFilter {
  propertyFilters: CommentPropertyFilters
  filterHighlightArray?: number[][]
  displayType: string
  displayName: string
}

export interface CommentPropertyFilters {
  type?: RegExp
  user_id?: RegExp
}

interface validateProjectCodeResponse {
  found: boolean
  _id?: string
}
