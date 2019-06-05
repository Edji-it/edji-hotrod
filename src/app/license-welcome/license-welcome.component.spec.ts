import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { LicenseWelcomeComponent } from './license-welcome.component'
import { EmojiOnePipe } from '../_pipes'
import { AcademyService } from '../_services'
import { of } from 'rxjs'

describe('LicenseWelcomeComponent', () => {
  let component: LicenseWelcomeComponent
  let fixture: ComponentFixture<LicenseWelcomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule],
      declarations: [LicenseWelcomeComponent, EmojiOnePipe],
      providers: [
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
    fixture = TestBed.createComponent(LicenseWelcomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
