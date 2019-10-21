import { browser, protractor } from 'protractor'

import { Hero, Sidebar, Register, Account } from './page-objects'
import { LoginForm, RegisterForm, UserDetailsModal } from './components'

let loginForm = new LoginForm()
let hero = new Hero()
let sidebar = new Sidebar()
let userDetails = new UserDetailsModal()
let EC = protractor.ExpectedConditions
let registerForm = new RegisterForm()
const register = new Register()
const account = new Account()

const registerAndConfirm = (): void => {
  register.getPage()
  // Verify user lands on Registration page
  browser.wait(EC.urlContains('register'), 5000, 'referral link never landed on registration page')
  // Attempt registration
  registerForm.submit('teacher')
  // Created user should land on Dashboard
  browser.wait(EC.urlContains('dashboard'), 5000, 'referred user failed to register')
  // Confirm account type
  userDetails.addDetails()
}

const logout = (): void => {
  // Log out referral user
  sidebar.clickLogOutButton()
  // Wait for app to refresh after logout
  browser.wait(
    EC.elementToBeClickable(sidebar.logo),
    5000,
    'app did not finish refreshing within 5 seconds after logout',
  )
}

const createAccountAndSubscribeHero = (): void => {
  registerAndConfirm()
  // Navigate to the Hero promo page
  sidebar.clickHeroLink()
  // Verify we made it there
  browser.wait(EC.urlContains('plans'), 5000, 'never reached the Hero promo page')
  hero.openHeroModalViaCTA()
  hero.enterCreditCardAndSubmit()

  // wait for awesome button (means we just became a hero), then click it
  browser.wait(EC.elementToBeClickable(hero.confirmedHero), 10000, 'never saw Awesome button') // requires a long wait, since we have to wait for stripe and optimus
  hero.confirmedHero.click()
}

describe('Hero Subscription Management', () => {
  afterEach(() => {
    browser
      .manage()
      .logs()
      .get('browser')
      .then(browserLog => {
        if (browserLog.length > 0) {
          browserLog.forEach(log => {
            // console.error(log.message)
          })
        }
      })
  })

  describe('Subscribe to Hero', () => {
    afterEach(() => {
      logout()
    })

    it('should subscribe to hero with no discount', () => {
      createAccountAndSubscribeHero()
    })

    it('should subscribe to hero with a partial discount', () => {
      registerAndConfirm()
      // Navigate to the Hero promo page
      sidebar.clickHeroLink()
      // Verify we made it there
      browser.wait(EC.urlContains('plans'), 5000, 'never reached the Hero promo page')
      // Open Hero Modal
      hero.openHeroModalViaCTA()
      // Valid coupon - 50% off
      browser.wait(EC.elementToBeClickable(hero.couponInput), 3000)
      hero.couponInput.sendKeys(hero.validCoupon)
      // Blur field
      hero.couponInput.sendKeys(protractor.Key.TAB)
      browser.wait(EC.presenceOf(hero.validCouponMsg), 5000, 'never saw valid coupon success message')

      hero.enterCreditCardAndSubmit()

      // wait for awesome button (means we just became a hero), then click it
      browser.wait(EC.elementToBeClickable(hero.confirmedHero), 10000, 'never saw Awesome button') // requires a long wait, since we have to wait for stripe and optimus
      hero.confirmedHero.click()
    })

    it('should subscribe to hero with a 100% discount', () => {
      registerAndConfirm()
      // Navigate to the Hero promo page
      sidebar.clickHeroLink()
      // Verify we made it there
      browser.wait(EC.urlContains('plans'), 5000, 'never reached the Hero promo page')
      // Open Hero Modal
      hero.openHeroModalViaCTA()
      // Valid coupon - 100% off
      browser.wait(EC.elementToBeClickable(hero.couponInput), 3000)
      hero.couponInput.sendKeys(hero.validCouponHundred)
      // Blur field
      hero.couponInput.sendKeys(protractor.Key.TAB)
      browser.wait(EC.presenceOf(hero.validCouponMsg), 5000, 'never saw valid coupon success message')

      browser.wait(EC.elementToBeClickable(hero.subscribeButton), 3000, 'never saw Hero subscribe button')
      hero.subscribeButton.click()

      // wait for awesome button (means we just became a hero), then click it
      browser.wait(EC.elementToBeClickable(hero.confirmedHero), 10000, 'never saw Awesome button')
      hero.confirmedHero.click()
    })
  })

  describe('Test Hero subscription modal coupon codes', () => {
    afterAll(() => {
      sidebar.logout()
    })

    it('should login and navigate to the hero subscription page', () => {
      browser.get('/#/login')
      // log in a user
      loginForm.login()
      // verify that we reach the dashboard after login
      browser.wait(EC.urlContains('dashboard'), 5000, 'never reached the dashboard after loggin in')
      // Navigate to the Hero promo page
      sidebar.clickHeroLink()
      // Verify we made it there
      browser.wait(EC.urlContains('plans'), 5000, 'never reached the Hero promo page')
    })

    it('should test coupon code validation', () => {
      // Open Hero Modal
      hero.openHeroModalViaCTA()
      // Valid coupon
      browser.wait(EC.elementToBeClickable(hero.couponInput), 3000)
      hero.couponInput.sendKeys(hero.validCoupon)
      // Blur field
      hero.couponInput.sendKeys(protractor.Key.TAB)
      browser.wait(EC.presenceOf(hero.validCouponMsg), 5000, 'never saw valid coupon success message')
      // Academy coupon
      hero.couponInput.clear()
      hero.couponInput.sendKeys(hero.academyCoupon)
      // Blur field
      hero.couponInput.sendKeys(protractor.Key.TAB)
      browser.wait(EC.presenceOf(hero.academyCouponMsg), 5000, 'never saw academy coupon success message')
      // Invalid coupon
      hero.couponInput.clear()
      hero.couponInput.sendKeys(hero.invalidCoupon)
      // Blur field
      hero.subscribeButton.click()
      browser.wait(EC.presenceOf(hero.invalidCouponMsg), 5000, 'never saw invalid coupon message')
      // Close subscription modal
      hero.subscribeModalClose.click()
    })
  })

  describe('Change Credit Card Number for Subscribed Hero', () => {
    afterAll(() => {
      sidebar.logout()
    })

    it('should open view/modify modal on account page and change credit card', async () => {
      // Helper method to create an account and subscribe to hero
      createAccountAndSubscribeHero()
      // Go to Profile Page
      sidebar.clickAccountButton()
      // Open Hero Subscription details modal
      browser.wait(EC.elementToBeClickable(account.heroModifyBtn), 5000, 'should see modify subscription button')
      account.heroModifyBtn.click()
      // Get payment method to compare later
      let currentPayment = await hero.creditCard.getText()
      // Open Change Payment Method form
      browser.wait(EC.elementToBeClickable(account.heroChangeCC), 5000, 'should see update credit card button')
      account.heroChangeCC.click()
      // Update card to new value
      hero.enterCreditCardAndSubmit(true)
      browser.wait(
        EC.elementToBeClickable(account.heroChangeCC),
        5000,
        'should see update credit card button after updating credit card',
      )
      // Validate Credit Card has changed
      let newPayment = await hero.creditCard.getText()
      let comparePayments = currentPayment === newPayment
      expect(comparePayments).toBeFalsy()
    })
  })

  describe('Cancel Subscription and Renew', () => {
    afterAll(() => {
      sidebar.logout()
    })

    it('should cancel hero subscription', () => {
      // Helper method to create an account and subscribe to hero
      createAccountAndSubscribeHero()
      // Go to Profile Page
      sidebar.clickAccountButton()
      // Open Hero Subscription details modal
      browser.wait(EC.elementToBeClickable(account.heroModifyBtn), 5000, 'should see modify subscription button')
      account.heroModifyBtn.click()
      // Cancel the subscription
      browser.wait(EC.elementToBeClickable(account.subHeroCancel), 5000, 'should see cancel subscription button')
      account.subHeroCancel.click()
      // Confirm cancel
      browser.wait(
        EC.elementToBeClickable(account.subHeroCancelConfirm),
        5000,
        'should see confirm cancel subscription button',
      )
      account.subHeroCancelConfirm.click()
      // Check for canceled confirmation message
      browser.wait(EC.elementToBeClickable(account.subCanceled), 5000, 'should see subscription canceled message')
      // Close the modal
      browser.wait(EC.elementToBeClickable(account.subClose), 5000, 'should see close modal button')
      account.subClose.click()
    })

    it('should renew hero subscription that was previously canceled', () => {
      // Click renew sub button
      browser.wait(EC.elementToBeClickable(account.heroResubscribeBtn), 5000, 'should see renew subscription button')
      account.heroResubscribeBtn.click()
      // Click resubscribe button
      browser.wait(EC.elementToBeClickable(account.subHero), 5000, 'should see resubscribe to hero button')
      account.subHero.click()

      // wait for awesome button (means we just became a hero), then click it
      browser.wait(EC.elementToBeClickable(hero.confirmedHero), 5000, 'never saw Awesome button')
    })
  })
})
