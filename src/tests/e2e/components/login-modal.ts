import { browser, by, element, protractor } from 'protractor';

export class LoginModal {

  // html elements for guest login
  public guestLoginHeader = element(by.id("guestLoginHeader"));
  public guestNameInput = element(by.id("guestNameInput"));
  public guestLoginButton = element(by.id("guestLoginButton"));
  public gotoAccountLoginButton = element(by.id("gotoAccountLoginButton"));

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
}