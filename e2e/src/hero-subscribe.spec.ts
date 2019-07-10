import { browser, protractor } from 'protractor'

import { Hero, Sidebar } from './page-objects'
import { LoginForm, RegisterForm, UserDetailsModal } from './components'

describe('Hero Subscription Management', () => {
  let loginForm = new LoginForm()
  let hero = new Hero()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions

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

  describe('Subscribe to Hero', () => {
    let registerForm = new RegisterForm()

    afterEach(() => {
      sidebar.logout()
    })

    it('should subscribe to hero with no discount', () => {
      registerForm.registerAndConfirm()
      // Navigate to the Hero promo page
      sidebar.clickHeroLink()
      // Verify we made it there
      browser.wait(EC.urlContains('plans'), 5000, 'never reached the Hero promo page')
      hero.openHeroModalViaCTA()
      hero.enterCreditCardAndSubmit()

      // wait for awesome button (means we just became a hero), then click it
      browser.wait(EC.elementToBeClickable(hero.confirmedHero), 10000, 'never saw Awesome button') // requires a long wait, since we have to wait for stripe and optimus
      hero.confirmedHero.click()
    })

    it('should subscribe to hero with a partial discount', () => {
      registerForm.registerAndConfirm()
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
      registerForm.registerAndConfirm()
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
})
