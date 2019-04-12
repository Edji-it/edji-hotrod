import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment'
import { projectReducer } from './project.reducers'

export interface State {

}

export const reducers: ActionReducerMap<State> = {
  projects: projectReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
