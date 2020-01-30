import { browser, by, element, protractor } from 'protractor'

import { Register } from './page-objects/register-page'

describe('register page', () => {
  const register = new Register()

  beforeEach(() => {
    register.getPage()
  })

  

  describe('google auth', () => {
    it('should log in with Google', () => {})
  })
})
