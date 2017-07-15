import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {

  // Element References
  public addEmojiBtn = element(by.id("addEmojiComment"));
  public addTextBtn = element(by.id("addTextComment"));
  public addAudioBtn = element(by.id("addAudioComment"));
  public image = element(by.css('article .img-wrap > img'));
  public textComment = element(by.css('.comment.new textarea.text-comment-input'));
  public commentSave = element(by.css('.comment__save'));
  public commentDelete = element(by.css('.comment.new button.inline-delete'));
  public imageRight = 25;
  public imageDown = 25;
  public audioPlay = element(by.id('audioPlay'));
  public audioPause = element(by.id('audioPause'));
  public audioRestart = element(by.id('audioRestart'));
  public audioRecord = element(by.id('audioRecord'));
  public emojiCommentSave = element(by.css('.comment.active .comment__save'));
  public audioComment = element.all(by.css('.audio-comment-input-wrapper')).first();

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Emoji and Text commenting (owned by teach/teach)
    browser.get("/#/project/hjb2");
  }

  public getAudioPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Emoji and Text commenting (owned by teach/teach)
    browser.get("/#/project/mz9n");
  }
}