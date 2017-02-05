import { browser, by, element, protractor } from 'protractor';

import { LoginForm } from '.';

export class LoginModal {
  private EC = protractor.ExpectedConditions; // vital
  private loginForm: LoginForm;

  constructor() {
    this.loginForm = new LoginForm();
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

  public testLoginModal() {
    describe("Login modal", () => {
      it("should initialize on the guest login form", () => {
        browser.wait(this.EC.presenceOf(this.guestLoginHeader), 5000, "did not initialize on the guest login form");
      });

      describe("Account login", () => {

        // go to the account login form before each test
        beforeEach(() => {
          browser.wait(this.EC.elementToBeClickable(this.gotoAccountLoginButton));
          this.gotoAccountLoginButton.click();
        });

        this.loginForm.testLoginErrors();
      });
    });
  }
}