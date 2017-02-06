import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {

  // Element References
  public addEmojiBtn = element(by.id("addEmojiComment"));
  public addTextBtn = element(by.id("addTextComment"));

  public getPage(): void {
    browser.get("/#");
    browser.get("/#/project/587982a88345010011338c05");
  }
}