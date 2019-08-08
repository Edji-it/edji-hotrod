import { TestBed, async } from '@angular/core/testing'
import { AppComponent } from './app.component'
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { AuthService, MessageService } from './_services'

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: MessageService, useValue: { init: () => {} } },
        { provide: Angulartics2, useValue: {} },
        { provide: Angulartics2GoogleGlobalSiteTag, useValue: { startTracking: () => {} } },
      ],
    }).compileComponents()
  }))
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  }))
  // it(`should have as title 'app'`, async(() => {
  //   const fixture = TestBed.createComponent(AppComponent)
  //   const app = fixture.debugElement.componentInstance
  //   expect(app.title).toEqual('app')
  // }))
})
