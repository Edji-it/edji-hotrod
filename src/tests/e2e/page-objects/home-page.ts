import { browser, by, element, protractor } from 'protractor';

/*
 * 18 Jan 2017
 * Last Modified: 19 Jan 2017
 * Nicholas Pumper
 * 
*/

/**
 * Page Object for the EDJI Home Page
 */
class Home
{
    // Instance Variables
    public loginButton      = element(by.id("buttonLogin"));
    public usernameInput    = element(by.id('usernameInput')); 
    public passwordInput    =  element(by.id('passwordInput'));

    // get the home page
    getPage() : void 
    {
        browser.get('/#/home');
    } // getPage() : void


} // class Home

export = Home;