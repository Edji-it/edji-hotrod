import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar } from './page-objects'
import { LoginForm } from './components'

/*
    23 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Login Page', () => {

    /* ---- Variable Initialization --------------- */
    const login   = new Login()
    const loginForm = new LoginForm()
    const home    = new Home()
    const sidebar = new Sidebar()
    const EC      = protractor.ExpectedConditions // vital

/* ---- beforeEach ---------------------------- */
    beforeEach (() => {
        login.getPage()
    })


/* ---- Generic Login Tests ---------------------------- */

    // test all the errors
    describe('Login errors', () => {
        loginForm.testLoginErrors()
    })

    describe('Successful login', () => {
        afterEach(() => {
            sidebar.logout()
        })

        it('should login and navigate to the dashboard', () => {
            // log in a user
            loginForm.login()

            // verify that we reach the dashboard after login
            browser.wait(EC.urlContains('dashboard'), 5000, 'never reached the dashboard after loggin in')
        })
    })

}) // describe Login Page
