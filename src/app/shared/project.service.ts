import { SELENIUM_PORT } from 'webdriver-manager/built/lib/cmds';
import { ActivatedRoute, Params } from '@angular/router'
import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { Observable, BehaviorSubject, Subject } from 'rxjs/Rx'
import 'rxjs/add/operator/toPromise'

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

    private commentsByIndexSubject: BehaviorSubject<EdjiComment[][]> = new BehaviorSubject<EdjiComment[][]>([])
    public commentsByIndex: Observable<EdjiComment[][]> = this.commentsByIndexSubject.asObservable()

    constructor(
        private http: Http, 
        private _auth: AuthService, 
        private _route: ActivatedRoute,
        private _socket: SocketService,
        private _readings: ReadingService
    ) {
        // needs to be constructed here or else it returns undefined
        this._commentStats = new CommentStats()
        this._socket.commentUpdates.subscribe((update) => {
            console.log(update)
        })
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
        return this.http.get(this._auth.getUrl() + '/projects/' + projectCode, this._auth.getOptions())
            .map(
                (data) => {
                    this.project = data.json().project; //can later have local setter to do validation/data manipulation before passing through observable
                    this.currentProjectSource.next(this.project);
                    // Clear stats object
                    this._commentStats.resetStats()
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

        return {
            commentsByIndex: commentsByIndex,
            highlightArrays: { alwaysHighlightArray: alwaysHighlightArray, highlightArray: highlightArray }
        }
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

        // get the user help decorate the comment
        if (comment.user_id === user._id || comment.user_id === this.project.teacher_id) {
            comment.showAvatar = true;
        }

        // add the comment at the index of the comment's starting word
        if (!arr[comment.start]) { arr[comment.start] = [] }
        arr[comment.start].push(comment)
        return arr
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
     * Update or Create a comment on a project
     * @param projectId Id of project comment is on
     * @param commentText Contents of the comment
     * @param start Index of first word
     * @param end Index of last word
     * @param text (optional) Selection of text comment was made on. Left as optional, but SHOULD be passed.
     * @param commentId (optional) If passed, will update comment with that ID
     */
    public saveComment(projectId: string, commentText: string, start: number, end: number, type: string, text ?: string, commentId ?: string, location ?: any) : Promise<any> {
        let url = this._auth.getUrl() + '/projects/' + projectId + '/comments';
        let data = {
            'comment' : {
                'data' : commentText,
                'start' : start,
                'end' : end,
                'user_id' : this._auth.getUser()._id,
                'author' : this._auth.getUser().fullname ? this._auth.getUser().fullname : this._auth.getUser().username,
                'type' : type
            } // 'comment'
        } // let data

        if (text) {
            data.comment['text'] = text;
        } // if (text)

        if (location && location.x && location.y) {
            data.comment['loc'] = location;
        } // if

        // Add comment ID if passed
        if (commentId) {
            data.comment['_id'] = commentId;
        } // if (commentId)

        // Tell other Project viewers comment changed, using Socket
        // TO-DO: Move to after service responds
        if (data.comment['_id']) {
            this._socket.updateComment(data.comment, 'UPDATE', this.project._id);
        } else {
            this._socket.updateComment(data.comment, 'CREATE', this.project._id);
        } // else

        return this.http
            .post(url, data, this._auth.getOptions())
            .toPromise()
            .then(this._auth.extractData)
            .then((data) => { return data.comment; })
    } // public saveComment

    /**
     * Deletes comment via service, then updates local Project object 
     * - Project page should subscribe to the currentProject Observable to receive these updates
     */
    public deleteComment(comment): Promise<any> {
        let projectId = this.project._id;
        let url = this._auth.getUrl() + '/projects/' + projectId + '/comments/' + comment._id;

        return this.http
            .delete(url, this._auth.getOptions())
            .map(data => {
                // Tell other Project views that the comment is gone
                 this._socket.updateComment(comment, 'DELETE', this.project._id);

                for (var i = 0; i <= this.project.comments.length; i++) {
                    if (this.project.comments[i] && this.project.comments[i]._id === comment._id) {
                        // Remove comment from local object
                        this.project.comments.splice(i);
                    }
                }
                return data;
            })
            .toPromise()
            .then(this._auth.extractData);
    }//  public deleteComment(comment): Promise<any>

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
} // class