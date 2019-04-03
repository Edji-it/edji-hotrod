import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HotChartGaugeComponent } from './hot-chart-gauge.component'

describe('HotChartGaugeComponent', () => {
  let component: HotChartGaugeComponent
  let fixture: ComponentFixture<HotChartGaugeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HotChartGaugeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HotChartGaugeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
