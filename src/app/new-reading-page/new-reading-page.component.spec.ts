import { TestBed, async, } from '@angular/core/testing'
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import * as Hammer from 'hammerjs'
import * as Rangy from 'rangy'

// Project Dependencies
import {
    AuthService,
    ProjectService,
    ReadingService,
    UtilToolService,
    AcademyService,
    MessageService,
    MediaService
} from '../_services'
import { NewReadingPage } from './new-reading-page.component'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../app-shared.module';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from '../app.module';
import { EmojiOnePipe } from '../_pipes';
import { RouterTestingModule } from '@angular/router/testing';

describe('NewReadingPage', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [EmojiOnePipe, NewReadingPage],
            providers: [
                {
                    provide: AuthService, useValue: {
                        getUser: () => { return { username: "Tester" } }
                    }
                },
                { provide: ProjectService, useValue: {} },
                { provide: ReadingService, useValue: {} },
                { provide: UtilToolService, useValue: {} },
                { provide: AcademyService, useValue: {} },
                { provide: MessageService, useValue: {} },
                { provide: MediaService, useValue: {} },
                { provide: Hammer, useValue: {} },
                { provide: Angulartics2, useValue: {} },
                { provide: Angulartics2GoogleGlobalSiteTag, useValue: { startTracking: () => { } } },
                FormBuilder
            ],
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
            ]
        }).compileComponents()
    }))
    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(NewReadingPage)
        const app = fixture.debugElement.componentInstance
        expect(app).toBeTruthy()
    }))
    // it(`should have as title 'app'`, async(() => {
    //   const fixture = TestBed.createComponent(AppComponent)
    //   const app = fixture.debugElement.componentInstance
    //   expect(app.title).toEqual('app')
    // }))
})
