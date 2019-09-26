import { browser, by, element, protractor } from 'protractor'

export class UserDetailsModal {
  private EC = protractor.ExpectedConditions

  public modal = element(by.id('userDetailsModal'))
  public sourceInput = element(by.id('sourceInput'))
  public sourceOptions = element.all(by.css('[data-test="sourceOption"]'))
  public detailsSubmit = element(by.css('[data-text="userDetailsSubmit"]'))

  public addDetails(): void {
    // Wait for modal to load
    browser.wait(
      this.EC.elementToBeClickable(this.sourceInput),
      5000,
      'additional details or source dropdown did not load',
    )
    // Open dropdown
    this.sourceInput.click()
    // Select first "friend" option
    browser.wait(
      this.EC.elementToBeClickable(this.sourceOptions.first()),
      3000,
      'source dropdown options did not become clickable',
    )
    this.sourceOptions.first().click()
    // Submit
    this.detailsSubmit.click()
    // wait() excuse -- wait for modal to fade out
    browser.sleep(400)
  }
}
