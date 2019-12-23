import { browser, by, element, protractor } from 'protractor'
import { Account, Login } from './page-objects'
import * as path from 'path'
import { Sidebar } from './page-objects/sidebar-page'

describe('Account Page', () => {
  let EC = protractor.ExpectedConditions // vital
  let account = new Account()
  let login = new Login()
  let sidebar = new Sidebar()

  beforeAll(() => {
    login.getPage()
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.enterUsername(login.heroUser)
    login.enterPassword(login.heroPassword)
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.loginButton.click()
    browser.wait(EC.urlContains('dashboard'), 5000, 'never arrived at dashboard')
    sidebar.clickAccountButton()
    browser.wait(EC.urlContains('account'), 5000, 'never arrived at account page')
  })

  afterEach(() => {
    browser
      .manage()
      .logs()
      .get('browser')
      .then(browserLog => {
        if (browserLog.length > 0) {
          browserLog.forEach(log => {
            console.error(log.message)
          })
        }
      })
  })

  describe('Hero Management', () => {
    it('Hero user should see subscription options', () => {
      // make sure there is no avatar
      browser.wait(EC.visibilityOf(account.heroModifyBtn), 5000, 'should see modify subscription button')
    })
  })

  describe('Customize Avatar', () => {
    let emojiSrc: string = ''
    let color: string = ''

    it('should click avatar, make selections, and save', async () => {
      browser.wait(EC.elementToBeClickable(account.avatarEdit), 3000, 'should see avatar circle and click to edit')
      account.avatarEdit.click()
      // Should see editor
      browser.wait(EC.visibilityOf(account.avatarEditor), 3000, 'avatar editor did not open when edit clicked')
      // Pick a color
      let secondColor = account.avatarColorOptions.get(1)
      browser.wait(EC.elementToBeClickable(secondColor), 3000, 'color options did not become clickable')
      secondColor.click()
      color = await secondColor.element(by.css('.spot')).getCssValue('background')
      // Pick an emoji
      account.avatarEmojiTab.click()
      let seventhEmoji = account.avatarEmojiOptions.get(6)
      browser.wait(EC.elementToBeClickable(seventhEmoji), 3000, 'emoji options did not become clickable')
      seventhEmoji.click()
      emojiSrc = await seventhEmoji.element(by.css('img')).getAttribute('src')
      browser.sleep(400)
      // Save choices
      account.avatarSaveBtn.click()
      // Wait for save and close
      browser.wait(EC.invisibilityOf(account.avatarEditor), 3000, 'avatar editor did close when saved')
    })

    it('should verify custom avatar shows on other pages', async () => {
      // Log out and log back in to verify saved
      sidebar.clickLogOutButton()
      login.getPage()
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
      login.enterUsername(login.heroUser)
      login.enterPassword(login.heroPassword)
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
      login.loginButton.click()
      browser.wait(EC.urlContains('dashboard'), 5000, 'never arrived at dashboard')
      // Check avatar
      let navAvatar = element(by.css('.nav-bar .user-icon'))
      expect(await navAvatar.element(by.css('img')).getAttribute('src')).toEqual(
        emojiSrc,
        'custom avatar emoji did not persist/save',
      )
      expect(await navAvatar.getCssValue('background')).toEqual(color, 'custom avatar color did not persist/save')
      // Reset avatar
      sidebar.clickAccountButton()
      browser.wait(EC.urlContains('account'), 5000, 'never arrived at account page')
      browser.wait(EC.elementToBeClickable(account.avatarEdit), 3000, 'should see avatar circle and click to edit')
      account.avatarEdit.click()
      // Should see editor
      browser.wait(EC.visibilityOf(account.avatarEditor), 3000, 'avatar editor did not open when edit clicked')
      // Reset avatar
      account.avatarResetBtn.click()
      account.avatarSaveBtn.click()
    })
  })
}) // describe 'Account Page'
