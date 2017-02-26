import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {

  // Element References
  public addEmojiBtn = element(by.id("addEmojiComment"));
  public addTextBtn = element(by.id("addTextComment"));
  public image = element(by.css('article > span > img'));
  public textComment = element(by.css('.comment.new textarea.text-comment-input'));
  public commentSave = element(by.css('.comment__save'));
  // public commentDelete = element(by.css('.comment.new button.inline-delete'));

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Emoji and Text commenting (owned by teach/teach)
    browser.get("/#/project/58b102f181126c4be2165ee2");
  }
}