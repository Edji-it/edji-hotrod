import { Action, createSelector, createFeatureSelector } from '@ngrx/store'

export interface MetricsState extends NumericMetrics {
  metricsLoaded: boolean
}

interface NumericMetrics {
  hero_page_load_count: number
  readings_created: number
  comments_created: number
}

const initialState: MetricsState = {
  metricsLoaded: false,
  hero_page_load_count: 0,
  readings_created: 0,
  comments_created: 0
}

export enum MetricsActions {
  IncrementMetric = '[Metrics] IncrementMetric',
  IncrementMetricSuccess = '[Metrics] IncrementMetricSuccess',
  SetState = '[Metrics] SetState',
}


// Metrics selectors
export const getMetricsState = createFeatureSelector<MetricsState>('metrics'); 
export const getMetricsComments = createSelector(getMetricsState,(state: MetricsState) => state.comments_created)

// handled by an effect
export class IncrementMetric implements Action {
  readonly type = MetricsActions.IncrementMetric
  constructor(public payload: string) {}
}

export class IncrementMetricSuccess implements Action {
  readonly type = MetricsActions.IncrementMetricSuccess
  constructor(public metric: string, public payload: number) {}
}

export class SetState implements Action {
  readonly type = MetricsActions.SetState
  constructor(public payload: MetricsState) {}
}

export type MetricsActionsUnion = IncrementMetric | SetState

export function metricsReducer(state: MetricsState = initialState, action: MetricsActionsUnion) {
  switch (action.type) {
    case MetricsActions.SetState:
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}
