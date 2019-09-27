import { TestBed, async, ComponentFixture } from '@angular/core/testing'
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Internal
import { AuthService, LockerService, MediaService, SecretSwitchesService } from '../../_services'
import { UploadPdfModalComponent } from '..';
import { EmojiOnePipe } from 'src/app/_pipes';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { of } from 'rxjs';
import { User } from 'src/app/shared/datatypes';

describe('UploadPdfModalComponent', () => {
    let component: UploadPdfModalComponent
    let fixture: ComponentFixture<UploadPdfModalComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [BrowserModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [],
            providers: [
                { provide: AuthService, useValue: {} },
                { provide: LockerService, useValue: {} },
                { provide: MediaService, useValue: {} },
                { provide: Angulartics2, useValue: {} },
                { provide: SecretSwitchesService, useValue: {} }
            ],
        }).compileComponents()
    }))

    it('should create the upload pdf component', async(() => {
        // this.fixture = TestBed.createComponent(UploadPdfModalComponent)
        // this.component = fixture.componentInstance
        // expect(this.component).toBeTruthy()
        this.component = new UploadPdfModalComponent(
            <LockerService>{},
            <MediaService>{},
            <any>{
                refreshUser: () => {
                    return of(<User>{
                        media: {
                            documents: [{
                                title: 'Unit Test Example',
                                pages: ['image-dev.edji.it/example.png']
                            }]
                        }
                    })
                },
            },
            <Angulartics2>{},
            <SecretSwitchesService>{}
        )
        //
        // this.component.confirmDeleteMiniModal()
        // expect(this.component.confirmDelete).toBeTruthy()
    }))
})
