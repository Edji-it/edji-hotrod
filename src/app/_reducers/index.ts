import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment'
import { metricsReducer, MetricsState } from './metrics.reducers'

export interface AppState {
  metrics: MetricsState
}

export const reducers: ActionReducerMap<AppState> = {
  metrics: metricsReducer,
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : []
