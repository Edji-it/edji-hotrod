import { browser, by, element, protractor, ElementFinder } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'
import { Account } from './account-page'

const account = new Account()

export class Hero implements PageObjectInterface {
  private EC = protractor.ExpectedConditions

  // Public Instance Variables
  public CTAbutton = element(by.id('priceCardCTA'))
  public bottomCTAbutton = element(by.id('heroCTA'))
  public subscribeButton = element(by.id('subHero'))
  public subscribeModal = element(by.id('upgradeHeroModal'))
  public subscribeModalHeader = element(by.css('#upgradeHeroModal .modal-header .modal-title'))
  public subscribeModalClose = element(by.css('#upgradeHeroModal .modal-header .close'))
  public couponInput = element(by.id('couponCodeInput'))
  public confirmedHero = element(by.id('confirmedHero'))
  public creditCard = element(by.id('heroCard'))
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
  public edjiCreditCard = '4000000760000002' // Brazil Credit Card
  public edjiCreditExpiry = '0424'
  public edjiCvc = '242'
  public edjiZip = '42424'
  public edjiCreditCard2 = '4012888888881881' // Canada Credit Card
  public edjiCreditExpiry2 = '0424'
  public edjiCvc2 = '242'
  public edjiZip2 = '42424'

  // Stripe iframe inputs
  public creditCardInput = element(by.css('input[name="cardnumber"]'))
  public creditCardExpiry = element(by.css('input[name="exp-date"]'))
  public creditCardCvc = element(by.css('input[name="cvc"]'))
  public creditCardZip = element(by.css('input[name="postal"]'))

  // get the home page
  getPage(): void {
    browser.get('/#/hero')
  }

  public openHeroModalViaCTA() {
    browser.wait(this.EC.elementToBeClickable(this.CTAbutton), 3000, 'never saw Hero call to action button')
    browser.executeScript('document.getElementById("priceCardCTA").scrollIntoView({block:"center"});')
    this.CTAbutton.click()
    // Wait for modal animation
    browser.sleep(500)
    // Verify modal popped up
    browser.wait(this.EC.elementToBeClickable(this.subscribeModalHeader), 3000, 'never saw Hero subscription modal')
  }

  /**
   * Utility method for switching to the stripe iframe field and putting credit card info in
   * Requires no inputs
   */
  public async enterCreditCardAndSubmit(altCard?: boolean): Promise<void> {
    let edjiCreditCard = this.edjiCreditCard
    let edjiCreditExpiry = this.edjiCreditExpiry
    let edjiCvc = this.edjiCvc
    let edjiZip = this.edjiZip
    if (altCard) {
      edjiCreditCard = this.edjiCreditCard2
      edjiCreditExpiry = this.edjiCreditExpiry2
      edjiCvc = this.edjiCvc2
      edjiZip = this.edjiZip2
    }
    // switch to the stripe iframe selectors
    var driver = browser.driver
    var loc = by.css('#card-element iframe')
    // Wait for Stripe form to definitely be available
    // *note* CircleCI will not have a cached version of the Stripe script
    browser.wait(this.EC.presenceOf(element(loc)), 6000, 'Stripe iframe did not become available to enter credit card')
    var el = driver.findElement(loc)
    browser.switchTo().frame(el)

    // input the test credit card info
    browser.sleep(1000)
    browser.wait(this.EC.elementToBeClickable(this.creditCardInput), 5000, 'credit card number field was not clickable')
    // Click field to ensure form updates
    this.creditCardInput.click()
    // this.creditCardInput.sendKeys(edjiCreditCard)
    await browser.executeScript(`document.querySelector('input[name="cardnumber"]').value = '${edjiCreditCard}'`)
    // Credit Card Expiration Details
    browser.wait(
      this.EC.elementToBeClickable(this.creditCardExpiry),
      5000,
      'credit card expiry field was not clickable',
    )
    // Click field to ensure form updates
    this.creditCardExpiry.click()
    browser.sleep(1000)
    // this.creditCardExpiry.sendKeys(edjiCreditExpiry)
    await browser.executeScript(`document.querySelector('input[name="exp-date"]').value = '${edjiCreditExpiry}'`)
    // Credit Card CVC Details
    browser.wait(this.EC.elementToBeClickable(this.creditCardCvc), 5000, 'credit card cvc field was not clickable')
    // Click field to ensure form updates
    this.creditCardCvc.click()
    // this.creditCardCvc.sendKeys(edjiCvc)
    await browser.executeScript(`document.querySelector('input[name="cvc"]').value = '${edjiCvc}'`)

    // switch back to our main content
    browser.switchTo().defaultContent()
    // Submit form
    if (altCard) {
      browser.wait(
        this.EC.visibilityOf(account.pmtChange),
        5000,
        'should see update my card button when updating credit card',
      )
      account.pmtChange.click()
      // payment success alert
      browser.wait(
        this.EC.visibilityOf(account.pmtChangedAlert),
        5000,
        'should see success alert after updating credit card',
      )
      account.pmtChangedAlert.click()
      // Go back to default modal view of subscription details
      account.pmtMethodCancel.click()
    } else {
      browser.wait(this.EC.elementToBeClickable(this.subscribeButton), 6000, 'never saw Hero subscribe button')
      this.subscribeButton.click()
    }
    // Verify we do not see Stripe entry form errors (useful to know when debugging)
    browser.sleep(2000) // In an ideal world this sleep should be drastically reduced
  }
}
