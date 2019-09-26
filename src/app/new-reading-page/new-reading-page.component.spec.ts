import { TestBed, async } from '@angular/core/testing'
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
  MediaService,
} from '../_services'
import { NewReadingPage } from './new-reading-page.component'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedModule } from '../app-shared.module'
import { ActivatedRoute } from '@angular/router'
import { AppModule } from '../app.module'
import { EmojiOnePipe } from '../_pipes'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'

describe('NewReadingPage', () => {
  /**
   * Mocked document data for media service call
   */
  const pdfJsonData = {
    page: 0,
    word_boxes: [
      { x: 34.23, y: 11.05, w: 23.12, h: 7.7, str: 'Page' },
      { x: 34.31, y: 20.52, w: 23.2, h: 8.14, str: 'Page' },
      { x: 33.99, y: 29.86, w: 23.45, h: 8.65, str: 'Page' },
      { x: 61.85, y: 30.68, w: 3.1, h: 5.81, str: '1' },
      { x: 34.15, y: 40.15, w: 23.37, h: 7.89, str: 'Page' },
      { x: 61.76, y: 40.34, w: 2.94, h: 5.68, str: '1' },
      { x: 34.15, y: 49.87, w: 23.37, h: 7.89, str: 'Page' },
      { x: 61.68, y: 50.06, w: 3.02, h: 5.74, str: '1' },
      { x: 34.07, y: 59.53, w: 23.53, h: 8.08, str: 'Page' },
      { x: 61.6, y: 59.79, w: 3.19, h: 5.68, str: '1' },
      { x: 34.23, y: 69.32, w: 23.2, h: 7.83, str: 'Page' },
      { x: 61.76, y: 69.57, w: 2.78, h: 5.62, str: '1' },
      { x: 33.99, y: 78.35, w: 23.53, h: 8.9, str: 'Page' },
    ],
    doc_conversion: { ms: 0, mb: 0 },
  }
  // Example editor HTML
  const exampleReadingHtml = `<div id="readingPageForm" class="reading-page"><div id="angularMediumEditor"><img src="//image-dev.edji.it/documents/76a2027d-0971-40a7-b02b-4caeaf4f0e7e/76a2027d-0971-40a7-b02b-4caeaf4f0e7e-0.png" title="undefined" edji-data-src="//image-dev.edji.it/documents/76a2027d-0971-40a7-b02b-4caeaf4f0e7e/76a2027d-0971-40a7-b02b-4caeaf4f0e7e-0.json"><p>Test Reading!</p></div></div>`
  // Expected Reading object output (Draft)
  const expectedReadingDraftOutput = {
    title: 'Test',
    words: [
      {
        str: '',
        url:
          '//image-dev.edji.it/documents/76a2027d-0971-40a7-b02b-4caeaf4f0e7e/76a2027d-0971-40a7-b02b-4caeaf4f0e7e-0.png',
        styles: ['img'],
        boxes: pdfJsonData.word_boxes,
      },
      { str: 'Test', styles: ['p', 'p-a'] },
      {},
      { str: 'Reading', styles: ['p'] },
      { str: '!', styles: ['p', 'p-z'] },
    ],
    html: exampleReadingHtml,
    source: null,
    draft: true,
    questions: [],
    public: 'true',
    subjects: [],
    grade_levels: [],
    createdAt: '2019-08-27T22:27:04.444Z',
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [EmojiOnePipe, NewReadingPage],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getUser: () => {
              return { username: 'Tester' }
            },
            getCurrentUser: () => {
              return of({ username: 'Tester' })
            },
            getEnv: () => {
              return 'dev'
            },
          },
        },
        { provide: ProjectService, useValue: {} },
        {
          provide: ReadingService,
          useValue: {
            currentUserReadings: of([]),
          },
        },
        { provide: UtilToolService, useValue: {} },
        { provide: AcademyService, useValue: {} },
        { provide: MessageService, useValue: {} },
        {
          provide: MediaService,
          useValue: {
            getDocumentData: () => {
              return of(pdfJsonData)
            },
          },
        },
        { provide: Hammer, useValue: {} },
        { provide: Angulartics2, useValue: {} },
        { provide: Angulartics2GoogleGlobalSiteTag, useValue: { startTracking: () => {} } },
        FormBuilder,
      ],
      imports: [RouterTestingModule, ReactiveFormsModule, FormsModule],
    }).compileComponents()
  }))
  it('should create the app', () => {
    const fixture = TestBed.createComponent(NewReadingPage)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  })

  /**
   * Test that handling an inserted image with a data property attaches a data attribute
   */
  it('should attach data property for images with OCR data', () => {
    const exampleImageArray = [
      {
        title: 'Test Image',
        url: '//image-dev.edji.it/documents/example-id/example-id.png',
        data: '//image-dev.edji.it/documents/example-id/example-id-0.json',
      },
    ]
    const fixture = TestBed.createComponent(NewReadingPage)
    let component = fixture.componentInstance
    // Insert image data into Reading
    component.addImages(exampleImageArray)
    // We expect the image tags to be attached to the readingHtml
    expect(component.readingHtml[0].text).toContain(
      'edji-data-src="//image-dev.edji.it/documents/example-id/example-id-0.json"',
    )
  })

  /**
   * Test processing the reading HTML
   */
  it('formatReading(): should produce a valid Reading words array', async () => {
    let fixture = TestBed.createComponent(NewReadingPage)
    let component = fixture.componentInstance
    // To avoid fully rendering the component with bindings, we can mock the editor directly
    document.body.innerHTML = exampleReadingHtml
    let formattedReadingObj = await component.formatReading({ html: exampleReadingHtml })
    // Verify word values on formatted output
    expect(formattedReadingObj.words.length).toEqual(expectedReadingDraftOutput.words.length)
    // Verify image word properties
    expect(formattedReadingObj.words[0].styles).toContain('img')
    expect(formattedReadingObj.words[0].url).toEqual(expectedReadingDraftOutput.words[0].url)
    expect(formattedReadingObj.words[0].str).toBeFalsy()
    expect(formattedReadingObj.words[0].boxes[0]).toEqual(pdfJsonData.word_boxes[0])
    // Verify text word properties
    expect(formattedReadingObj.words[1].str).toEqual('Test')
    expect(formattedReadingObj.words[1].styles).toContain('p')
  })
})
