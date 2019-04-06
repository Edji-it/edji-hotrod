import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LicenseWelcomeComponent } from './license-welcome.component'

describe('LicenseWelcomeComponent', () => {
  let component: LicenseWelcomeComponent
  let fixture: ComponentFixture<LicenseWelcomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LicenseWelcomeComponent],
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
