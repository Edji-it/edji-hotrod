import { browser, by, element, protractor } from 'protractor';

export class LoginForm {
  private EC = protractor.ExpectedConditions; // vital

  // html elements for user login
  public loginButton      = element(by.id("buttonLogin"));
  public usernameInput    = element(by.id("usernameInput"));
  public passwordInput    = element(by.id("passwordInput"));
  public msgError         = element(by.id("msgError"));
  public msgNoUserName    = element(by.id("msgNoUserName"));
  public msgBadName       = element(by.id("msgBadName"));

  // other variables
  public studentUser      = 'student';
  public studentPassword  = 'student';
  public teacherUser      = 'teach';
  public teacherPassword  = 'teach';
  public invalidEntry     = 'HitlerHatesEDJI_666_420';
  public validProjectCode = '35jz';
  public testGuestName    = "Queen Elizabeth II";

  /** Tests all login errors on the login form */
  public testLoginErrors(): void {

      beforeEach(() => {

        // wait for login button to be clickable - this validates that test may proceed
        browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable after page load");

        // clear the login fields - just to make sure that they're clean
        this.usernameInput.clear();
        this.passwordInput.clear();
        
      });

      // Test: Not typing in a password on log in should throw an error message.
      it('should give an error message when they don\'t enter a password', () => {

        // form handling
        this.usernameInput.sendKeys(this.studentUser);
        browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable after login form entry");
        this.loginButton.submit();
        
        // test verification
        browser.wait(this.EC.presenceOf(this.msgError), 5000, 'never saw password error message');
      });

      // Test: Not typing in a password on log in should throw an error message.
      it('should give an error message when they don\'t enter a username', () => {

        // form handling
        this.passwordInput.sendKeys(this.studentPassword);
        browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable after login form entry");
        this.loginButton.submit();
        
        // test verification
        browser.wait(this.EC.presenceOf(this.msgError), 5000, 'never saw username error message');
      });

      // Test: enter a correct user, but an invalid password
      it('should give an error message when they enter an incorrect password', () => {

        // form handling
        this.usernameInput.sendKeys(this.studentUser);
        this.passwordInput.sendKeys(this.invalidEntry);
        browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable after login form entry");
        this.loginButton.submit();
        
        // test verification
        browser.wait(this.EC.presenceOf(this.msgError), 5000, 'never saw incorrect username/password error');
      });

      // Test: enter an invalid user, but a correct password
      it('should give an error message when they enter an incorrect username', () => {

        this.usernameInput.sendKeys(this.invalidEntry);
        this.passwordInput.sendKeys(this.studentPassword);

        browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable after login form entry");
        this.loginButton.submit();
        
        // test verification
        browser.wait(this.EC.presenceOf(this.msgError), 5000, 'never saw incorrect username/password error');
      });

  }

  /**
   * This method logs the user in from the form
   * It tests only the ability to enter the information into the fields; any other testing is left up to the module calling this method (verification of arriving at endpoint, for example)
   */
  public login(): void {
    // initial validation
    browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable");

    // form handling
    this.usernameInput.clear();
    this.passwordInput.clear();
    this.usernameInput.sendKeys(this.teacherUser);
    this.passwordInput.sendKeys(this.teacherPassword);
    
    // log them in
    browser.wait(this.EC.elementToBeClickable(this.loginButton), 5000, "login button never became clickable after login form entry");
    this.loginButton.submit();
  }
}