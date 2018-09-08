import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotChartHzbarComponent } from './hot-chart-hzbar.component';

describe('HotChartHzbarComponent', () => {
  let component: HotChartHzbarComponent;
  let fixture: ComponentFixture<HotChartHzbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotChartHzbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotChartHzbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
