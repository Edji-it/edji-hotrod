import { TestBed, inject } from '@angular/core/testing';

import { AcademyService } from './academy.service';

describe('AcademyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AcademyService]
    });
  });

  it('should be created', inject([AcademyService], (service: AcademyService) => {
    expect(service).toBeTruthy();
  }));
});
