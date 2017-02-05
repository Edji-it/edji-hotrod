import { browser, by, element, protractor } from 'protractor';

import { LoginForm, GuestLoginForm } from '.';

export class LoginModal {
  private EC = protractor.ExpectedConditions; // vital
  private loginForm: LoginForm;
  private guestForm: GuestLoginForm;

  constructor() {
    this.loginForm = new LoginForm();
    this.guestForm = new GuestLoginForm;
  }

  // html elements for guest login
  public guestLoginHeader = element(by.id("guestLoginHeader"));
  public guestNameInput = element(by.id("guestNameInput"));
  public guestLoginButton = element(by.id("guestLoginButton"));
  public gotoAccountLoginButton = element(by.id("gotoAccountLoginButton"));
  public guestBadNameErr = element(by.id("msgBadName"));

  // html elements for user login
  public accountLoginHeader = element(by.id("accountLoginHeader"));
  public usernameInput = element(by.id("usernameInput"));
  public passwordInput = element(by.id("passwordInput"));
  public accountLoginButton = element(by.id("buttonLogin"));
  public gotoGuestLoginButton = element(by.id("gotoGuestLoginButton"));

  // other variables
  public guestLogin = "cake eater";
  public username = "student";
  public password = "student";

  public testLoginModalErrors() {
    describe("Login modal errors", () => {
      it("should initialize on the guest login form", () => {
        browser.wait(this.EC.presenceOf(this.guestLoginHeader), 5000, "did not initialize on the guest login form");
      });

      describe("Account login errors", () => {
        beforeEach(() => {
          // go to the account login form before each test
          browser.wait(this.EC.elementToBeClickable(this.gotoAccountLoginButton), 5000, "button to navigate to account login never became clickable");
          this.gotoAccountLoginButton.click();
        });

        this.loginForm.testLoginErrors();
      });

      describe("Guest login errors", () => {
        this.guestForm.testGuestLoginErrors();
      });
    });
  }
}