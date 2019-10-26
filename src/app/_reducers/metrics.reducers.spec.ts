// project imports
import { metricsReducer as reducer, IncrementMetric, SetState } from './metrics.reducers'

const initialState = {
  metricsLoaded: false,
  hero_page_load_count: 0,
  comments_created: 0,
  readings_created: 0,
}

describe('metrics actions', () => {
  describe('undefined action', () => {
    it('should return default state for undefined action', () => {
      const action = { type: 'NOOP' } as any
      const result = reducer(undefined, action)
      expect(result).toEqual(initialState)
    })
  })
  describe('IncrementMetric', () => {
    it('should return the existing state', () => {
      const state = { ...initialState, hero_page_load_count: 2 }
      const action = new IncrementMetric('hero_page_load_count')
      const result = reducer(state, action)
      expect(result).toEqual(state)
    })
  })
  describe('SetState', () => {
    it('should return the initial state', () => {
      const action = new SetState(<any>{})
      const result = reducer(initialState, action)
      expect(result).toEqual(initialState)
    })
    it('should overwrite new properties on state', () => {
      const state: any = { metricsLoaded: true, hero_page_load_count: 3 }
      const action = new SetState(state)
      const result = reducer(initialState, action)
      const overwritten: any = { ...initialState, ...state }
      expect(result).toEqual(overwritten)
    })
  })
})
