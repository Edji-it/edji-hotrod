import { Injectable } from '@angular/core'
import { HttpParams } from '@angular/common/http'

// Internal
import { ProjectService, GetProjectsResponse, ProjectFilters } from '../_services'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { decorateArchivedProject } from './project.decorators'

@Injectable()
export class ProjectListStore {
  constructor(private _project: ProjectService) {}

  /**
   * Pulls projects user has joined, paginated
   * @param filters object containing pagination values (to eventually include other filters)
   */
  public listJoined(filters?: ProjectFilters): Observable<GetProjectsResponse> {
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

    return this._project.getJoined(filters).pipe(
      map(data => {
        let projects = data.projects.slice()
        // Loop through projects and mark archived for display
        for (let i = 0; i < projects.length; i++) {
          projects[i] = decorateArchivedProject(projects[i])
        }
        //  Update return value
        data.projects = projects
        return data
      }),
    )
  }
}
