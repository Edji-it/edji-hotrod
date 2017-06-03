import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Home implements PageObjectInterface
{
    /*
    18 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    Page Object for the EDJI Home Page

    */

    // Public Instance Variables
    public loginLink         = element(by.id("loginLink"));
    public registerButton    = element(by.id("registerLink"));
    public joinProjectButton = element(by.id("buttonJoinProject"));
    public projectCodeInput  = element(by.id("projectCodeInput"));
    public footerGuidesLink  = element(by.id("footerGuidesLink"));
    public footerTwitterLink = element(by.id("footerTwitterLink"));
    public footerSupportLink = element(by.id("footerTwitterLink"));
    public footerTermsLink = element(by.id("footerTermsLink"));

    // get the home page
    getPage() : void 
    {
        browser.get('/#/home');
    } // getPage() : void

    // click on the login link
    clickLogin() : void
    {
        this.loginLink.click();
    } // clickLogin() : void

    enterProjectCode(input: string) : void
    {
        // This line actually *breaks* being able to find the input
        // browser.get('#projectCodeInput');
        this.projectCodeInput.sendKeys(input);
    } // enterProjectCode(input: string) : void

    clickJoinProjectButton () :  void
    {
        // This test does not want to get the join project button for some reason.
        /*
        browser.get('#buttonJoinProject');
        this.joinProjectButton.click();
        */

        // so the work around is press enter:
        browser.actions().sendKeys(protractor.Key.ENTER).perform();

        // or very manually click it
        // browser.actions().mouseMove(this.joinProjectButton).mouseDown().mouseUp().perform();
    } // clickProjectButton () :  void

    // click the footer guides link
    clickGuidesLink() : void
    {
        browser.get('#footerGuidesLink');  // Little trick to scroll to ID

        this.footerGuidesLink.click();
    } // clickGuidesLink() : void

    // click the footer twitter link
    clickTwitterLink() : void 
    {
        browser.get('#footerTwitterLink');  // Little trick to scroll to ID

        this.footerTwitterLink.click();
    } // clickTwitterLink() : void 

    // click the footer twitter link
    clickSupportLink() : void 
    {
        browser.get('#footerSupportLink');  // Little trick to scroll to ID

        this.footerSupportLink.click();
    } // clickSupportLink() : void 
} // class Home

    