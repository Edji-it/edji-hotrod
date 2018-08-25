import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingRecapComponent } from './reading-recap.component';

describe('ReadingRecapComponent', () => {
  let component: ReadingRecapComponent;
  let fixture: ComponentFixture<ReadingRecapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadingRecapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadingRecapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
