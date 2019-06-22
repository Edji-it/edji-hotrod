import { Injectable } from "@angular/core"
import { Effect, Actions, ofType } from '@ngrx/effects'
import { switchMap, mergeMap, tap, map, catchError } from "rxjs/operators"
import { StateService } from './../_services/state.service'
import { Action } from '@ngrx/store'
import { of, Observable } from "rxjs"

import { MetricsActions, IncrementMetric, SetState } from './metrics.reducers'
import { BumblebeeService } from "../_services"

@Injectable()
export class MetricsEffects {
  constructor(private actions$: Actions, private _state: StateService, private _bumblebee: BumblebeeService) { }

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
          map(() => this._bumblebee.postMessage({ target: 'corbin', message: `metrics increased to ${payload}`, target_type: 'user' })),
          catchError((err) => { console.error(err); return of() })
        )
    })
  )
}