import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar } from './page-objects'
import { LoginModal } from './components'
import { Home } from './page-objects/home-page'

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the Project page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Project Page as a Project Owner: ', () => {

    /* ---- Variable Initialization --------------- */
    const project = new Project()
    const loginModal = new LoginModal()
    const sidebar = new Sidebar()
    const home = new Home()
    const EC      = protractor.ExpectedConditions // vital

    /* ---- beforeEach ---------------------------- */

    beforeEach(() => {
        // Id for Owner Tools Test Reading owned by Teach/Teach
        browser.get('/#/home')
        // Open Test project
        home.enterProjectCodeFromHome('test')
    })

    afterEach(() => {
        // log out
        sidebar.logout()
    })

    /* ---- Project Tests ------------------------- */

    it('should toggle on Heat Vision as Project Owner', () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, 'never saw the login modal\'s header')
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy()
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy()

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000, 'never found button to go to account login')
        loginModal.gotoAccountLoginButton.click()
        expect(loginModal.accountLoginHeader.isPresent()).toBeTruthy()
        loginModal.usernameInput.sendKeys('testsidekick')
        loginModal.passwordInput.sendKeys('testsidekick16')
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000, 'never found the account login button on modal')

        loginModal.accountLoginButton.submit()

        // Need to check for and click the owner tools button if its showing
        sidebar.ownerToolToggle()

        // Desktop Heat Vision Button toggle
        sidebar.heatButton.isPresent().then((result) => {
            if (result) {
                sidebar.heatButton.isDisplayed().then((result) => {
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
        sidebar.heatButtonMobile.isPresent().then((result) => {
            if (result) {
                sidebar.heatButtonMobile.isDisplayed().then((result) => {
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

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */
    it('show other user\'s comment to guest while Heat Vision is on', () => {
        // logging in
        browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, 'never saw a guest name input box')
        loginModal.guestNameInput.sendKeys('Hot Commenter')
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, 'never found the guest login button')
        loginModal.guestLoginButton.click()


        // Make sure the comment was created
        const comments = element.all(by.css('edji-comment:not(.hidden):not(.spec-owner)'))
        browser.wait(EC.elementToBeClickable(comments.first()), 5000, 'never found the added comment')
        expect(comments.count()).toBeGreaterThan(0)
    })

    it('should toggle off Heat Vision as Project Owner', () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, 'never saw the login modal\'s header')
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy()
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy()

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000, 'never found button to go to account login')
        loginModal.gotoAccountLoginButton.click()
        expect(loginModal.accountLoginHeader.isPresent()).toBeTruthy()
        loginModal.usernameInput.sendKeys('testsidekick')
        loginModal.passwordInput.sendKeys('testsidekick16')
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000, 'never found the account login button on modal')

        loginModal.accountLoginButton.submit()

        // Need to check for and click the owner tools button if its showing
        sidebar.ownerToolToggle()

        // Desktop Heat Vision Button toggle
        sidebar.heatButton.isPresent().then((result) => {
            if (result) {
                sidebar.heatButton.isDisplayed().then((result) => {
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
        sidebar.heatButtonMobile.isPresent().then((result) => {
            if (result) {
                sidebar.heatButtonMobile.isDisplayed().then((result) => {
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

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */
    it('hide other user\'s comments to guest while Heat Vision is on', () => {
        // logging in
        browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, 'never saw a guest name input box')
        loginModal.guestNameInput.sendKeys('Not Hot Commenter')
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, 'never found the guest login button')
        loginModal.guestLoginButton.click()


        // Make sure the comment was created
        const comments = element.all(by.css('edji-comment:not(.hidden):not(.spec-owner)'))
            .count()
            .then((count) => {
                expect(count).toBe(0)
            })
    })

}) // describe 'Dashboard Page'

