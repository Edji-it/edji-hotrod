import { browser, by, element, protractor } from 'protractor'

export class CommentExplorer {
  private EC = protractor.ExpectedConditions // vital

  public sortByTime = element(by.id('sortByCreated'))
  public sortByLocation = element(by.id('sortByLocation'))
  public timelineLine = element(by.css('.timeline-line'))
  public close = element(by.css('[data-text="closeCommentExplorer"]'))
  // Explorer Headers
  public allHeader = element(by.css('[data-test="allFilterHeader"]'))
  public lineHeader = element(by.css('[data-test="lineFilterHeader"]'))
  public userHeader = element(by.css('[data-test="userFilterHeader"]'))
  // Loading state
  public loading = element(by.css('[data-test="explorerLoading"]'))

  public waitForLoad(): void {
    // Wait till no longer loading
    browser.wait(this.EC.invisibilityOf(this.loading), 3000, 'comment explorer was stuck in loading state')
    // sleep() reason -- loading screen needs to fade out
    browser.sleep(450)
  }
}
