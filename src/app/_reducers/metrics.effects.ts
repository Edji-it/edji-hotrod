import { Injectable } from '@angular/core'
import { Effect, Actions, ofType } from '@ngrx/effects'
import { switchMap, map, catchError } from 'rxjs/operators'
import { StateService } from './../_services/state.service'
import { of } from 'rxjs'

import { MetricsActions, IncrementMetric, SetState } from './metrics.reducers'
import { BumblebeeService, AuthService } from '../_services'

@Injectable()
export class MetricsEffects {
  constructor(
    private actions$: Actions,
    private _state: StateService,
    private _bumblebee: BumblebeeService,
    private _auth: AuthService,
  ) {}

  /** retrieve fresh metrics and dispatch events to set new state */
  @Effect()
  loadMetrics$ = this.actions$.pipe(
    ofType(MetricsActions.IncrementMetric),
    switchMap(({ payload }: IncrementMetric) => {
      return this._state.getState('metrics').pipe(
        map(metrics => new SetState({ ...metrics, [payload]: ++metrics[payload], metricsLoaded: true })),
        catchError(err => {
          console.error(err)
          return of()
        }),
      )
    }),
  )

  /** update the metrics state with payload */
  @Effect({ dispatch: false })
  incrementMetric$ = this.actions$.pipe(
    ofType(MetricsActions.SetState),
    switchMap(({ payload }: SetState) => {
      return this._state.setState('metrics', payload).pipe(
        map(() => {
          if (payload.hero_page_load_count > 1) {
            const user = this._auth.getUser()
            const email = user && user.email ? user.email : 'no email provided'
            this._bumblebee.postMessage({
              target: 'live-data',
              message: `${email} has loaded the hero page ${payload.hero_page_load_count} times`,
              target_type: 'channel',
            })
          }
        }),
        catchError(err => {
          console.error(err)
          return of()
        }),
      )
    }),
  )
}
