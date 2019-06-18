// library imports
import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { cold, hot } from 'jasmine-marbles'
import { Observable } from 'rxjs'

// project imports
import { MetricsEffects } from './metrics.effects'
import { IncrementMetric, SetState } from './metrics.reducers'
import { StateService } from './../_services'

describe('metrics effects', () => {
  let effects: MetricsEffects
  let actions: Observable<any>
  let stateService: StateService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        MetricsEffects,
        provideMockActions(() => actions),
        {
          provide: StateService, useValue: {
            getState: () => { }
          }
        }
      ]
    })

    effects = TestBed.get(MetricsEffects)
    stateService = TestBed.get(StateService)
  })

  it('should set up the test bed', () => {
    expect(effects).toBeTruthy()
  })

  it('should work', () => {
    const action = new IncrementMetric('hero_page_load_count')
    const outcome = new SetState(<any>{ hero_page_load_count: 3 })

    actions = hot('-a', { a: action })
    const response = cold('-a|', { a: { hero_page_load_count: 2 } })
    const expected = cold('--b', { b: outcome })
    spyOn(stateService, 'getState').and.returnValue(response)
    expect(effects.loadMetrics$).toBeObservable(expected)
  })
})