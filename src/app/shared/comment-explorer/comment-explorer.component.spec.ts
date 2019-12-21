import { TestBed, async } from '@angular/core/testing'
// import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst'
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Local
import { AuthService, MessageService, SocketService, CommentService } from '../../_services'
import { CommentExplorerComponent } from './comment-explorer.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Router, ActivatedRoute } from '@angular/router'
import { EmojiOnePipe, EdjiDatePipe } from 'src/app/_pipes'
import { ProjectStore } from 'src/app/_store'
import { EdjiComment } from '../datatypes'
// import { AppComponent } from './app.component'

describe('Comment Explorer #cExplorer', () => {
  const sampleCommentArray: EdjiComment[] = [
    {
      _id: '5dfa895b839a460033eab3af',
      author: 'Cody P',
      authorIsTeacher: false,
      createdAt: '2019-12-18T20:17:31.791Z',
      data: 'Vision for a wireless future. A mesh/network functioning as a technologly [sic]',
      dataArray: [],
      end: 337,
      lineY: 273,
      project_id: '5dfa814a9eda07002c69ff38',
      replies: [],
      start: 299,
      text: 'Tapping your phone to a dock near the entrance, which instantly pairs it  to every device in the house',
      type: 'text',
      updatedAt: '2019-12-18T20:18:03.774Z',
      user_id: '59bd8e3eee48dfca29138e87',
    },
    {
      _id: '5dfa891f839a460033eab38c',
      author: 'Angry Student',
      authorIsTeacher: false,
      createdAt: '2019-12-18T20:16:31.318Z',
      data: 'Not the future. Not wireless.',
      dataArray: [],
      end: 2204,
      lineY: 2821,
      project_id: '5dfa814a9eda07002c69ff38',
      replies: [],
      start: 2204,
      text: 'Square',
      type: 'text',
      updatedAt: '2019-12-18T20:16:37.020Z',
      user_id: '5dfa85fd839a460033eab2ad',
    },
    {
      _id: '5dfa88e79eda07002c6a0249',
      author: 'Angry Student',
      authorIsTeacher: false,
      createdAt: '2019-12-18T20:15:35.748Z',
      data: 'Sounds like we have a bright wireless future ahead. YAY TeChNoLogYY',
      dataArray: [],
      end: 1880,
      lineY: 2431,
      project_id: '5dfa814a9eda07002c69ff38',
      replies: [],
      start: 1854,
      text: 'The more Bluetooth devices in  close proximity, the higher the likelihood of failure',
      type: 'text',
      updatedAt: '2019-12-18T20:16:01.463Z',
      user_id: '5dfa85fd839a460033eab2ad',
    },
    {
      _id: '5dfa88ca9eda07002c6a0228',
      author: 'Angry Student',
      authorIsTeacher: false,
      createdAt: '2019-12-18T20:15:06.941Z',
      data: "I'm grimacing at this",
      dataArray: [],
      end: 1141,
      lineY: 1625,
      project_id: '5dfa814a9eda07002c69ff38',
      replies: [],
      start: 1128,
      text: 'promptly threw it against a wall, enraged',
      type: 'text',
      updatedAt: '2019-12-18T20:15:10.195Z',
      user_id: '5dfa85fd839a460033eab2ad',
    },
    {
      _id: '5dfa88a69eda07002c6a01ea',
      author: 'Angry Student',
      authorIsTeacher: false,
      createdAt: '2019-12-18T20:14:30.244Z',
      data: 'Is there a way without pairing',
      dataArray: [],
      end: 254,
      lineY: 221,
      project_id: '5dfa814a9eda07002c69ff38',
      replies: [],
      start: 246,
      text: 'a device to pair it',
      type: 'text',
      updatedAt: '2019-12-18T20:14:36.196Z',
      user_id: '5dfa85fd839a460033eab2ad',
    },
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [EmojiOnePipe, EdjiDatePipe, CommentExplorerComponent],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: MessageService, useValue: { init: () => {} } },
        // { provide: Angulartics2, useValue: {} },
        { provide: ElementRef, useValue: {} },
        { provide: ProjectStore, useValue: {} },
        { provide: SocketService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: CommentService, useValue: {} },
        //     private projectStore: ProjectStore,
        // private _socket: SocketService,
        // public el: ElementRef,
        // private _auth: AuthService,
        // private router: Router,
        // private route: ActivatedRoute,
        // { provide: Angulartics2GoogleGlobalSiteTag, useValue: { startTracking: () => {} } },
      ],
      imports: [ReactiveFormsModule, RouterModule, FormsModule],
    }).compileComponents()
  }))
  it('should build the Comment Explorer', async(() => {
    const fixture = TestBed.createComponent(CommentExplorerComponent)
    const explorer = fixture.debugElement.componentInstance
    expect(explorer).toBeTruthy()
  }))

  it('should process search terms correctly', async(() => {
    const fixture = TestBed.createComponent(CommentExplorerComponent)
    const explorer = fixture.debugElement.componentInstance
    // Set required defaults
    explorer.project = { heat_vision: true }
    explorer.user = { _id: '59bd8e3eee48dfca29138e87' }
    // Set sample comments
    explorer.allComments = sampleCommentArray
    // Check exact search term
    explorer.searchTerm = 'wireless'
    // Search and check results
    explorer.filterComments()
    expect(explorer.comments.length).toBe(3)
    // Check term that should find typos
    explorer.searchTerm = 'technology'
    // Search and check results
    explorer.filterComments()
    expect(explorer.comments.length).toBe(2)
    // Check exact term with special character
    explorer.searchTerm = '"mesh/network"'
    // Search and check results
    explorer.filterComments()
    expect(explorer.comments.length).toBe(1)
    // Check fuzzy long term against content text
    explorer.searchTerm = '"Tapping your phone"'
    // Search and check results
    explorer.filterComments()
    expect(explorer.comments.length).toBe(1)
  }))
})
