import { browser, by, element, protractor } from 'protractor'

import { Register } from './page-objects/register-page'

describe('register page', () => {
  const register = new Register()

  beforeEach(() => {
    register.getPage()
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

  describe('google auth', () => {
    it('should log in with Google', () => {})
  })
})
