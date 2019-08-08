import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal } from './components'
import { Home } from './page-objects/home-page'

describe('Project Page as a Project Owner: ', () => {
  let project = new Project()
  let loginModal = new LoginModal()
  let login = new Login()
  let sidebar = new Sidebar()
  let home = new Home()
  let EC = protractor.ExpectedConditions

  beforeEach(() => {
    browser.get('/#/home')
    home.enterProjectCodeFromHome('test')
  })

  afterEach(() => {
    sidebar.logout()
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

  it('should toggle on Heat Vision as Project Owner', () => {
    browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header")
    expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy()
    expect(loginModal.clickawaySquare.isPresent()).toBeFalsy()

    // switch to login section and validate
    browser.wait(
      EC.elementToBeClickable(loginModal.gotoAccountLoginButton),
      5000,
      'never found button to go to account login',
    )
    loginModal.gotoAccountLoginButton.click()
    expect(loginModal.clickawaySquare.isPresent()).toBeTruthy()
    loginModal.usernameInput.sendKeys(login.heroUser)
    loginModal.passwordInput.sendKeys(login.heroPassword)
    browser.wait(
      EC.elementToBeClickable(loginModal.accountLoginButton),
      5000,
      'never found the account login button on modal',
    )

    loginModal.accountLoginButton.submit()

    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()

    /**
     * @todo this test will pass if no heat vision button is found
     */
    // Desktop Heat Vision Button toggle
    sidebar.heatButton.isPresent().then(result => {
      if (result) {
        sidebar.heatButton.isDisplayed().then(result => {
          if (result) {
            browser.wait(EC.elementToBeClickable(sidebar.heatButton), 5000, 'never found the heat vision button')

            // Conditionally toggle the Heat Vision to make Active
            sidebar.heatButton.getAttribute('class').then(classes => {
              if (classes.indexOf('inactive') > 0) {
                sidebar.heatButton.click()
              }
            })

            browser.sleep(2000)
            expect(sidebar.heatButton.getAttribute('class')).toContain('active')
          }
        })
      }
    })

    // Mobile Heat Vision button toggle
    sidebar.heatButtonMobile.isPresent().then(result => {
      if (result) {
        sidebar.heatButtonMobile.isDisplayed().then(result => {
          if (result) {
            browser.wait(EC.elementToBeClickable(sidebar.heatButtonMobile), 5000, 'never found the heat vision button')

            // Conditionally toggle the Heat Vision to make Active
            sidebar.heatButtonMobile.getAttribute('class').then(classes => {
              if (classes.indexOf('inactive') > 0) {
                sidebar.heatButtonMobile.click()
              }
            })

            browser.sleep(2000)
            expect(sidebar.heatButtonMobile.getAttribute('class')).toContain('active')
          }
        })
      }
    })
  })

  it("show other user's comment to guest while Heat Vision is on", () => {
    browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, 'never saw a guest name input box')
    loginModal.guestNameInput.sendKeys('Hot Commenter')
    browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, 'never found the guest login button')
    loginModal.guestLoginButton.click()

    // Make sure the comment was created
    let comments = element.all(by.css('edji-comment:not(.hidden):not(.spec-owner)'))
    browser.wait(EC.elementToBeClickable(comments.first()), 5000, 'never found the added comment')
    expect(comments.count()).toBeGreaterThan(0)
  })

  it('should toggle off Heat Vision as Project Owner', () => {
    browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header")
    expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy()
    expect(loginModal.clickawaySquare.isPresent()).toBeFalsy()

    // switch to login section and validate
    browser.wait(
      EC.elementToBeClickable(loginModal.gotoAccountLoginButton),
      5000,
      'never found button to go to account login',
    )
    loginModal.gotoAccountLoginButton.click()
    expect(loginModal.clickawaySquare.isPresent()).toBeTruthy()
    loginModal.usernameInput.sendKeys(login.heroUser)
    loginModal.passwordInput.sendKeys(login.heroPassword)
    browser.wait(
      EC.elementToBeClickable(loginModal.accountLoginButton),
      5000,
      'never found the account login button on modal',
    )

    loginModal.accountLoginButton.submit()

    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()

    // Desktop Heat Vision Button toggle
    sidebar.heatButton.isPresent().then(result => {
      if (result) {
        sidebar.heatButton.isDisplayed().then(result => {
          if (result) {
            browser.wait(EC.elementToBeClickable(sidebar.heatButton), 5000, 'never found the heat vision button')

            // Conditionally toggle the Heat Vision to make Active
            sidebar.heatButton.getAttribute('class').then(classes => {
              if (classes.indexOf('inactive') < 1) {
                sidebar.heatButton.click()
              }
            })

            browser.sleep(2000)
            expect(sidebar.heatButton.getAttribute('class')).toContain('inactive')
          }
        })
      }
    })

    // Mobile Heat Vision button toggle
    sidebar.heatButtonMobile.isPresent().then(result => {
      if (result) {
        sidebar.heatButtonMobile.isDisplayed().then(result => {
          if (result) {
            browser.wait(EC.elementToBeClickable(sidebar.heatButtonMobile), 5000, 'never found the heat vision button')

            // Conditionally toggle the Heat Vision to make Active
            sidebar.heatButtonMobile.getAttribute('class').then(classes => {
              if (classes.indexOf('inactive') < 1) {
                sidebar.heatButtonMobile.click()
              }
            })

            browser.sleep(2000)
            expect(sidebar.heatButtonMobile.getAttribute('class')).toContain('inactive')
          }
        })
      }
    })
  })

  it("hide other user's comments to guest while Heat Vision is on", () => {
    // logging in
    browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, 'never saw a guest name input box')
    loginModal.guestNameInput.sendKeys('Not Hot Commenter')
    browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, 'never found the guest login button')
    loginModal.guestLoginButton.click()

    // Make sure the comment was created
    let comments = element
      .all(by.css('edji-comment:not(.hidden):not(.spec-owner)'))
      .count()
      .then(count => {
        expect(count).toBe(0)
      })
  })
})
