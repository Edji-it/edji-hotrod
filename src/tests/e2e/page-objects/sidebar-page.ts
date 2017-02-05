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
    public logOutButton     = element(by.id("logOutButton"));
    public accountButton    = element(by.id("accountButton"));
    public heatButton       = element(by.id("toggleHeatVision"));
    public accountButtonSpan = this.accountButton.element(by.css('span'));

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
    }
} // class Sidebar