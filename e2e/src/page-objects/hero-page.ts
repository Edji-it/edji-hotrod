import { browser, by, element, protractor, ElementFinder } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class Hero implements PageObjectInterface {
  private EC = protractor.ExpectedConditions

  // Public Instance Variables
  public topCTAbutton = element(by.id('topHeroCTA'))
  public CTAbutton = element(by.id('heroCTA'))
  public subscribeButton = element(by.id('subHero'))
  public subscribeModal = element(by.id('upgradeHeroModal'))
  public subscribeModalHeader = element(by.css('#upgradeHeroModal .modal-header .modal-title'))
  public subscribeModalClose = element(by.css('#upgradeHeroModal .modal-header .close'))
  public couponInput = element(by.id('couponCodeInput'))
  public confirmedHero = element(by.id('confirmedHero'))
  // Validation messages
  public validCouponMsg = element(by.id('validCouponMsg'))
  public invalidCouponMsg = element(by.id('invalidCouponMsg'))
  public academyCouponMsg = element(by.id('academyCouponMsg'))
  // Coupon codes
  public validCoupon = 'TEST50'
  public validCouponHundred = 'TEST100'
  public invalidCoupon = 'FAKE_COUPON'
  public academyCoupon = 'HA-TEST100'

  // Stripe references
  public creditCardElement = element(by.id('card-element'))
  // public edjiCreditCard = '4242 4242 4242 4242 424 242 42424'
  public edjiCreditCard = '4242424242424242'
  public edjiCreditExpiry = '0424'
  public edjiCvc = '242'
  public edjiZip = '42424'

  // Stripe iframe inputs
  public creditCardInput = element(by.xpath('//input[contains(@name, "cardnumber")]'))
  public creditCardExpiry = element(by.xpath('//input[contains(@name, "exp-date")]'))
  public creditCardCvc = element(by.xpath('//input[contains(@name, "cvc")]'))
  public creditCardZip = element(by.xpath('//input[contains(@name, "postal")]'))

  // get the home page
  getPage(): void {
    browser.get('/#/hero')
  }

  /**
   * Utility method for switching to the stripe iframe field and putting credit card info in
   * Requires no inputs
   */
  public enterCreditCardInfo(): void {
    // switch to the stripe iframe selectors
    var driver = browser.driver
    var loc = by.css('#card-element iframe')
    var el = driver.findElement(loc)
    browser.switchTo().frame(el)

    // input the test credit card info
    browser.wait(this.EC.elementToBeClickable(this.creditCardInput), 3000, 'credit card number field was not clickable')
    this.creditCardInput.sendKeys(this.edjiCreditCard)
    browser.wait(this.EC.elementToBeClickable(this.creditCardExpiry), 3000, 'credit card expiry field was not clickable')
    this.creditCardExpiry.sendKeys(this.edjiCreditExpiry)
    browser.wait(this.EC.elementToBeClickable(this.creditCardCvc), 3000, 'credit card cvc field was not clickable')
    this.creditCardCvc.sendKeys(this.edjiCvc)
    browser.wait(this.EC.elementToBeClickable(this.creditCardZip), 3000, 'credit card zip field was not clickable')
    this.creditCardZip.sendKeys(this.edjiZip)

    // switch back to our main content
    browser.switchTo().defaultContent()
    // browser.waitForAngular()
  }
}