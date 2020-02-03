import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar, Hero, Dashboard, NewReading, Discover } from './page-objects'
import { LoginForm, RegisterForm, UserDetailsModal } from './components'

describe('Referral', () => {
  let login = new Login()
  let loginForm = new LoginForm()
  let registerForm = new RegisterForm()
  let userDetails = new UserDetailsModal()
  let sidebar = new Sidebar()
  let hero = new Hero()
  let dashboard = new Dashboard()
  let newReading = new NewReading()
  let discover = new Discover()
  let EC = protractor.ExpectedConditions

  let copyReferralLinkBtn = element(by.id('buttonCopylink'))
  let copySuccessMsg = element(by.id('linkCopySuccess'))
  let referalCodeBox = element(by.id('copyShareLink'))
  let referralModal = element(by.id('referralModal'))
  let referralClose = element(by.css('#referralModal .close'))
  let referralStamp1 = element(by.id('referralStamp1'))
  let referralStamp2 = element(by.id('referralStamp2'))
  let referralStamp3 = element(by.id('referralStamp3'))
  let referralStamp4 = element(by.id('referralStamp4'))
  let referralStamp5 = element(by.id('referralStamp5'))
  let redeemButton = element(by.id('redeemReferralsButton'))
  let facebookShare = element(by.id('shareIconFacebook'))
  let twitterShare = element(by.id('shareIconTwitter'))
  let emailShare = element(by.id('shareIconEmail'))

  

  describe('Account Referral Sharing and Rewards', () => {
    beforeAll(() => {
      login.getPage()
      login.loginAndVerify(login.referUser, login.referPassword)
    })
    let referralLink = ''

    it('should access referral modal with code', async () => {
      // Open Referral Modal
      sidebar.clickReferralButton()
      // Verify we made it there
      browser.wait(EC.elementToBeClickable(copyReferralLinkBtn), 5000, 'never saw the referral modal')
      // Get referral link and save it for later
      referralLink = await referalCodeBox.getAttribute('value')
      // Verify referral link is longer than just "edji.it"
      expect(referralLink.length).toBeGreaterThan(5)
      // Verify clicking "Copy" at least shows a success message
      copyReferralLinkBtn.click()
      browser.wait(EC.visibilityOf(copySuccessMsg), 3000, 'clicking to copy referral link did not show success message')
      // Close referral modal
      referralClose.click()
    })

    it('should be able to share unique referral link via socials', async () => {
      // Open Referral Modal
      sidebar.clickReferralButton()
      // Share on Facebook
      browser.wait(EC.elementToBeClickable(facebookShare), 5000, 'never saw Facebook share button')
      const facebookLink = await facebookShare.getAttribute('href')
      expect(facebookLink).toContain('facebook.com')
      // facebookShare.click().then(() => {
      //   browser.getAllWindowHandles().then(handles => {
      //     // Swap to newly opened tab
      //     let newWindowHandle = handles[1]
      //     browser
      //       .switchTo()
      //       .window(newWindowHandle)
      //       .then(() => {
      //         // Verify share page
      //         expect(browser.getCurrentUrl()).toContain('facebook.com')
      //       })
      //     // Close share tab
      //     browser.driver.close()
      //     browser.driver.switchTo().window(handles[0])
      //   })
      // })
      // Share on Twitter
      browser.wait(EC.elementToBeClickable(twitterShare), 5000, 'never saw Twitter share button')
      const twitterLink = await twitterShare.getAttribute('href')
      expect(twitterLink).toContain('twitter.com')
      // twitterShare.click().then(() => {
      //   browser.getAllWindowHandles().then(handles => {
      //     // Swap to newly opened tab
      //     let newWindowHandle = handles[1]
      //     browser
      //       .switchTo()
      //       .window(newWindowHandle)
      //       .then(() => {
      //         // Verify share page
      //         expect(browser.getCurrentUrl()).toContain('twitter.com')
      //       })
      //     // Close share tab
      //     browser.driver.close()
      //     browser.driver.switchTo().window(handles[0])
      //   })
      // })
      // Close referral modal
      referralClose.click()
    })

    it('should reward user with 5 or more referrals', () => {
      // Open Referral modal
      sidebar.clickReferralButton()
      // Verify all 5 stamps are showing
      browser.wait(EC.visibilityOf(referralStamp1), 3000, 'referral stamp 1 not showing')
      browser.wait(EC.visibilityOf(referralStamp2), 3000, 'referral stamp 2 not showing')
      browser.wait(EC.visibilityOf(referralStamp3), 3000, 'referral stamp 3 not showing')
      browser.wait(EC.visibilityOf(referralStamp4), 3000, 'referral stamp 4 not showing')
      browser.wait(EC.visibilityOf(referralStamp5), 3000, 'referral stamp 5 not showing')
      // Begin redeeming reward
      redeemButton.click()
      // sleep() excuse - Wait for animation of Subscription modal
      browser.sleep(400)
      // Verify Hero subscription modal opened
      browser.wait(EC.visibilityOf(hero.subscribeModal), 5000, "Hero modal didn't show when redeeming reward")
      // Wait for coupon message
      browser.wait(EC.visibilityOf(hero.validCouponMsg), 3000, 'discount message never showed')
      // Verify 100% discount applied
      hero.validCouponMsg.getText().then(couponMsg => {
        expect(couponMsg).toContain('100%')
      })
      // Close hero modal
      hero.subscribeModalClose.click()
    })

    it('should register with referral link, create reading, and be credited for referral', () => {
      // Log out referral user
      sidebar.clickLogOutButton()
      // Wait for app to refresh after logout
      browser.wait(
        EC.elementToBeClickable(sidebar.logo),
        5000,
        'app did not finish refreshing within 5 seconds after logout',
      )
      // Open referral link
      browser.get(referralLink)
      // Verify user lands on Registration page
      browser.wait(EC.urlContains('register'), 5000, 'referral link never landed on registration page')
      // Attempt registration
      registerForm.submit('teacher')
      // Created user should land on Dashboard
      browser.wait(EC.urlContains('dashboard'), 5000, 'referred user failed to register')
      // Confirm account type
      userDetails.addDetails()
      // Open referrals modal
      sidebar.clickReferralButton()
      // Verify user has not received referral credit
      browser.wait(EC.invisibilityOf(referralStamp1), 3000, 'referral stamp should not show for incomplete referral')
      // Close referral modal
      referralClose.click()
      /**
       * Create New Reading to complete Referral
       */
      dashboard.openNewReading()
      // Enter sample Reading into form
      newReading.titleInput.sendKeys(newReading.titleString)
      // Make private to avoid needing grade levels and subject
      newReading.privateButton.click()
      newReading.contentInput.sendKeys(newReading.contentShortString)
      newReading.sourceInput.sendKeys(newReading.sourceString)
      // Submit New Reading
      newReading.finalizeAndSkipToReading()
      // Reset user to dashboard
      sidebar.backToDash()
      /**
       * Verify user was credited for Referral completion
       */
      // Open referrals modal
      sidebar.clickReferralButton()
      browser.wait(EC.visibilityOf(referralStamp1), 3000, 'referral stamp not showing for referred user')
      // Make sure the new user didn't get extra credit
      browser.wait(EC.invisibilityOf(referralStamp2), 3000, 'extra referral stamp showing for referred user')
      // Close referral modal
      referralClose.click()
      // Log out new user
      sidebar.clickLogOutButton()
    })
  })
})
