import { Injectable } from '@angular/core'
import { Effect, Actions, ofType } from '@ngrx/effects'
import { switchMap, map, catchError, flatMap } from 'rxjs/operators'
import { StateService } from './../_services/state.service'
import { of } from 'rxjs'

import { MetricsActions, IncrementMetric, SetState, IncrementMetricSuccess } from './metrics.reducers'
import { BumblebeeService, AuthService, MessageService } from '../_services'
import { BADGES } from '../badges/badges'

@Injectable()
export class MetricsEffects {
  constructor(
    private actions$: Actions,
    private _state: StateService,
    private _bumblebee: BumblebeeService,
    private _auth: AuthService,
    private _message: MessageService
  ) {}

  /** retrieve fresh metrics and dispatch events to set new state */
  @Effect()
  loadMetrics$ = this.actions$.pipe(
    ofType(MetricsActions.IncrementMetric),
    switchMap(({ payload }: IncrementMetric) => {
      return this._state.getState('metrics').pipe(
        flatMap(metrics => { 
          let state = { ...metrics, [payload]: ++metrics[payload], metricsLoaded: true }
          let actions: {type: MetricsActions, payload: any}[] = [new SetState(state)]
          // Allow for effects after increment
          actions.push(new IncrementMetricSuccess(payload, state[payload]))
          return actions
        }),
        catchError(err => {
          console.error(err)
          return of()
        }),
      )
    }),
  )

  /**
   * Effect for handling an increment
   */
  @Effect({ dispatch: false})
  incrementMetricSuccess$ = this.actions$.pipe(
    ofType(MetricsActions.IncrementMetricSuccess),
    map(({metric, payload})=> {
      // Handle cases for specific metric increments
      switch(metric) {
        case 'hero_page_load_count':
          // Hero Page slack post
          if (payload > 1) {
            const user = this._auth.getUser()
            const email = user && user.email ? user.email : 'no email provided'
            this._bumblebee.postMessage({
              target: 'live-data',
              message: `${email} has loaded the hero page ${payload} times`,
              target_type: 'channel',
            })
          }
        default: 
          // Identify if badge was achieved with increment
          let badge = BADGES.find(badge => {
            return badge.metric === metric && payload === badge.value_required
          })
          // Send associated toast if badge was earned
          if (badge && badge.toast) {
            this._message.sendToast(badge.toast)
          }
          break
      }
    }),
    catchError(err => {
      console.error(err)
      return of()
    })
  )

  /** update the metrics state with payload */
  @Effect({ dispatch: false })
  incrementMetric$ = this.actions$.pipe(
    ofType(MetricsActions.SetState),
    switchMap(({ payload }: SetState) => {
      return this._state.setState('metrics', payload).pipe(
        map((x) => {
          // Handle saved state
        }),
        catchError(err => {
          console.error(err)
          return of()
        }),
      )
    }),
  )
}
