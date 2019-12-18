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

  constructor(
    private _auth: AuthService,
    private _http: HttpClient,
    private _route: ActivatedRoute,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private _academy: AcademyService,
  ) {} // constructor

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

    return this._http.get<GetProjectsResponse>(this._auth.getUrl() + '/api/v1/projects', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this._auth.getToken(),
      }),
      params: feedParams,
    })
  }

  /**
   * Adds a user to a project code and updates currentProject observable
   * @param projectCode Short project code
   * @returns observable with project data
   */
  public getProject(projectCode: string): Observable<any> {
    return this._http.get(
      this._auth.getUrl() +
        '/api/v1/projects/' +
        encodeURIComponent(projectCode) +
        '?pop[]=reading_id&pop[]=teacher&pop[]=co_owners',
      this._auth.getOptions(),
    )
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
    if (!projectCode) {
      return of(new Error('Please provide a valid code'))
    }

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
  public post(project: any) {
    return this._http.post(this._auth.getUrl() + '/api/v1/projects/', project, this._auth.getOptions())
  }

  /**
   * Put updates to a project
   * @param updateObj Object which contains all of the parameters to update
   * @param projectId Project id's string
   */
  public put(updateObj: any, projectId: string): Observable<any> {
    return this._http.put(this._auth.getUrl() + '/api/v1/projects/' + projectId, updateObj, this._auth.getOptions())
  }

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
   * Puts a comment to its project
   * @param comment
   */
  public putComment(projectId: string, comment: EdjiComment): Observable<any> {
    comment.project_id = projectId // Tell the comment what project it's a part of

    return this._http.put(
      this._auth.getUrl() + '/api/v1/projects/' + projectId + '/comments',
      comment,
      this._auth.getOptions(),
    )
  }

  /**
   * Deletes comment from its project
   */
  public deleteComment(projectId: string, comment: EdjiComment): Observable<any> {
    let search_params: string = '?comment_id=' + comment._id
    // Attach replies ids to query string
    search_params = this._auth.arrayParamsToString('reply_ids[]', comment.replies, search_params)

    return this._http.delete(
      this._auth.getUrl() + '/api/v1/projects/' + projectId + '/comments' + search_params,
      this._auth.getOptions(),
    )
  }

  /**
   * Puts a teacher's feedback to its project
   * @param feedback
   */
  public putEval(projectId: string, feedback: Partial<EdjiComment>): Observable<any> {
    return this._http.put(
      this._auth.getUrl() + '/api/v1/projects/' + projectId + '/report_evals',
      feedback,
      this._auth.getOptions(),
    )
  }

  /**
   * Put an answer to a project.
   * @param answerObj Answer of EdjiComment datatype
   */
  public putAnswer(projectId, answer: EdjiComment): Promise<any> {
    return this._http
      .put(this._auth.getUrl() + '/api/v1/projects/' + projectId + '/answers', answer, this._auth.getOptions())
      .toPromise()
  }

  /**
   * Deletes answer via service, then updates local Project object
   * - Project page should subscribe to the currentProject Observable to receive these updates
   */
  public deleteAnswer(project: Project, answer: EdjiComment): Observable<any> {
    let projectId = project._id
    let search_params: string = '?comment_id=' + answer._id

    return this._http.delete(
      this._auth.getUrl() + '/api/v1/projects/' + projectId + '/answers' + search_params,
      this._auth.getOptions(),
    )
  }

  /**
   * API call to add a user (of any type) to the project
   *  the call can add only the current user to the project
   * @param projectId The id of the project to which the current user should be added
   * @returns Observable which will not contain any data
   */
  public addUserToProject(projectId: string): Observable<any> {
    return this._http.put(
      this._auth.getUrl() + '/api/v1/projects/' + projectId + '/students',
      {},
      this._auth.getOptions(),
    )
  }
} // _project

/**
 * /api/v1/projects Response
 */
export interface GetProjectsResponse {
  projects: Project[]
  total: number
}

export interface ProjectFilters {
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
  user_id?: string
}

interface validateProjectCodeResponse {
  found: boolean
  _id?: string
}
