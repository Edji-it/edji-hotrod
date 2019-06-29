import { browser, by, element, protractor } from 'protractor'
import { UserDetailsModal } from './user-details-modal'

export class RegisterForm {
  private EC = protractor.ExpectedConditions // vital

  // Elements for User Registration
  public usernameInput = element(by.id('usernameInput'))
  public fullnameInput = element(by.id('fullnameInput'))
  public emailInput = element(by.id('emailInput'))
  public passwordInput = element(by.id('passwordInput'))
  public passwordConfirmInput = element(by.id('passwordConfirmInput'))
  public registerButton = element(by.id('buttonRegister'))

  /**
   * Tests all Registration Form errors
   */
  public testRegisterErrors(): void { }

  /**
   * Clear registration form
   * + Useful for ensuring there are no lingering values
   */
  public clear(): void {
    this.usernameInput.clear()
    this.fullnameInput.clear()
    this.emailInput.clear()
    this.passwordInput.clear()
    this.passwordConfirmInput.clear()
  }

  /**
   * Register a User
   */
  public submit(username?: string, fullname?: string, email?: string, password?: string): void {
    // If login function not passed credentials, default to teacher user
    if (!username) {
      username = 'BOT-' + new Date().valueOf()
    }
    if (!fullname) {
      fullname = 'Test Bot Clone'
    }
    if (!email) {
      email = username + '@edji.it'
    }
    if (!password) {
      password = 'password'
    }
    // Has the page rendered?
    browser.wait(this.EC.visibilityOf(this.registerButton), 5000, 'register button never became clickable')

    // Ensure form is clear
    this.clear()
    this.usernameInput.sendKeys(username)
    this.fullnameInput.sendKeys(fullname)
    this.emailInput.sendKeys(email)
    this.passwordInput.sendKeys(password)
    this.passwordConfirmInput.sendKeys(password)

    // Submit form
    browser.wait(
      this.EC.elementToBeClickable(this.registerButton),
      5000,
      'register button not clickable after register form entry',
    )
    this.registerButton.submit()
  }

  /**
   * Registers a user and confirms their type as teacher
   */
  public registerAndConfirm(): void {
    let userDetails = new UserDetailsModal()

    // Open registration page
    browser.get('/#/register')
    // Verify user lands on Registration page
    browser.wait(this.EC.urlContains('register'), 5000, 'referral link never landed on registration page')
    // Attempt registration
    this.submit()
    // Created user should land on Dashboard
    browser.wait(this.EC.urlContains('dashboard'), 5000, 'referred user failed to register')
    // Confirm account type
    userDetails.confirmBot('teacher')
  }
}
