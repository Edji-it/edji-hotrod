import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {

  /*
  Last Mod: 8 Aug 2017
  
  Easily reference parts of the project page test page.
  */

  // Element References
  public addEmojiBtn = element(by.id("addEmojiComment"));
  public addTextBtn = element(by.id("addTextComment"));
  public addAudioBtn = element(by.id("addAudioComment"));
  public addReplyBtn = element(by.id("addReply"));
  public addTextReplyBtn = element(by.id("addTextReply"));
  public addEmojiReplyBtn = element(by.id("addEmojiReply"));
  public addAudioReplyBtn = element(by.id("addAudioReply"));
  public image = element(by.css('article .img-wrap > img'));
  public textComment = element(by.css('.comment.new .text-comment-input'));
  public existingTextComment = element(by.css('div.text-comment-input'));
  public textReplyComment = element(by.css('.replyComment .text-comment-input'));
  public dismissReplyPanelBtn = element(by.id('discussionClosePanel'));
  public discussionPanel = element(by.css('div.sliding-pane.from-left.replies.slide-in'));
  public commentSave = element(by.css('.comment__save'));
  public commentDelete = element(by.css('.comment.new button.inline-delete'));
  public emojiCommentDelete = element(by.css('button.inline-delete'));
  public replyDelete = element(by.css('button.inline-delete'));
  public imageRight = 25;
  public imageDown = 25;

  // Audio Comment test variables
  public audioPlay = element(by.css('edji-comment:not(.hidden) #audioPlay'));
  public audioPause = element(by.css('edji-comment:not(.hidden) #audioPause'));
  public audioRestart = element(by.css('edji-comment:not(.hidden) #audioRestart'));
  public audioRecord = element(by.css('edji-comment:not(.hidden) #audioRecord'));
  public emojiCommentSave = element(by.css('.comment.active .comment__save'));
  public audioComment = element.all(by.css('.audio-comment-input-wrapper')).first();

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Emoji and Text commenting (owned by teach/teach)
    browser.get("/#/project/test");
  }

  public getAudioPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Audio commenting (owned by testhero/testhero16)
    browser.get("/#/project/audio");
  }

  public getReplyPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with reply functions (owned by testhero/testhero16)
    browser.get("/#/project/reply");
  }
} // class