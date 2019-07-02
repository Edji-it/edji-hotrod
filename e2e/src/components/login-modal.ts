import { browser, by, element, protractor } from 'protractor'

import { LoginForm, GuestLoginForm } from '.'

export class LoginModal {
  private EC = protractor.ExpectedConditions // vital
  private loginForm: LoginForm
  private guestForm: GuestLoginForm

  constructor() {
    this.loginForm = new LoginForm()
    this.guestForm = new GuestLoginForm()
  }

  // html elements for guest login
  public modal = element(by.id('loginModal'))
  public guestLoginHeader = element(by.id('guestLoginHeader'))
  public guestNameInput = element(by.id('guestNameInput'))
  public guestLoginButton = element(by.id('guestLoginButton'))
  public gotoAccountLoginButton = element(by.id('gotoAccountLoginButton'))
  public guestBadNameErr = element(by.id('msgBadName'))

  // html elements for user login
  public clickawaySquare = element(by.css('.e2e-clickaway'))
  public usernameInput = element(by.id('usernameInput'))
  public passwordInput = element(by.id('passwordInput'))
  public accountLoginButton = element(by.id('buttonLogin'))
  public gotoGuestLoginButton = element(by.id('gotoGuestLoginButton'))

  // other variables
  public guestLogin = 'cake eater'
  public username = 'student'
  public password = 'student'

  public testLoginModalErrors() {
    describe('Login modal errors', () => {
      describe('Account login errors', () => {
        beforeAll(() => {
          // go to the account login form before each test
          browser.wait(
            this.EC.elementToBeClickable(this.gotoAccountLoginButton),
            5000,
            'button to navigate to account login never became clickable after component init',
          )
          this.gotoAccountLoginButton.click()
        })

        this.loginForm.testLoginErrors()
      })

      describe('Guest login errors', () => {
        this.guestForm.testGuestLoginErrors()
      })
    })
  }

  /**
   * This is only for testing the success of the guest and account login from the modal
   * It should be wrapped in a describe block which has an afterEach hook. That afterEach should log the user out and bring the user back to the login modal
   * @param validate A function which will validate that the user arrives at the correct place
   */
  public testLoginSuccess(validate: () => void) {
    beforeEach(() => {
      // make sure we're on the right component
      browser.wait(
        this.EC.elementToBeClickable(this.gotoAccountLoginButton),
        7000,
        'button to navigate to account login never became clickable after component init',
      )
    })

    it('should log in a guest user', () => {
      this.guestForm.loginAsGuest()
      validate()
    })

    it('should log in as a user', () => {
      // navigate to account login form
      this.gotoAccountLoginButton.click()

      this.loginForm.login()
      validate()
    })
  }
}
