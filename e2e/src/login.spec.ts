import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar } from './page-objects'
import { LoginForm } from './components'

/*
    23 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Login Page', () => {
  /* ---- Variable Initialization --------------- */
  let login = new Login()
  let loginForm = new LoginForm()
  let home = new Home()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions // vital

  /* ---- beforeEach ---------------------------- */
  beforeEach(() => {
    login.getPage()
  })

  /* ---- Generic Login Tests ---------------------------- */

  // Test all login errors
  describe('Login errors', () => {
    loginForm.testLoginErrors()
  })

  // Test successful login flow
  describe('Successful login', () => {
    afterEach(() => {
      sidebar.logout()
    })

    it('should login and navigate to the dashboard', () => {
      // log in a user
      loginForm.login()

      // verify that we reach the dashboard after login
      browser.wait(EC.urlContains('dashboard'), 5000, 'never reached the dashboard after loggin in')
    })
  })

  // Test Reset password form
  describe('Reset password modal should handle multiple account cases', () => {
    beforeEach(() => {
      // Open reset modal
      login.resetPasswordOpen.click()
    })

    afterEach(() => {
      // Close reset modal to clear it
      login.resetPassModalClose.click()
    })

    it('should show an error for a nonexistent account', () => {
      browser.wait(EC.elementToBeClickable(login.resetAccountField), 3000, 'did not see field to enter username/email')
      login.resetAccountField.sendKeys('Nonexistent!')
      login.resetPassSubmit.click()
      browser.wait(EC.visibilityOf(login.resetPassError), 3000, 'did not show error for nonexistent account')
      browser.wait(EC.invisibilityOf(login.resetPassSuccess), 3000, 'saw success message for nonexistent account')
    })

    it('should show an error for a Google account', () => {
      browser.wait(EC.elementToBeClickable(login.resetAccountField), 3000, 'did not see field to enter username/email')
      login.resetAccountField.sendKeys('google@edji.it')
      login.resetPassSubmit.click()
      browser.wait(EC.visibilityOf(login.resetPassError), 3000, 'did not show error for Google account')
      browser.wait(EC.invisibilityOf(login.resetPassSuccess), 3000, 'saw success message for Google account')
    })

    it('should show a success message for an existing account username', () => {
      browser.wait(EC.elementToBeClickable(login.resetAccountField), 3000, 'did not see field to enter username/email')
      login.resetAccountField.sendKeys(login.apiUser)
      login.resetPassSubmit.click()
      browser.wait(
        EC.visibilityOf(login.resetPassSuccess),
        3000,
        'did not show success message for existing account username',
      )
      browser.wait(EC.invisibilityOf(login.resetPassError), 3000, 'saw error message for existing account username')
    })

    it('should show a success message for an existing account email', () => {
      browser.wait(EC.elementToBeClickable(login.resetAccountField), 3000, 'did not see field to enter username/email')
      login.resetAccountField.sendKeys(login.apiUserEmail)
      login.resetPassSubmit.click()
      browser.wait(
        EC.visibilityOf(login.resetPassSuccess),
        3000,
        'did not show success message for existing account email',
      )
      browser.wait(EC.invisibilityOf(login.resetPassError), 3000, 'saw error message for existing account email')
    })
  })
}) // describe Login Page
