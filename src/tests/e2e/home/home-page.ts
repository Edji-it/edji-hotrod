import { browser, by, element, protractor } from 'protractor';

class Home
{
    /*
    18 Jan 2017
    Last Modified: 19 Jan 2017
    Nicholas Pumper

    Page Object for the EDJI Home Page
    */

    // Public Instance Variables
    public loginButton      = element(by.id("buttonLogin"));
    public registerButton   = element(by.id("registerLink"));

    // get the home page
    getPage() : void 
    {
        browser.get('/#/home');
    } // getPage() : void

    clickLogin() : void
    {
        this.loginButton.click();
    } // clickLogin() : void
} // class Home

export = Home;