import { browser, by, element, protractor } from 'protractor'
import { UserDetailsModal } from './user-details-modal'

export class RegisterForm {
  private EC = protractor.ExpectedConditions // vital

  // Elements for User Registration
  public usernameInput = element(by.id('usernameInput'))
  // public fullnameInput = element(by.id('fullnameInput'))
  public firstnameInput = element(by.id('firstnameInput'))
  public lastnameInput = element(by.id('lastnameInput'))
  public emailInput = element(by.id('emailInput'))
  public passwordInput = element(by.id('passwordInput'))
  public passwordConfirmInput = element(by.id('passwordConfirmInput'))
  public registerButton = element(by.id('buttonRegister'))

  // Profile fields
  public otherIdentities = element(by.css('[data-test="toggleOtherIdentities"]'))
  public teacherOption = element(by.id('typeTeacherInput'))
  public studentOption = element(by.id('typeStudentInput'))
  public businessOption = element(by.id('typeBusinessInput'))
  public personalOption = element(by.id('typePersonalInput'))
  public robotOption = element(by.id('typeRobotInput'))
  public otherOption = element(by.id('typeOtherInput'))
  public confirmProfile = element(by.id('buttonCreateProfile'))

  /**
   * Tests all Registration Form errors
   */
  public testRegisterErrors(): void { }

  /**
   * Clear registration form
   * + Useful for ensuring there are no lingering values
   */
  public clear(): void {
    // this.usernameInput.clear()
    // this.firstnameInput.clear()
    this.emailInput.clear()
    this.passwordInput.clear()
    this.passwordConfirmInput.clear()
  }

  public profileClear(): void {
    this.firstnameInput.clear()
    this.lastnameInput.clear()
  }

  /**
   * Register a User
   */
  public submit(username?: string, firstname?: string, lastname?: string, email?: string, password?: string): void {
    // If login function not passed credentials, default to teacher user
    if (!username) {
      username = 'BOT-' + new Date().valueOf()
    }
    // if (!fullname) {
    //   fullname = 'Test Bot Clone'
    // }
    if (!firstname) {
      firstname = 'Test'
    }
    if (!lastname) {
      lastname = 'Bot'
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
    // this.usernameInput.sendKeys(username)
    // this.fullnameInput.sendKeys(fullname)
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

    // Should land on Create Profile page
    browser.wait(this.EC.urlContains('register/profile'), 5000, 'first registration form did not land on profile page')
    browser.wait(this.EC.elementToBeClickable(this.firstnameInput), 3000, 'first name input or profile page did not load')

    // Enter name
    this.firstnameInput.sendKeys(firstname)
    this.lastnameInput.sendKeys(lastname)
    // Select identity
    this.otherIdentities.click()
    browser.wait(this.EC.elementToBeClickable(this.robotOption), 3000, 'other identity options did not become available')
    this.robotOption.click()
    // If teacher, select school


    this.confirmProfile.click()

  }
}
