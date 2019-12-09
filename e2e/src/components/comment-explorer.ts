import { browser, by, element, protractor } from 'protractor'

export class CommentExplorer {
  public sortByTime = element(by.id('sortByCreated'))
  public sortByLocation = element(by.id('sortByLocation'))
  public timelineLine = element(by.css('.timeline-line'))
  public close = element(by.css('[data-text="closeCommentExplorer"]'))
  // Explorer Headers
  public allHeader = element(by.css('[data-test="allFilterHeader"]'))
  public lineHeader = element(by.css('[data-test="lineFilterHeader"]'))
  public userHeader = element(by.css('[data-test="userFilterHeader"]'))
}
