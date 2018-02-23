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
    public logOutButton     = element(by.css("a#logOutButton"));
    public accountButton    = element(by.id("accountButton"));
    public heatButton       = element(by.id("toggleHeatVision"));
    public accountButtonSpan = this.accountButton.element(by.css('span'));
    public logo = element(by.id("logo"));

    public backToDash(): void {
        let modalCloseBtn = element(by.css(".modal button.close"));
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

    // Click the log out button.
    public clickLogOutButton () : void
    {
        this.logOutButton.click();
    } // clickLogOutButton () : void

    // Click the log out button.
    public clickAccountButton () : void
    {
        this.accountButton.click();
    } // clickAccountButton () : void

    public logout(): void {
        browser.wait(this.EC.elementToBeClickable(this.logOutButton), 5000, "logout button never became clickable");
        this.logOutButton.click();
        browser.wait(this.EC.urlContains("home"), 5000, "never arrived home after logging out");
    }
} // class Sidebar