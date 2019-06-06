import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { LicenseWelcomeComponent } from './license-welcome.component'
import { EmojiOnePipe } from '../_pipes'
import { AcademyService } from '../_services'
import { of } from 'rxjs'

/**
 * This test is an example of using the component directly, rather than compiling it
 */
describe('LicenseWelcomeComponent', () => {
  let component: LicenseWelcomeComponent

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule],
      declarations: [EmojiOnePipe],
      providers: [
        LicenseWelcomeComponent,
        {
          provide: AcademyService,
          useValue: {
            getInstitution: value => {
              return of({ institution: 'Test' })
            },
          },
        },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    component = TestBed.get(LicenseWelcomeComponent)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
