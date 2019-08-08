import { TestBed, inject } from '@angular/core/testing'
import { Locker } from 'angular-safeguard'

import { LockerService } from './locker.service'

describe('LockerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LockerService, { provide: Locker, useValue: {} }],
    })
  })

  it('should be created', inject([LockerService], (service: LockerService) => {
    expect(service).toBeTruthy()
  }))
})
