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
      console.log('effect intercepted increment', payload)
      return this._state.getState('metrics').pipe(
        map((metrics) => new SetState({ ...metrics, [payload]: ++metrics[payload] })
        ),
        /** @todo handle error */
        catchError(() => of())
      )
    })
  )

  /** update the metrics state with payload */
  @Effect({ dispatch: false })
  incrementMetric$ = this.actions$.pipe(
    ofType(MetricsActions.SetState),
    switchMap(({ payload }: SetState) => {
      console.log('setting new state as', payload)
      return this._state.setState('metrics', payload)
        .pipe(
          catchError((err) => { console.error(err); return of() })
        )
    })
  )
}