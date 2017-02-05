import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Dashboard implements PageObjectInterface
{
    /*
    28 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    Page Object for the Dashboard page.
    */

    // Public Instance Variables
    public projectCards = element.all(by.css('.project-card'));
    public firstProject = this.projectCards.first();
    public projectCodeInput = element(by.css('#projectCodeInput'));
    public projectJoinButton = element(by.css('#projectJoinButton'));

    // get the login page
    getPage() : void 
    {
        browser.get('/#/dashboard');
    } // getPage() : void


} // class Login