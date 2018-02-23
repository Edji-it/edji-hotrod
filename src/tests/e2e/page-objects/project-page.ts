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
  public addTextReplyBtn = element(by.id("addTextReply"));
  public addEmojiReplyBtn = element(by.id("addEmojiReply"));
  public addAudioReplyBtn = element(by.id("addAudioReply"));
  public image = element(by.css('article .img-wrap > img'));
  public textComment = element(by.css('.new .text-comment textarea'));
  public existingTextComment = element(by.css('div.text-comment-input'));
  public textReplyComment = element(by.css('.replyComment.new .text-comment-input'));
  public dismissReplyPanelBtn = element(by.id('discussionClosePanel'));
  public discussionPanel = element(by.css('div.sliding-pane.from-left.replies.slide-in'));
  public commentSave = element(by.css('.comment__save'));
  public replyDelete = element(by.css('button.inline-delete'));
  public discussionsPane = element(by.css('.replies.slide-in'));
  public imageRight = 25;
  public imageDown = 25;

  // Audio Comment test variables
  public audioPlay = element(by.css('edji-comment:not(.hidden) audio-comment #audioPlay'));
  public audioPause = element(by.css('edji-comment:not(.hidden) audio-comment #audioPause'));
  public audioRestart = element(by.css('edji-comment:not(.hidden) audio-comment #audioRestart'));
  public audioRecord = element(by.css('edji-comment:not(.hidden) audio-comment #audioRecord'));
  public emojiCommentSave = element(by.css('edji-comment .comment-action--save'));
  public audioComment = element.all(by.css('.audio-comment-input-wrapper')).first();

  // Avatar comment pane activators
  public avatarText = element(by.css('.user-icon.avatar-text'));
  public avatarEmoji = element(by.css('.user-icon.avatar-emoji'));
  public avatarAudio = element(by.css('.user-icon.avatar-audio'));
  public avatarTextReply = element(by.css('.user-icon.avatar-text .comment__button--mobile.avatar__reply'));
  public commentDelete = element.all(by.css('edji-comment button.btn-delete')).last();
  public addReplyBtn = element(by.id("addReply"));
  public emojiCommentDelete = element(by.css('edji-comment button.btn-delete'));
  public closePane = element(by.css('.sliding-pane-comment__header button.close'));

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    // browser.get("/#");
    // browser.refresh();
    // Load a good sample Project with Emoji and Text commenting (owned by teach/teach)
    browser.get("/#/project/test");
  }

  public getAudioPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    // browser.get("/#");
    // browser.refresh();
    // Load a good sample Project with Audio commenting (owned by testhero/testhero16)
    browser.get("/#/project/audio");
  }

  public getReplyPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    // browser.get("/#");
    // browser.refresh();
    // Load a good sample Project with reply functions (owned by testhero/testhero16)
    browser.get("/#/project/reply");
  }
} // class