import { browser, by, element, protractor } from 'protractor';

export class LoginModal {

  // html elements
  public projectHud = element(by.id("InfoHud"));
  public guestNameInput = element(by.id("guestNameInput"));
  public guestLoginButton = element(by.id("guestLoginButton"));
  public gotoAccountLoginButton = element(by.id("gotoAccountLoginButton"));
  public guestLoginHeader = element(by.id("guestLoginHeader"));
  public accountLoginHeader = element(by.id("accountLoginHeader"));

  // other variables
  public guestLogin = "cake eater";
}