// library imports
import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { Actions } from '@ngrx/effects'
import { cold, hot } from 'jasmine-marbles'
import { Observable, empty } from 'rxjs'

// project imports
import { MetricsEffects } from './metrics.effects'
import { IncrementMetric, SetState } from './metrics.reducers'
import { StateService } from './../_services'

export class TestActions extends Actions {
  constructor() {
    super(empty());
  }

  set stream(source: Observable<any>) {
    this.source = source;
  }
}

export function getActions() {
  return new TestActions();
}

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
    spyOn(stateService, 'getState').and.returnValue(response)
    const expected = cold('--b', { b: outcome })

    expect(effects.incrementMetric$).toBeObservable(expected)
  })
})