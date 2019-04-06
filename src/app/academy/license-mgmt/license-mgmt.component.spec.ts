import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LicenseMgmtComponent } from './license-mgmt.component'

describe('LicenseMgmtComponent', () => {
  let component: LicenseMgmtComponent
  let fixture: ComponentFixture<LicenseMgmtComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LicenseMgmtComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseMgmtComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
