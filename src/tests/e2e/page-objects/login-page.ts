import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

class Login implements PageObjectInterface
{
    /*
    23 Jan 2017
    Last Modified: 23 Jan 2017
    Nicholas Pumper
    */

    // Public Instance Variables
    public edjiLogo         = element(by.id("edjiLogo"));
    public loginButton      = element(by.id("loginButton"));
    public usernameInput    = element(by.id("usernameInput"));
    public passwordInput    = element(by.id("passwordInput"));

    // Private Instance Variables
    private studentUser     = 'student';
    private studentPassword = 'student';
    private teacherUser     = 'teach';
    private teacherPassword = 'teach';

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

} // class Login

export = Login;