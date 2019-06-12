import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class Hero implements PageObjectInterface {
  // Public Instance Variables
  public topCTAbutton = element(by.id('topHeroCTA'))
  public CTAbutton = element(by.id('heroCTA'))
  public subscribeButton = element(by.id('subHero'))
  public subscribeModal = element(by.id('upgradeHeroModal'))
  public subscribeModalHeader = element(by.css('#upgradeHeroModal .modal-header .modal-title'))
  public subscribeModalClose = element(by.css('#upgradeHeroModal .modal-header .close'))
  public couponInput = element(by.id('couponCodeInput'))
  // Validation messages
  public validCouponMsg = element(by.id('validCouponMsg'))
  public invalidCouponMsg = element(by.id('invalidCouponMsg'))
  public academyCouponMsg = element(by.id('academyCouponMsg'))
  // Coupon codes
  public validCoupon = 'TEST50'
  public validCouponHundred = 'TEST100'
  public invalidCoupon = 'FAKE_COUPON'
  public academyCoupon = 'HA-TEST100'

  // get the home page
  getPage(): void {
    browser.get('/#/hero')
  } // getPage() : void
} // class Home
