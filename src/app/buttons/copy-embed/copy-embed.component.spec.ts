import { TestBed, async } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

import { CopyEmbedButton } from './copy-embed.component'
import { AnalyticsService } from 'src/app/_services'
import { EmojiOnePipe } from 'src/app/_pipes'

describe('CopyEmbedButton', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [EmojiOnePipe, CopyEmbedButton],
      providers: [{ provide: AnalyticsService, useValue: { event: (name: string) => {} } }],
    }).compileComponents()
  }))

  it('should generate correct embed code', async(() => {
    let fixture = TestBed.createComponent(CopyEmbedButton)
    let comp = fixture.componentInstance
    comp.projectId = 'TESTCODE'
    fixture.detectChanges()
    // Verify page embed URL
    expect(comp.embedCode).toContain('src="http://localhost/#/embed/TESTCODE"')
    // Ensure opening and closing iframe tags
    expect(comp.embedCode).toMatch(/^\<iframe/)
    expect(comp.embedCode).toMatch(/\<\/iframe\>$/)
  }))
})
