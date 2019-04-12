import { Injectable } from "@angular/core"
import { Effect, Actions, ofType } from '@ngrx/effects'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { ProjectActionsUnion, ProjectActions, RetrieveProject } from './project.reducers'
import { AuthService } from './../_services/auth.service'
import { map, switchMap, mergeMap } from "rxjs/operators"
import { Project } from "../shared/datatypes"

@Injectable()
export class ProjectEffects {
  constructor(private actions$: Actions, private _auth: AuthService, private _http: HttpClient) {

  }

  @Effect()
  loadProject$ = this.actions$.pipe(
    ofType(ProjectActions.Retrieve),
    switchMap(({ payload }: RetrieveProject) => {
      console.log('got project code in effect', payload)
      return this._http
        .get(
          this._auth.getUrl() + '/api/v1/projects/' + encodeURIComponent(payload) + '?pop[]=reading_id&pop[]=teacher',
          this._auth.getOptions(),
        )
    }),
    mergeMap(({ project }: iGetProjectResponse) => {
      console.log('PROJECT FROM OBSERVABLE', project)
      return [{
        type: ProjectActions.SetProject,
        payload: project
      }]
    })
  )
}

interface iGetProjectResponse {
  project: Project
}