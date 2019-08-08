import { Action } from '@ngrx/store'

export interface MetricsState extends NumericMetrics {
  metricsLoaded: boolean
}

interface NumericMetrics {
  hero_page_load_count: number
}

const initialState: MetricsState = {
  metricsLoaded: false,
  hero_page_load_count: 0
}

export enum MetricsActions {
  IncrementMetric = '[Metrics] IncrementMetric',
  SetState = '[Metrics] SetState'
}

// handled by an effect
export class IncrementMetric implements Action {
  readonly type = MetricsActions.IncrementMetric
  constructor(public payload: string) { }
}

export class SetState implements Action {
  readonly type = MetricsActions.SetState
  constructor(public payload: MetricsState) { }
}

export type MetricsActionsUnion = IncrementMetric | SetState

export function metricsReducer(state: MetricsState = initialState, action: MetricsActionsUnion) {
  switch (action.type) {
    case MetricsActions.SetState:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
} 