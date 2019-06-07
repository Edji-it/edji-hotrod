import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar } from './page-objects'
import { LoginModal } from './components'

describe('Home Page', () => {
  let home = new Home()
  let login = new Login()
  let sidebar = new Sidebar()
  let loginModal = new LoginModal()
  let EC = protractor.ExpectedConditions

  afterEach(() => {
    browser.manage().logs().get('browser').then(browserLog => {
      if (browserLog.length > 0) {
        browserLog.forEach(log => {
          console.error(log.message)
        })
      }
    })
  })

  it('login button should bring you to the login page.', () => {
    browser.wait(EC.elementToBeClickable(home.loginLink), 5000)
    home.clickLogin()
    browser.wait(EC.urlContains('login'), 5000, 'Never arrived at the url containing: login.')
  })

  it('user should be able to go to the EDJI twitter page', () => {
    browser.wait(EC.elementToBeClickable(home.footerTwitterLink), 5000)
    // Verify where link points
    expect(home.footerTwitterLink.getAttribute('href')).toContain('twitter')
  })

  it('user should be able to go to the EDJI Terms page', () => {
    browser.wait(EC.elementToBeClickable(home.footerTermsLink), 5000)
    // Verify where link points
    expect(home.footerTermsLink.getAttribute('href')).toContain('terms')
  })
})