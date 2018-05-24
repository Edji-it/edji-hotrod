import { browser, by, element, protractor } from 'protractor';

import { Home, Hero, Login, Sidebar } from './page-objects';
import { LoginForm } from './components';


// Now into the testing.
describe('Hero Subscription Management', () => {

    /* ---- Variable Initialization --------------- */
    let login   = new Login();
    let loginForm = new LoginForm();
    let hero = new Hero();
    let home    = new Home();
    let sidebar = new Sidebar();
    let EC      = protractor.ExpectedConditions; // vital
    
    afterAll (() => {
        sidebar.logout();
    });


/* ---- Generic Login Tests ---------------------------- */

    describe("Test Hero subscription modal as a Sidekick", () => {
        it("should login and navigate to the hero subscription page", () => {
            browser.get('/#/login');
            // log in a user
            loginForm.login();
            // verify that we reach the dashboard after login
            browser.wait(EC.urlContains("dashboard"), 5000, "never reached the dashboard after loggin in");
            // Navigate to the Hero promo page
            sidebar.clickHeroLink();
            // Verify we made it there
            browser.wait(EC.urlContains("hero"), 5000, "never reached the Hero promo page");
        });

        it("should open the Hero subscription modal", () => {
            browser.wait(EC.elementToBeClickable(hero.CTAbutton), 3000, "never saw Hero call to action button");
            hero.CTAbutton.click();
            // Verify modal popped up
            browser.wait(EC.elementToBeClickable(hero.subscribeModalHeader), 3000, "never saw Hero subscription modal");
        });

        it("should test coupon code validation", () => {
            // Valid coupon
            browser.wait(EC.elementToBeClickable(hero.couponInput), 3000)
            hero.couponInput.sendKeys(hero.validCoupon)
            browser.wait(EC.presenceOf(hero.validCouponMsg), 5000, "never saw valid coupon success message")
            // Academy coupon
            hero.couponInput.clear()
            hero.couponInput.sendKeys(hero.academyCoupon)
            browser.wait(EC.presenceOf(hero.academyCouponMsg), 5000, "never saw academy coupon success message")
            // Invalid coupon
            hero.couponInput.clear()
            hero.couponInput.sendKeys(hero.invalidCoupon)
            hero.subscribeButton.click() // blur field
            browser.wait(EC.presenceOf(hero.invalidCouponMsg), 5000, "never saw invalid coupon message")
            // Close subscription modal
            hero.subscribeModalClose.click()
        })
    });

}); // describe Login Page