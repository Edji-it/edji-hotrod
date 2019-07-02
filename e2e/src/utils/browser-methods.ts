import { browser } from 'protractor'

export const reset = () => {
  browser.sleep(50)
  browser.get('/#/reset-route')
  browser.sleep(50)
}
