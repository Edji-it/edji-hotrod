import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar } from './page-objects'
import { LoginModal } from './components'

describe('Home Page', () => {
  let home = new Home()
  let EC = protractor.ExpectedConditions

  

  it('it should see Edji in the title', async () => {
    home.getPage()
    let result = await browser.getTitle()
    browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".')
  })

  it('login button should bring you to the login page.', () => {
    browser.wait(EC.elementToBeClickable(home.loginLink), 5000, 'login button was not clickable')
    home.clickLogin()
    browser.wait(EC.urlContains('login'), 5000, 'Never arrived at the url containing: login.')
  })

  it('user should be able to go to the EDJI twitter page', () => {
    browser.wait(EC.elementToBeClickable(home.footerTwitterLink), 5000, 'twitter footer link was not clickable')
    // Verify where link points
    expect(home.footerTwitterLink.getAttribute('href')).toContain('twitter')
  })

  it('user should be able to go to the EDJI Terms page', () => {
    browser.wait(EC.elementToBeClickable(home.footerTermsLink), 5000, 'footer terms link was not clickable')
    // Verify where link points
    expect(home.footerTermsLink.getAttribute('href')).toContain('terms')
  })
})
