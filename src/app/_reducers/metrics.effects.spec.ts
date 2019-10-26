// library imports
import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { cold, hot } from 'jasmine-marbles'
import { Observable, of } from 'rxjs'

// project imports
import { MetricsEffects } from './metrics.effects'
import { IncrementMetric, SetState, IncrementMetricSuccess } from './metrics.reducers'
import { StateService, BumblebeeService, AuthService, MessageService } from './../_services'

describe('metrics effects', () => {
  let effects: MetricsEffects
  let actions: Observable<any>
  let stateService: StateService
  let messageService: MessageService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: MessageService,
          useValue: {
            sendToast: jasmine.createSpy('sendToast')
          }
        },
        MetricsEffects,
        provideMockActions(() => actions),
        {
          provide: StateService,
          useValue: {
            getState: () => {},
            setState: () => {},
          },
        },
        {
          provide: BumblebeeService,
          useValue: {
            postMessage: () => {},
          },
        },
        {
          provide: AuthService,
          useValue: {
            getUser: () => {},
          },
        },
      ],
    })
    
    messageService = TestBed.get(MessageService)
    effects = TestBed.get(MetricsEffects)
    stateService = TestBed.get(StateService)
  })

  it('should set up the test bed', () => {
    expect(effects).toBeTruthy()
  })

  describe('loadMetrics$', () => {
    it('should return new SetState with the new state', () => {
      const action = new IncrementMetric('hero_page_load_count')
      const outcome = new SetState(<any>{ hero_page_load_count: 3, metricsLoaded: true })
      const success = new IncrementMetricSuccess('hero_page_load_count', 3)
      
      actions = hot('-a', { a: action })
      const response = cold('-a|', { a: { hero_page_load_count: 2 } })
      const expected = cold('--(bc)', { b: outcome, c: success })

      stateService.getState = () => response
      expect(effects.loadMetrics$).toBeObservable(expected)
    })
    // no error handling tests as there's not yet in-app success or failure implecations
    it('should handle badges on IncrementMetricsSuccess', () => {
      const readingAction = new IncrementMetricSuccess('readings_created', 1)
      const commentAction = new IncrementMetricSuccess('comments_created', 1)
      // Test identifying reading and comment badges
      effects['incrementMetricMessages'](readingAction)
      effects['incrementMetricMessages'](commentAction)
      expect(messageService.sendToast).toHaveBeenCalledTimes(2)
    })
    // no error handling tests as there's not yet in-app success or failure implecations
  })
  
  describe('saveMetrics$', () => {
    it('should update the state', () => {
      const action = new SetState(<any>{ hero_page_load_count: 5 })

      actions = hot('--a', { a: action })
      const response = cold('-a|', { a: {} })
      const expected = cold('---b', { b: {} })

      stateService.setState = () => response
      expect(effects.saveMetrics$).toBeObservable(expected)
    })
    // also no error handling tests because nothing critical is depending on success
  })
})
