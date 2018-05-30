import { TestBed, inject } from '@angular/core/testing';

import { LockerService } from './locker.service';

describe('LockerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LockerService]
    });
  });

  it('should be created', inject([LockerService], (service: LockerService) => {
    expect(service).toBeTruthy();
  }));
});
