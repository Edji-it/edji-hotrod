import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

class Login implements PageObjectInterface
{
    /*
    23 Jan 2017
    Last Modified: 23 Jan 2017
    Nicholas Pumper

    Page Object for the Login page.
    */

    // Public Instance Variables
    public edjiLogo         = element(by.id("edjiLogo"));
    public loginButton      = element(by.id("buttonLogin"));
    public usernameInput    = element(by.id("usernameInput"));
    public passwordInput    = element(by.id("passwordInput"));
    public msgErrorPassword = element(by.id("msgErrorPassword"));
    public msgNoUserName    = element(by.id("msgNoUserName"));
    public msgNoPassword    = element(by.id("msgNoPassword"));
    public guestNameInput   = element(by.id("guestNameInput"));
    public guestLoginButton = element(by.id("guestLoginButton"));

    public studentUser      = 'student';
    public studentPassword  = 'student';
    public teacherUser      = 'teach';
    public teacherPassword  = 'teach';
    public invalidEntry     = 'HitlerHatesEDJI_666_420';
    public validProjectCode = 'bx72';
    public testGuestName    = "Queen Elizabeth II";

    // get the login page
    getPage() : void 
    {
        browser.get('/#/login');
    } // getPage() : void

    clickEdjiLogo () : void
    {
        this.edjiLogo.click();
    } // clickEdjiLogo ()

    enterUsername (input : string) : void 
    {
        this.usernameInput.sendKeys(input);
    } // enterUsername (input : string) : void

    enterPassword (input : string) : void
    {
        this.passwordInput.sendKeys(input);
    } // enterPassword (input : string) : void

    enterStudentAccountCredentials () : void
    {
        this.enterUsername(this.studentUser);
        this.enterPassword(this.studentPassword);
    } // enterStudentAccountCredentials () : void

    enterTeacherAccountCredentials () : void
    {
         this.enterUsername(this.teacherUser);
         this.enterPassword(this.teacherPassword);
    } // enterTeacherAccountCredentials () : void

    clickLoginButton () : void
    {
        this.loginButton.click();
    } // clickLoginButton () : void
    
    enterGuestName (input : string) : void
    {
        this.guestNameInput.sendKeys(input);
    } // enterGuestName () : void

    clickGuestLoginButton () : void
    {
        this.guestLoginButton.click();
    } // clickGuestLoginButton () : void

} // class Login

export = Login;