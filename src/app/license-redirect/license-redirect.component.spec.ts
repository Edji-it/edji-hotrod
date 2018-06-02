import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseRedirectComponent } from './license-redirect.component';

describe('LicenseRedirectComponent', () => {
  let component: LicenseRedirectComponent;
  let fixture: ComponentFixture<LicenseRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
