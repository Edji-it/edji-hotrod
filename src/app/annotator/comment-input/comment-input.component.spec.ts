import { TestBed, async } from '@angular/core/testing'
// import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst'
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Local
import { AuthService, MessageService, SocketService, CommentService } from '../../_services'
import { CommentInputComponent } from './comment-input.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Router, ActivatedRoute } from '@angular/router'
import { EmojiOnePipe, EdjiDatePipe, LinkifyPipe } from 'src/app/_pipes'
import { ProjectStore } from 'src/app/_store'

describe('Text Comment Input', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [EmojiOnePipe, EdjiDatePipe, LinkifyPipe, CommentInputComponent],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: MessageService, useValue: { init: () => {} } },
        // { provide: Angulartics2, useValue: {} },
        { provide: ElementRef, useValue: {} },
        { provide: ProjectStore, useValue: {} },
        { provide: SocketService, useValue: {} },
        {
          provide: Router,
          useValue: {
            navigate: (param?: any) => {},
          },
        },
        { provide: ActivatedRoute, useValue: {} },
        { provide: CommentService, useValue: {} },
        EmojiOnePipe,
        LinkifyPipe,
      ],
      imports: [ReactiveFormsModule, RouterModule, FormsModule],
    }).compileComponents()
  }))
  it('should build the Text Comment Component', async(() => {
    const fixture = TestBed.createComponent(CommentInputComponent)
    const explorer = fixture.debugElement.componentInstance
    expect(explorer).toBeTruthy()
  }))

  it('should process content editable html properly', async(() => {
    const fixture = TestBed.createComponent(CommentInputComponent)
    const textComment = fixture.componentInstance
    // Html Elements should be removed
    let emptyHtml = textComment.cleanData('<div><table></table></div>')
    expect(emptyHtml.data).toBe('')
    expect(emptyHtml.type).toBe('text')
    // Wrapped text should be cleaned
    let textWithHtml = textComment.cleanData('<h1>Heading</h1> Text')
    expect(textWithHtml.data).toBe('Heading Text')
    expect(textWithHtml.type).toBe('text')
    // Emoji should be replaced with shortcodes
    let emojiHtml = textComment.cleanData(':100:<img title="bang" src="shouldnt/matter"/>')
    expect(emojiHtml.data).toBe(':100::bang:')
    expect(emojiHtml.type).toBe('emoji')
    // Unicode emoji should be converted, and "br" element should become newlines
    let emojiAndTextHtml = textComment.cleanData('<b>So cool</b><br/>:100:💯')
    expect(emojiAndTextHtml.data).toBe('So cool\n:100::100:')
    expect(emojiAndTextHtml.type).toBe('text')
    // Check processing Quick Labels and links
    let quickLabelHtml = textComment.cleanData(
      '<a class="quick-label">Test Label</a> <a href="somewhere" target="_blank">firstlink.edu</a> other.com/link',
    )
    expect(quickLabelHtml.data).toBe('#[Test Label] firstlink.edu other.com/link')
    expect(quickLabelHtml.type).toBe('text')
  }))
})
