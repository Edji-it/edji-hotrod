import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar } from './page-objects'
import { LoginForm } from './components'

describe('Login Page', () => {
  let login = new Login()
  let loginForm = new LoginForm()
  let home = new Home()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions

  beforeEach(() => {
    login.getPage()
  })

  

  describe('Login errors', () => {
    loginForm.testLoginErrors()
  })

  describe('Successful login', () => {
    afterEach(() => {
      sidebar.logout()
    })

    it('should login and navigate to the dashboard', () => {
      loginForm.login()
      browser.wait(EC.urlContains('dashboard'), 5000, 'never reached the dashboard after loggin in')
    })
  })

  describe('Reset password modal should handle multiple account cases', () => {
    beforeEach(() => {
      login.resetPasswordOpen.click()
    })

    afterEach(() => {
      login.resetPassModalClose.click()
    })

    it('should show an error for a nonexistent account', () => {
      browser.wait(EC.elementToBeClickable(login.resetAccountField), 3000, 'did not see field to enter username/email')
      login.resetAccountField.sendKeys('Nonexistent!')
      login.resetPassSubmit.click()
      browser.wait(EC.visibilityOf(login.resetPassError), 3000, 'did not show error for nonexistent account')
      browser.wait(EC.invisibilityOf(login.resetPassSuccess), 3000, 'saw success message for nonexistent account')
    })

    it('should show a success message for a Google account', () => {
      browser.wait(EC.elementToBeClickable(login.resetAccountField), 3000, 'did not see field to enter username/email')
      login.resetAccountField.sendKeys('google@edji.it')
      login.resetPassSubmit.click()
      browser.wait(EC.invisibilityOf(login.resetPassError), 3000, 'did not show error for Google account')
      browser.wait(EC.visibilityOf(login.resetPassSuccess), 3000, 'saw success message for Google account')
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
})
