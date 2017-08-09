import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Questions implements PageObjectInterface {

  /*
  8 Aug 2017
  Last Mod: 8 Aug 2017
  
  Easily reference parts of the project page test page.
  */

  public testQuestion = element(by.id("598a2313fed26c49c90a278a")); // Get the testQuestion by it's id, which is it's question._id

  public getPage() : void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get("/#");
    // Load a good sample Project with Questions
    browser.get("/#/project/vk29");
  } // public getQuestionsPage() : void {
} // class