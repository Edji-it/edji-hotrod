import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class Register implements PageObjectInterface {
  public googleLoginButton = element(by.id('btnGoogleLogIn'))

  // get the login page
  getPage(): void {
    browser.get('/#/register')
  }
}
