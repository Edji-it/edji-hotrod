import { Sidebar } from '../page-objects';
import { browser, by, element, protractor } from 'protractor';

export class GuestLoginForm {
  private EC = protractor.ExpectedConditions; // vital

  // html elements for guest login
  public guestLoginHeader = element(by.id("guestLoginHeader"));
  public guestNameInput = element(by.id("guestNameInput"));
  public guestLoginButton = element(by.id("guestLoginButton"));
  public guestBadNameErr = element(by.id("msgBadName"));
  public gotoGuestLoginButton = element(by.id("gotoGuestLoginButton"));

  // other variables
  public guestLoginName = "cake eater";

  public testGuestLoginErrors() {
    // don't worry, this beforeEach hook can coexist with another beforeEach hook from the calling module
    beforeEach(() => {
      // Ensure guest login form options are showing
      this.gotoGuestLoginButton.isDisplayed().then((result) => {
          if ( result ) {
              //Whatever if it is true (displayed)
              browser.wait(this.EC.elementToBeClickable(this.gotoGuestLoginButton), 5000, "modal close button never became clickable");
              this.gotoGuestLoginButton.click();
          }
      });
      // make sure the guest login button is going to be clickable
      browser.wait(this.EC.visibilityOf(this.guestLoginButton), 5000, "guest login button never became clickable after form init");
      // clear the input just in case
      this.guestNameInput.clear();
    });

    it("should show an error if the user enters a vulgar name", () => {
      // form handling
      this.guestNameInput.sendKeys("fuck");
      browser.wait(this.EC.elementToBeClickable(this.guestLoginButton), 5000, "guest login button never became clickable after entering text");
      this.guestLoginButton.submit();

      // test validation
      browser.wait(this.EC.presenceOf(this.guestBadNameErr), 5000, "bad name error never showed to the user");
    });
  }

  public loginAsGuest() {
    // make sure the guest login button is going to be clickable
    browser.wait(this.EC.visibilityOf(this.guestLoginButton), 7000, "guest login button never became visible after form init");
    // clear the input just in case
    this.guestNameInput.clear();
    // form handling
    this.guestNameInput.sendKeys(this.guestLoginName);
    // Gets stuck here
    browser.wait(this.EC.elementToBeClickable(this.guestLoginButton), 5000, "guest login button never became clickable after entering text");
    this.guestLoginButton.submit();
  }
}