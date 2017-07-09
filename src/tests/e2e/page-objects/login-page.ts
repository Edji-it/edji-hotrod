import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Login implements PageObjectInterface
{
    /*
    23 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    Page Object for the Login page.

    
    */

    // Public Instance Variables
    public edjiLogo         = element(by.id("edjiLogo"));
    public loginButton      = element(by.id("buttonLogin"));
    public usernameInput    = element(by.id("usernameInput"));
    public passwordInput    = element(by.id("passwordInput"));
    public msgError         = element(by.id("msgError"));
    public msgNoUserName    = element(by.id("msgNoUserName"));
    public msgBadName       = element(by.id("msgBadName"));
    public guestNameInput   = element(by.id("guestNameInput"));
    public guestLoginButton = element(by.id("guestLoginButton"));

    public studentUser      = 'student';
    public studentPassword  = 'student';
    public teacherUser      = 'testowner';
    public teacherPassword  = 'testowner16';
    public heroUser         = 'testHero';
    public heroPassword     = 'testHero16';
    public botUser          = 'testbot';
    public botPassword      = 'testbot';
    public invalidEntry     = 'HitlerHatesEDJI_666_420';
    public validProjectCode = '35jz';
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
    
    clearLoginFields () : void
    {
        this.usernameInput.clear();
        this.passwordInput.clear();
    }
    
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