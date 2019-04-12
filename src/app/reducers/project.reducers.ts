import { Action } from '@ngrx/store'
import { Project } from '../shared/datatypes'

export interface ProjectState {

}

const initialState: ProjectState = {

}

export enum ProjectActions {
  Retrieve = '[Project Page] Retrieve Project',
  SetProject = '[Project Page] Set Project'
}

export class RetrieveProject implements Action {
  readonly type = ProjectActions.Retrieve
  constructor(public payload: string) { }
}

export class SetProject implements Action {
  readonly type = ProjectActions.SetProject
  constructor(public payload: Project) { }
}

export type ProjectActionsUnion = SetProject

export function projectReducer(state = initialState, action: ProjectActionsUnion) {
  switch (action.type) {
    case ProjectActions.SetProject:
      console.log('SETTING PROJECT!', action.payload)
      return {
        ...action.payload
      }
    default:
      return state
  }
}