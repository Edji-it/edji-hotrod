import { browser, by, element, protractor } from 'protractor'

// Internal
import { Home, Login, Sidebar } from './page-objects'
import { LoginForm } from './components'


/**
 * Referral Tests
 * - Users can refer other users, and be rewarded
 */
describe('Referral Sharing and Rewards', () => {
    let login   = new Login()
    let loginForm = new LoginForm()
    let sidebar = new Sidebar()
    let EC      = protractor.ExpectedConditions

    // Referral specific element references
    let copyReferralLinkBtn = element(by.id("buttonCopyReferralLink"))
    let referalCodeBox = element(by.id("copyReferralCode"))
    let referralClose = element(by.css("#referralModal .close"))

    describe("Test sharing referral code, and referred registration", () => {
        let referralLink = ""
        /**
         * Referral Code
         * - User should be able to open the Referral modal
         * - User should be able to share their referral code
         */
        it("should login and access referral modal with code", () => {
            browser.get('/#/login')
            // Log in as referral user
            loginForm.login(login.referUser, login.referPassword)
            // Verify that we reach the dashboard after login
            browser.wait(EC.urlContains("dashboard"), 5000, "never reached the dashboard after logging in")
            // Navigate to the Hero promo page
            sidebar.clickReferralButton()
            // Verify we made it there
            browser.wait(EC.elementToBeClickable(copyReferralLinkBtn), 5000, "never saw the referral modal")
            // Get referral link and save it for later
            referalCodeBox.getAttribute('value').then(text => {
                referralLink = text
                // Verify referral link is longer than just "edji.it"
                expect(referralLink.length).toBeGreaterThan(5)
            })
            
            describe("Referral modal share and display", () => {
                /**
                 * Share Referral via:
                 * - Facebook
                 * - Twitter
                 * - Email
                 */
                it("should be able to share unique referral link via socials", () => {
                    // element(by.id("referShareFacebook")).click().then(function () {
                    //     browser.getAllWindowHandles().then(function (handles) {
                    //         newWindowHandle = handles[1]; // this is your new window
                    //         browser.switchTo().window(newWindowHandle).then(function () {
                    //             // fill in the form here
                    //             expect(browser.getCurrentUrl()).toMatch(/\/url/);
                    //         });
                    //     });
                    // });
                })
                

                /**
                 * User who has completed 5 referrals should be rewarded
                 */
                it("should reward user with 5 or more referrals", () => {
                    
                })
            })

            // Close referral modal 
            referralClose.click()
            // Log out referral user
            sidebar.clickLogOutButton()
        })

        /**
         * Referral link should credit registered user as referred
         * - Referral modal will show 20% off
         */
        it("should register with referral link, and be credited for referral", () => {
            browser.get(referralLink)
            // Verify user lands on Registration page
            browser.wait(EC.urlContains("register"), 5000, "referral link never landed on registration page")
        })
    })

})