import { SELENIUM_PORT } from 'webdriver-manager/built/lib/cmds';
import { ActivatedRoute, Params } from '@angular/router'
import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Angulartics2 } from 'angulartics2'

import { AuthService } from './auth.service'
import { SocketService } from './socket.service'
import { CommentStats, iCommentStats, EdjiComment, Project, User } from './datatypes';
import { ReadingService } from "./reading.service";

@Injectable()
export class ProjectService {
    private targetProjectId: string = ''

    /** project will be given out as observable */
    private project: any = { title: "initial value" }
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
     *  Mobile handling of comments
     *      - Line Number Counter Array
     *      - Comment Counter by Line Array
     */
    public lineNumberArray: any[] = []
    public commentByPosSource: any[][] = []
    private commentByPosSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.commentByPosSource)
    public commentByPos: Observable<any> = this.commentByPosSubject.asObservable()

    // Broadcast closing the comment pane
    public commentPaneStateSubj: Subject<boolean> = new Subject<boolean>()
    public commentPaneState: Observable<boolean> = this.commentPaneStateSubj.asObservable()

    constructor(
        private http: Http, 
        private _auth: AuthService, 
        private _route: ActivatedRoute,
        private _socket: SocketService,
        private _readings: ReadingService,
         private angulartics: Angulartics2
    ) {
        // needs to be constructed here or else it returns undefined
        this._commentStats = new CommentStats()
        this._socket.commentUpdates.subscribe((update) => {
            // console.log(update)
        })

        this.subscriptions.push(
            this._socket.commentUpdates.subscribe((commentUpdate) => {
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
            }, (error) => {
                console.warn(error)
            })
        )
    } // constructor
    
    /**
     * Pulls all projects for a single user
     * @returns chainable promise resolved with reading data
     */
    public getAll() {
            return this.http
                .get(this._auth.getUrl() + '/projects', this._auth.getOptions())
                .toPromise()
                .then(this._auth.extractData);
    } // public getAll()

    /**
     * Adds a user to a project code and updates currentProject observable
     * @param projectCode Short project code
     * @returns observable with project data
     */
    public setCurrentProject(projectCode: string): Observable<any> {
        return this.http.get(this._auth.getUrl() + '/projects/' + encodeURIComponent(projectCode) + '?pop=reading_id', this._auth.getOptions())
            .map(
                (data) => {
                    this.project = data.json().project; //can later have local setter to do validation/data manipulation before passing through observable
                    this.currentProjectSource.next(this.project);
                    // Clear stats object
                    this._commentStats.resetStats()
                    this.project.comments.reverse()
                    return this.project;
                });
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
    public processComments(project: Project): {
        commentsByIndex: EdjiComment[][], highlightArrays: { alwaysHighlightArray: number[], highlightArray: number[] }
    } {
        // these empty arrays will be passed into their modifier functions throughout this function
        let commentsByIndex: EdjiComment[][] = []
        let alwaysHighlightArray: number[] = []
        let highlightArray: number[] = []
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
            highlightArrays: { alwaysHighlightArray: alwaysHighlightArray, highlightArray: highlightArray }
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

        // get the user help decorate the comment
        if (comment.user_id === user._id || comment.user_id === this.project.teacher_id) {
            comment.showAvatar = true;
        }

        this.addCommentToReplies(comment)

        // add the comment at the index of the comment's starting word
        if (!arr[comment.start]) { arr[comment.start] = [] }
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
                if (comment.active) {
                    this.repliesByIdSource[comment.reply_to].unshift(comment)
                } else {
                    this.repliesByIdSource[comment.reply_to].push(comment)
                }
                this.repliesByIdSubject.next(this.repliesByIdSource)
            }
        }
    } // public addCommentToReplies(comment: EdjiComment): void 

    public removeCommentFromReplies(comment: EdjiComment) : void {
        if (comment.reply_to) {
            for (let i = 0; i < this.repliesByIdSource[comment.reply_to].length; i++){
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
            for (let answerExist of this.answersByIdSource[answer.questionId]) {
                if (answerExist._id == answer._id) {
                    skipAdd = true
                }
            }
            if (!skipAdd) {
                this.answersByIdSource[answer.questionId].push(answer)
                this.answersByIdSubject.next(this.answersByIdSource)
            }
        }
    } // public addAnswerToAnswers(answer: EdjiComment): void

    public removeAnswerFromAnswers(answer: EdjiComment) : void {
        if (answer.questionId) {
            for (let i = 0; i < this.answersByIdSource[answer.questionId].length; i++){
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
    private prepareHighlightArrays(comment: EdjiComment, userId: string, project: Project, alwaysHighlightArray: number[], highlightArray: number[] ): {
        alwaysHighlightArray: number[], highlightArray: number[]
    } {
        // conditional determines which array we'll sort to - students only see highlightArray w/o heat vision on
        let alwaysHighlight = userId === comment.user_id || project.teacher_id == comment.user_id

        if (alwaysHighlight) {
            // loop through all of the indexes (corresponding to words) and increment their highlights
            for (var i = comment.start; i <= comment.end; i ++) {
                // if true, means there's already a highlight
                if (alwaysHighlightArray[i]) {
                    alwaysHighlightArray[i]++;
                } else {
                    alwaysHighlightArray[i] = 1;
                }
            }
        } else {
            for (var i = comment.start; i <= comment.end; i ++) {
                if (highlightArray[i]) {
                    highlightArray[i]++;
                } else {
                    highlightArray[i] = 1;
                }
            }
        }

        return { alwaysHighlightArray: alwaysHighlightArray, highlightArray: highlightArray }
    }

    /**
     * Gets all of a teacher's projects for a reading
     */
    public getForReading(readingId: string): Observable<any> {
        let userId = this._auth.getUser()._id;
        
        // return this.http.get(this._auth.getUrl() + '/readings/' + readingId + '/projects/' + userId , this._auth.getOptions() );
        return this.http.get(this._auth.getUrl() + "/projects/reading/" + readingId, this._auth.getOptions())
            .map((data) => { return data.json() || {}; });
    }

    /**
     * Validates whether or not a project code exists
     * @param projectCode Short project code
     * @returns Observable which will have error if response is invalid
     */
    public validateProject(projectCode: string): Observable<any> {
        projectCode = encodeURIComponent(projectCode.toLowerCase())

        return this.http.get(this._auth.getUrl() + '/projects/' + projectCode + "/validate", this._auth.getOptions())
            .map((data) => { return data.json() || {}; });
            
    } // public validateProject(projectCode: string): Observable<any>

    /** 
    * Pull a Project object
    * @param projectId
    */
    public get(projectId: string) : Observable<any> {
            return this.http
                .get(this._auth.getUrl() + '/projects/' + projectId, this._auth.getOptions())
                .map(
                    data => {
                        // Update local Project object if returned
                        if (data.json().project && data.json().project._id) {
                            this.project = data.json().project;
                            this.currentProjectSource.next(this.project);
                        }
                        return data.json().project;
                    });
    } // public get(projectId: string)

    /**
     * Create a new Project
     * @param Requires a Reading ID
     * @param takes a Project object with the new label
     */
    public create(readingId: string, project: any) {
        project.reading_id = readingId;
        if (project.code) { project.code = project.code.toLowerCase() }
        

        return this.http
            .post(this._auth.getUrl() + '/projects/', { 'project' : project }, this._auth.getOptions())
            .map((data) => {
                if (data && data.json()) {
                    this.project = data.json().project;
                    this.currentProjectSource.next(this.project);
                    return this.project;
                }
            })
    }
    
    /**
     * Update a project's fields
     * @param updateObj Object which contains all of the parameters to update
     * @param projectId Project id's string
     */
    public update(updateObj: any, projectId: string): Observable<any> {
        return this.http
            .put([this._auth.getUrl(), 'projects', projectId].join("/"), { project: updateObj }, this._auth.getOptions())
            .map((data) => {
                if (data && data.json()) {
                    this.project = data.json().project;
                    this.currentProjectSource.next(this.project);
                    return this.project;
                } // if
            }) //.map
    } // public update (updateObj: any, projectId: string): Observable<any> 

    /** . 
     * Delete a Project
     * @param Requires a Project ID
     */
    public delete(targetProject : Project) : Observable<any> {
        return this.http.delete(this._auth.getUrl() + '/projects/' +  targetProject._id, this._auth.getOptions())
            .map( data => {
                this._readings.removeProject(targetProject)
            })
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
    public saveComment(commentObj: EdjiComment) : Promise<any> {
        let projectId : string = this.project._id;
        let comment = Object.assign({}, commentObj)

        comment.project_id = projectId; // Tell the comment what project it's a part of
        
        // Clean frontend only properties
        delete comment['active']
        delete comment['new']
        delete comment['showAvatar']
        
        // Get the url of this project that we're saving to.
        let url = this._auth.getUrl() + '/projects/' + projectId + '/comments';
        if (!comment.user_id) {
            comment.user_id = this._auth.getUser()._id
        }
        if (!comment.author) {
            comment.author = this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username
        }

        let options = this._auth.getOptions()
        let data = { comment: comment }
        // Add comment ID if passed
        // Tell other Project viewers comment changed, using Socket
        if (comment._id) {
            data.comment['_id'] = comment._id;
            url = url + '/' + comment._id
            options['method'] = 'PUT'
            this._socket.updateComment(data.comment, 'UPDATE', this.project._id);
        } else {
            options['method'] = 'POST'
            this._socket.updateComment(data.comment, 'CREATE', this.project._id);
        }

        options['body'] = data

        return this.http
            .request(url, options)
            .toPromise()
            .then(this._auth.extractData)
            .then((data) => { return data.comment; })
    } // public saveComment

    /**
     * Deletes comment via service, then updates local Project object 
     * - Project page should subscribe to the currentProject Observable to receive these updates
     */
    public deleteComment(comment : EdjiComment): Promise<any> {
        let projectId = this.project._id;
        let url = this._auth.getUrl() + '/projects/' + projectId + '/comments/' + comment._id;
        
        return this.http
            .delete(url, this._auth.getOptions())
            .map(data => {
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

                this.getCommentsByLine()
                console.log(url)
                return data
            })
            .toPromise()
            .then(this._auth.extractData);
    }//  public deleteComment(comment): Promise<any>

    /** 
     * Save an answer on a project.
     * - Give this thing an EdjiComment object, and it will handle it from there
     *   It will save it as the right answer type, whether a normal answer, a reply, or question answer.
     *   It just needs to have the appropriate type assigned and the proper data.
     * @param answerObj Answer of EdjiComment datatype
     */
    public saveAnswer(answerObj: EdjiComment) : Promise<any> {
        let projectId : string = this.project._id;
        let answer = Object.assign({}, answerObj)

        answer.project_id = projectId; // Tell the answer what project it's a part of
        
        // Clean frontend only properties
        delete answer['active']
        delete answer['new']
        delete answer['showAvatar']
        
        // Get the url of this project that we're saving to.
        let url = this._auth.getUrl() + '/projects/' + projectId + '/answers';
        if (!answer.user_id) {
            answer.user_id = this._auth.getUser()._id
        }
        if (!answer.author) {
            answer.author = this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username
        }

        let options = this._auth.getOptions()
        let data = { answer: answer }
        // Add comment ID if passed
        // Tell other Project viewers comment changed, using Socket
        if (answer._id) {
            data.answer['_id'] = answer._id;
            url = url + '/' + answer._id
            options['method'] = 'PUT'
            this._socket.updateComment(data.answer, 'UPDATE', this.project._id)
        } else {
            options['method'] = 'POST'
            this._socket.updateComment(data.answer, 'CREATE', this.project._id)
        }

        options['body'] = data
        return this.http
            .request(url, options)
            .toPromise()
            .then(this._auth.extractData)
            .then((data) => { return data.answer; })
    } // public saveAnswer

    /**
     * Deletes answer via service, then updates local Project object 
     * - Project page should subscribe to the currentProject Observable to receive these updates
     */
    public deleteAnswer(answer : EdjiComment): Promise<any> {
        let projectId = this.project._id;
        let url = this._auth.getUrl() + '/projects/' + projectId + '/answers/' + answer._id;

        return this.http
            .delete(url, this._auth.getOptions())
            .map(data => {
                // Tell other Project views that the comment is gone
                 this._socket.updateComment(answer, 'DELETE', this.project._id);

                this.removeAnswerFromAnswers(answer)
                return data;
            })
            .toPromise()
            .then(this._auth.extractData);
    }//  public deleteAnswer(answer): Promise<any>

    /**
     * API call to add a user (of any type) to the project
     *  the call can add only the current user to the project
     * @param projectId The id of the project to which the current user should be added
     * @returns Observable which will not contain any data
     */
    public addUserToProject(projectId: string): Observable<any> {
        return this.http.put(
            [this._auth.getUrl(), 'projects', projectId, 'user_id'].join('/'),
            {},
            this._auth.getOptions()
        ) //this.http.put
    } // public addUserToProject(projectId: string): Observable<any>

    public getCommentsByLine(): void {
        let commentsArray = this.project.comments

        // Re-initialize the comment by position array
        this.commentByPosSource = []

        // Loop through the line number array and initialize a new array for each word number
        let len1 = this.lineNumberArray.length
        for (let i = 0; i < len1; i++) {
            // this.commentByPosSource.push(new Array())
            this.commentByPosSource.push([[0],[0]])
        }
        
        // Loop through each comment to group comments together by line number
        let len2 = commentsArray.length
        for (let i = 0; i < len2; i++) {
            if (commentsArray[i] && !commentsArray[i].reply_to && !commentsArray[i].questionId) {
                let comment = commentsArray[i]
                let lineNbr = this.lineNumberArray[comment.start][0]
                // console.log(lineNbr, comment.start)
                if (this.commentByPosSource[lineNbr][0]!=0) {
                    this.commentByPosSource[lineNbr][0].push(comment)
                } else {
                    console.log('z7')
                    this.commentByPosSource[lineNbr][0] = comment
                }
            }
        }
        
        // Flip the comment array
        let len3 = this.commentByPosSource.length
        for (let i = 0; i < len3; i++) {
            if (this.commentByPosSource[i][1].length>0) {
                this.commentByPosSource[i][1].reverse()
            }
        }

        this.commentByPosSubject.next(this.commentByPosSource)
    }
} // class

