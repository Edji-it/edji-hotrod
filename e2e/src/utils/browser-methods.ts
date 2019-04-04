import { browser } from 'protractor'

export const reset = () => {
  browser.get('/#/reset-route')
}