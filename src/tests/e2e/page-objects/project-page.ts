import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {
  public getPage(): void {
    browser.get("/#/project/587982a88345010011338c05")
  }

}