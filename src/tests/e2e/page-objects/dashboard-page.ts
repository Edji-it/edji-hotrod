import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

class Dashboard implements PageObjectInterface
{
    /*
    28 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    Page Object for the Dashboard page.
    */

    // Public Instance Variables
   

    // get the login page
    getPage() : void 
    {
        browser.get('/#/dashboard');
    } // getPage() : void


} // class Login

export = Dashboard;