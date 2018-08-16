import { browser, by, element, protractor } from 'protractor'

// Internal
import { Home, Login, Sidebar, Hero, Dashboard, NewReading } from './page-objects'
import { LoginForm, RegisterForm, UserDetailsModal } from './components'


/**
 * Referral Tests
 * - Users can refer other users, and be rewarded
 */
describe('Referral Sharing and Rewards', () => {
    let login   = new Login()
    let loginForm = new LoginForm()
    let registerForm = new RegisterForm()
    let userDetails = new UserDetailsModal()
    let sidebar = new Sidebar()
    let hero = new Hero()
    let dashboard = new Dashboard()
    let newReading = new NewReading()
    let EC      = protractor.ExpectedConditions

    // Referral specific element references
    let copyReferralLinkBtn = element(by.id("buttonCopyReferralLink"))
    let referalCodeBox = element(by.id("copyReferralCode"))
    let referralClose = element(by.css("#referralModal .close"))
    let referralStamp1 = element(by.id("referralStamp1"))
    let referralStamp2 = element(by.id("referralStamp2"))
    let referralStamp3 = element(by.id("referralStamp3"))
    let referralStamp4 = element(by.id("referralStamp4"))
    let referralStamp5 = element(by.id("referralStamp5"))
    let redeemButton = element(by.id("redeemReferralsButton"))
    let facebookShare = element(by.id("referFacebookShare"))
    let twitterShare = element(by.id("referTwitterShare"))
    let emailShare = element(by.id("referEmailShare"))

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
            // Open Referral Modal
            sidebar.clickReferralButton()
            // Verify we made it there
            browser.wait(EC.elementToBeClickable(copyReferralLinkBtn), 5000, "never saw the referral modal")
            // Get referral link and save it for later
            referalCodeBox.getAttribute('value').then(text => {
                referralLink = text
                console.log("LINK:",referralLink)
                // Verify referral link is longer than just "edji.it"
                expect(referralLink.length).toBeGreaterThan(5)
            })
            // Close referral modal 
            referralClose.click()
        })

        /**
         * Share Referral via:
         * - Facebook
         * - Twitter
         * - Email
         */
        it("should be able to share unique referral link via socials", () => {
            // Open Referral Modal
            sidebar.clickReferralButton()
            // Share on Facebook
            browser.wait(EC.elementToBeClickable(facebookShare), 5000, "never saw Facebook share button")
            facebookShare.click().then(() => {
                browser.getAllWindowHandles().then((handles) => {
                    // Swap to newly opened tab
                    let newWindowHandle = handles[1]
                    browser.switchTo().window(newWindowHandle).then(() => {
                        // Verify share page
                        expect(browser.getCurrentUrl()).toContain("facebook.com")
                    })
                    // Close share tab
                    browser.driver.close()
                    browser.driver.switchTo().window(handles[0])
                })
            })
            // Share on Twitter
            browser.wait(EC.elementToBeClickable(twitterShare), 5000, "never saw Twitter share button")
            twitterShare.click().then(() => {
                browser.getAllWindowHandles().then((handles) => {
                    // Swap to newly opened tab
                    let newWindowHandle = handles[1] 
                    browser.switchTo().window(newWindowHandle).then(() => {
                        // Verify share page
                        expect(browser.getCurrentUrl()).toContain("twitter.com")
                    })
                    // Close share tab
                    browser.driver.close()
                    browser.driver.switchTo().window(handles[0])
                })
            })
            // Close referral modal 
            referralClose.click()
        })

        /**
         * User who has completed 5 referrals should be rewarded
         */
        it("should reward user with 5 or more referrals", () => {
            // Open Referral modal
            sidebar.clickReferralButton()
            // Verify all 5 stamps are showing
            browser.wait(EC.visibilityOf(referralStamp1), 3000, "referral stamp 1 not showing")
            browser.wait(EC.visibilityOf(referralStamp2), 3000, "referral stamp 2 not showing")
            browser.wait(EC.visibilityOf(referralStamp3), 3000, "referral stamp 3 not showing")
            browser.wait(EC.visibilityOf(referralStamp4), 3000, "referral stamp 4 not showing")
            browser.wait(EC.visibilityOf(referralStamp5), 3000, "referral stamp 5 not showing")
            // Begin redeeming reward
            redeemButton.click()
            // Verify Hero subscription modal opened
            browser.wait(EC.visibilityOf(hero.subscribeModal), 5000, "Hero modal didn't show when redeeming reward")
            // Wait for coupon message
            browser.wait(EC.visibilityOf(hero.validCouponMsg), 3000, "discount message never showed")
            // Verify 100% discount applied
            hero.validCouponMsg.getText().then(couponMsg => {
                expect(couponMsg).toContain("100%")
            })
            // Close hero modal
            hero.subscribeModalClose.click()
        })

        /**
         * Referral link should credit registered user as referred
         * - Referral modal will show 20% off
         */
        it("should register with referral link, create reading, and be credited for referral", () => {
            // Log out referral user
            sidebar.clickLogOutButton()
            // Wait for app to refresh after logout
            browser.wait(EC.elementToBeClickable(sidebar.logo), 5000, "app did not finish refreshing within 5 seconds after logout")
            // Open referral link
            browser.get(referralLink)
            // Verify user lands on Registration page
            browser.wait(EC.urlContains("register"), 5000, "referral link never landed on registration page")
            // Attempt registration
            registerForm.submit()
            // Created user should land on Dashboard
            browser.wait(EC.urlContains("dashboard"), 5000, "referred user failed to register")
            // Confirm account type
            userDetails.confirmBot('teacher')
            // Open referrals modal
            sidebar.clickReferralButton()
            // Verify user has not received referral credit
            browser.wait(EC.invisibilityOf(referralStamp1), 3000, "referral stamp should not show for incomplete referral")
            // Close referral modal 
            referralClose.click()
            /**
             * Create New Reading to complete Referral
             */
            dashboard.openNewReading();
            // Enter sample Reading into form
            newReading.titleInput.sendKeys(newReading.titleString);
            // Make private to avoid needing grade levels and subject
            newReading.privateButton.click();
            newReading.contentInput.sendKeys(newReading.contentShortString);
            newReading.sourceInput.sendKeys(newReading.sourceString);
            // Submit New Reading
            newReading.addNewReading()
            // Group Label has content prefilled, so we clear it
            newReading.groupInput.clear();
            newReading.groupInput.sendKeys(newReading.groupString);
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();
            // Should redirect to Project page for new reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");
            // Reset user to dashboard
            sidebar.backToDash();
            /**
             * Verify user was credited for Referral completion
             */
            // Open referrals modal
            sidebar.clickReferralButton()
            browser.wait(EC.visibilityOf(referralStamp1), 3000, "referral stamp not showing for referred user")
            // Make sure the new user didn't get extra credit
            browser.wait(EC.invisibilityOf(referralStamp2), 3000, "extra referral stamp showing for referred user")
            // Close referral modal 
            referralClose.click()
            // Log out new user
            sidebar.clickLogOutButton()
        })
    })

})