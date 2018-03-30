import { browser, by, element, protractor } from 'protractor';

export class Sidebar {

    private EC = protractor.ExpectedConditions; // vital

    // constructor() {}
    /*
    28 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    Page Object for the sidebar on any page.

    - Does not inherit from PageObjectInterface because it's not a page.
    */

    // Public Instance Variables
    public logOutButton     = element(by.css("#logOutButton"));
    public logInButton     = element(by.css("a#loginLink"));
    public avatarActionIcon = element(by.css("#avatarActionIcon"));
    public accountButton    = element(by.id("accountButton"));
    public heatButton       = element(by.id("toggleHeatVision"));
    public heatButtonMobile = element(by.id("toggleHeatVisionMobile"));
    public navReadings = element(by.id("navReadings"));
    public navDiscover = element(by.id("navDiscover"));
    public accountButtonSpan = this.accountButton.element(by.css('span'));
    public logo = element(by.id("logo"));
    public heroLink = element(by.id("heroLink"));
    public ownerToolToggleButton = element(by.id("buttonOwnerToolToggle"));

    public backToDash(): void {
        let modalCloseBtn = element(by.css(".show .modal button.close"));
        modalCloseBtn.isPresent().then((result) => {
            if (result) {
                 modalCloseBtn.isDisplayed().then((result) => {
                    if ( result ) {
                        //Whatever if it is true (displayed)
                        browser.wait(this.EC.elementToBeClickable(modalCloseBtn), 5000, "modal close button never became clickable")
                        modalCloseBtn.click()
                    }
                });
            }
        });
        browser.wait(this.EC.elementToBeClickable(this.logo), 5000, "logo never became clickable")
        this.logo.click()
        browser.wait(this.EC.urlContains("dashboard"), 5000, "never arrived at dashboard after clicking logo")
    }

    public ownerToolToggle(): void {
        browser.wait(this.EC.elementToBeClickable(this.avatarActionIcon), 5000, "avatar dropdown button never became clickable");
        // Toggle the owner tools on mobile if the Owner Tools button is present
        this.ownerToolToggleButton.isPresent().then((result) => {
            if (result) {
                this.ownerToolToggleButton.isDisplayed().then((result) => {
                    if (result) {
                        // Click the Tools button to expand the owner tools options for mobile before proceeding
                        browser.wait(this.EC.elementToBeClickable(this.ownerToolToggleButton), 5000, "never found the owner tool toggle");
                        this.ownerToolToggleButton.click()
                    } 
                });
            }
        });
    }

    // Click the log out button.
    public clickLogOutButton () : void {
        this.avatarActionIcon.isPresent().then((result) => {
            if (result) {
                 this.avatarActionIcon.isDisplayed().then((result) => {
                    if ( result ) {
                        this.avatarActionIcon.click();
                        this.logOutButton.isPresent().then((result) => {
                            if (result) {
                                 this.logOutButton.isDisplayed().then((result) => {
                                    if ( result ) {
                                        this.logOutButton.click();
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    } // clickLogOutButton () : void

    // Click the log out button.
    public clickAccountButton () : void {
        this.avatarActionIcon.isPresent().then((result) => {
            if (result) {
                 this.avatarActionIcon.isDisplayed().then((result) => {
                    if ( result ) {
                        this.avatarActionIcon.click();
                        this.accountButton.isPresent().then((result) => {
                            if (result) {
                                 this.accountButton.isDisplayed().then((result) => {
                                    if ( result ) {
                                        this.accountButton.click();
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    } // clickAccountButton () : void

    public logout(): void {
        browser.wait(this.EC.elementToBeClickable(this.avatarActionIcon), 5000, "avatar action button never became clickable");
        this.clickLogOutButton();
        browser.wait(this.EC.urlContains("home"), 5000, "never arrived home after logging out");
    }

    public clickHeroLink(): void {
        // this.logo.click();
        // browser.wait(this.EC.elementToBeClickable(this.heroLink), 5000, "hero link never became clickable");
        this.heroLink.click();
    }
} // class Sidebar