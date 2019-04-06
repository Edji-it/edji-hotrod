import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LicenseInviteComponent } from './license-invite-support.component'

describe('LicenseInviteComponent', () => {
  let component: LicenseInviteComponent
  let fixture: ComponentFixture<LicenseInviteComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LicenseInviteComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseInviteComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
