import {
  ActionReducerMap,
  MetaReducer,
  createSelector,
  createFeatureSelector
} from '@ngrx/store';
import { environment } from '../../environments/environment'
import { metricsReducer, MetricsState } from './metrics.reducers'
import { PublicUsersState, userDetailsReducer } from './user-details.reducers';
import { PublicUser } from '../shared/datatypes';

export interface AppState {
  metrics: MetricsState,
  userDetails: PublicUsersState
}

export const reducers: ActionReducerMap<AppState> = {
  metrics: metricsReducer,
  userDetails: userDetailsReducer
}


export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

export const selectProjectUsersFeature = createFeatureSelector<AppState, PublicUsersState>('userDetails');

// export const selectAllProjectUsers = (state: PublicUsersState) => state.entities

export const selectProjectUser = createSelector(
  selectProjectUsersFeature,
  (state: PublicUsersState, props) => {
    let user = state.entities.find(user => { return props.id === user._id })
    return user
  }
)