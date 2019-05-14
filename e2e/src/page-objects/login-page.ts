import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'
import { Sidebar } from '.'

export class Login implements PageObjectInterface {
  /*
    23 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    Page Object for the Login page.
    */

  // Public Instance Variables
  public edjiLogo = element(by.id('edjiLogo'))
  public loginButton = element(by.id('buttonLogin'))
  public usernameInput = element(by.id('usernameInput'))
  public passwordInput = element(by.id('passwordInput'))
  public msgError = element(by.id('msgError'))
  public msgNoUserName = element(by.id('msgNoUserName'))
  public msgBadName = element(by.id('msgBadName'))
  public guestNameInput = element(by.id('guestNameInput'))
  public guestLoginButton = element(by.id('guestLoginButton'))
  public gotoRegistrationButton = element(by.id('gotoRegistration'))

  // Reset password elements
  public resetPasswordOpen = element(by.id('linkForgotPassword'))
  public resetAccountField = element(by.id('inputPassResetUsername'))
  public resetPassSubmit = element(by.id('btnPassResetSubmit'))
  public resetPassModalClose = element(by.css('#passResetModal .close'))
  public resetPassFormClose = element(by.id('btnPassResetClose'))
  public resetPassSuccess = element(by.css('#passResetModal .alert-success'))
  public resetPassError = element(by.css('#passResetModal .alert-danger'))

  // Account Credentials
  public studentUser = 'student'
  public studentPassword = 'student'
  public teacherUser = 'testsidekick'
  public teacherUserEmail = 'sidekick@edji.it'
  public teacherPassword = 'testsidekick16'
  public apiUser = 'api_email_success'
  public apiUserEmail = 'success@simulator.amazonses.com'
  public apiUserPassword = 'tester'
  public heroUser = 'testhero'
  public heroPassword = 'testhero16'
  public adminUser = 'testadmin'
  public adminPassword = 'testadmin16'
  public botUser = 'testbot'
  public botPassword = 'testbot'
  public referUser = 'testrefer'
  public referPassword = 'testrefer2000'
  public invalidEntry = 'HitlerHatesEDJI_666_420'
  public validProjectCode = 'test'
  public testGuestName = 'Queen Elizabeth II'

  // get the login page
  getPage(): void {
    browser.get('/#/login')
  } // getPage() : void

  clickEdjiLogo(): void {
    this.edjiLogo.click()
  } // clickEdjiLogo ()

  enterUsername(input: string): void {
    this.usernameInput.sendKeys(input)
  } // enterUsername (input : string) : void

  enterPassword(input: string): void {
    this.passwordInput.sendKeys(input)
  } // enterPassword (input : string) : void

  loginAndVerify(user: string, pass: string, defUrl?: string): void {
    let url = defUrl ? defUrl : 'dashboard'
    let EC = protractor.ExpectedConditions
    let sidebar = new Sidebar()
    this.enterUsername(user)
    this.enterPassword(pass)
    browser.wait(EC.elementToBeClickable(this.loginButton), 5000)
    this.loginButton.click()
    browser.wait(EC.urlContains(url), 5000, 'never arrived at dashboard')
    sidebar.closeModals()
  }
} // class Login
