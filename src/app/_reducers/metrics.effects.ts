import { Injectable } from "@angular/core"
import { Effect, Actions, ofType } from '@ngrx/effects'

import { MetricsActions, IncrementMetric, SetState } from './metrics.reducers'
import { switchMap, mergeMap, tap, map, catchError } from "rxjs/operators"
import { StateService } from './../_services/state.service'
import { Action } from '@ngrx/store'
import { of, Observable } from "rxjs"

@Injectable()
export class MetricsEffects {
  constructor(private actions$: Actions, private _state: StateService) { }

  /** retrieve fresh metrics and dispatch events to set new state */
  @Effect()
  loadMetrics$ = this.actions$.pipe(
    ofType(MetricsActions.IncrementMetric),
    switchMap(({ payload }: IncrementMetric) => {
      return this._state.getState('metrics').pipe(
        map(metrics => new SetState({ ...metrics, [payload]: ++metrics[payload], metricsLoaded: true })
        ),
        catchError((err) => { console.error(err); return of() })
      )
    })
  )

  /** update the metrics state with payload */
  @Effect()
  incrementMetric$ = this.actions$.pipe(
    ofType(MetricsActions.SetState),
    switchMap(({ payload }: SetState) => {
      return this._state.setState('metrics', payload)
        .pipe(
          catchError((err) => { console.error(err); return of() })
        )
    })
  )
}