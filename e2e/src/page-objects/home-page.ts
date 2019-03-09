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
    public projectCodeInputNav  = element(by.id("projectCodeInputNav"));
    public projectCodeInputUnderNav  = element(by.id("projectCodeInputUnderNav"));
    public footerGuidesLink  = element(by.id("footerGuidesLink"));
    public footerTwitterLink = element(by.id("footerTwitterLink"));
    public footerSupportLink = element(by.id("footerSupportLink"));
    public footerTermsLink = element(by.id("footerTermsLink"));
    
    private EC = protractor.ExpectedConditions

    // get the home page
    getPage() : void 
    {
        browser.get('/#/home');
        // Ensure home page loaded
        browser.wait(this.EC.elementToBeClickable(this.projectCodeInputNav), 3000, "home page did not load with group code input in nav")
    } // getPage() : void

    // click on the login link
    clickLogin() : void
    {
        this.loginLink.click();
    } // clickLogin() : void

    // Entering the project code from the home page
    enterProjectCodeFromHome(input: string) : void
    {
        // Ensure group code input is available
        browser.wait(this.EC.elementToBeClickable(this.projectCodeInputNav), 5000, "Project Code input was not present in Nav")
        
        this.projectCodeInputNav.isPresent().then((result) => {
            if (result) {
                this.projectCodeInputNav.isDisplayed().then((result) => {
                    if (result) {
                        // Project code input within the nav was visible, usually for destkop
                        browser.wait(this.projectCodeInputNav.isDisplayed, 5000, ('Never loaded Project Code input box'));
                        this.projectCodeInputNav.sendKeys(input);
                        browser.actions().sendKeys(protractor.Key.ENTER).perform();
                    } else {
                        // Project code input just under the nav was visible, usually for mobile
                        browser.wait(this.projectCodeInputUnderNav.isDisplayed, 5000, ('Never loaded Project Code input box'));
                        this.projectCodeInputUnderNav.sendKeys(input);
                        browser.actions().sendKeys(protractor.Key.ENTER).perform();
                    }
                });
            }
        });
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

    