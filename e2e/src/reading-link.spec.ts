import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar, Hero, Dashboard, NewReading, Discover } from './page-objects'

describe('Reading Link', () => {
  let login = new Login()
  let sidebar = new Sidebar()
  let dashboard = new Dashboard()
  let discover = new Discover()
  let EC = protractor.ExpectedConditions

  let copyReferralLinkBtn = element(by.id('buttonCopylink'))
  let copySuccessMsg = element(by.id('linkCopySuccess'))
  let referalCodeBox = element(by.id('copyShareLink'))
  let readingLinkModal = element(by.id('readingLinkModal'))
  let readingLinkModalClose = element(by.css('#readingLinkModal .close'))
  let facebookShare = element(by.id('shareIconFacebook'))
  let twitterShare = element(by.id('shareIconTwitter'))
  let emailShare = element(by.id('shareIconEmail'))

  beforeAll(() => {
    login.getPage()
    login.loginAndVerify(login.heroUser, login.heroPassword)
  })

  afterAll(() => {
    sidebar.logout()
  })

  

  let readingLink = ''
  let titleToShare = ''

  it('should open reading link from created dashboard', async () => {
    dashboard.goToCreatedTab()
    // Click the dropdown menu
    browser.sleep(3000)
    browser.wait(EC.elementToBeClickable(dashboard.firstDropdownMenu), 5000, 'never saw a reading card dropdown menu')
    titleToShare = await dashboard.firstReadingTitle.getText()
    dashboard.firstDropdownMenu.click()
    browser.wait(
      EC.elementToBeClickable(dashboard.readingLinkButton),
      5000,
      'reading link button was never clickable from dropdown menu',
    )
    dashboard.readingLinkButton.click()
    browser.wait(EC.elementToBeClickable(readingLinkModal), 5000, 'share reading link modal was never clickable')
    browser.wait(
      EC.elementToBeClickable(readingLinkModalClose),
      5000,
      'share reading link modal close button was never clickable',
    )
    readingLinkModalClose.click()
  })

  it('should copy reading link from share modal', async () => {
    browser.sleep(3000)
    dashboard.firstDropdownMenu.click()
    browser.wait(
      EC.elementToBeClickable(dashboard.readingLinkButton),
      5000,
      'reading link button was never clickable from dropdown menu',
    )
    dashboard.readingLinkButton.click()
    browser.wait(EC.elementToBeClickable(readingLinkModal), 5000, 'share reading link modal was never clickable')
    browser.wait(EC.elementToBeClickable(copyReferralLinkBtn), 5000, 'never saw the referral modal')
    // Get referral link and save it for later
    readingLink = await referalCodeBox.getAttribute('value')
    // Verify referral link is longer than just "edji.it"
    expect(readingLink.length).toBeGreaterThan(5)
    // Verify clicking "Copy" at least shows a success message
    copyReferralLinkBtn.click()
    browser.wait(EC.visibilityOf(copySuccessMsg), 3000, 'clicking to copy reading link did not show success message')
    browser.wait(
      EC.elementToBeClickable(readingLinkModalClose),
      5000,
      'share reading link modal close button was never clickable',
    )
    readingLinkModalClose.click()
  })

  it('should open reading link without logging in and get a reading preview in discover', async () => {
    sidebar.logout()
    // Open referral link
    browser.get(readingLink)
    // Verify user lands on discover page
    browser.wait(EC.urlContains('discover'), 5000, 'reading link never landed on discover page')
    // verify reading preview modal is open
    browser.wait(EC.visibilityOf(discover.readingPreview), 5000, 'reading preview was not visible')
    let sharedTitle = await discover.previewTitle.getText()
    let sameTitle = discover.validatePreviewTitle(titleToShare, sharedTitle)
    expect(sameTitle).toBeTruthy()
    // verify not logged in
    browser.wait(
      EC.elementToBeClickable(discover.loginFromPreviewBtn),
      5000,
      'login action from reading preview was not clickable',
    )
    discover.closeReadingPreview()
  })

  it('should open reading link as testbot and get a reading preview in discover', async () => {
    // login as testsidekick to try the reading link preview out
    login.getPage()
    login.loginAndVerify(login.teacherUser, login.teacherPassword)
    // Open referral link
    browser.get(readingLink)
    // Verify user lands on discover page
    browser.wait(EC.urlContains('discover'), 5000, 'reading link never landed on discover page')
    // verify reading preview modal is open
    browser.wait(EC.visibilityOf(discover.readingPreview), 5000, 'reading preview was not visible')
    let sharedTitle = await discover.previewTitle.getText()
    let sameTitle = discover.validatePreviewTitle(titleToShare, sharedTitle)
    expect(sameTitle).toBeTruthy()
    // verify logged in actions available on preview
    browser.wait(EC.elementToBeClickable(discover.shareReadingBtn), 5000, 'share reading action was not clickable')
    discover.closeReadingPreview()
  })
})
