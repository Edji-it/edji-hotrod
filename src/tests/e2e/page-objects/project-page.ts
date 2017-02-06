import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {

  // Element References
  public addEmojiBtn = element(by.id("addEmojiComment"));
  public addTextBtn = element(by.id("addTextComment"));

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Emoji and Text commenting
    browser.get("/#/project/587982a88345010011338c05");
  }
}