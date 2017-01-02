import { browser, by, element, protractor } from 'protractor';

describe('App', () => {

  let EC = protractor.ExpectedConditions;
  
  // Does this before each test.
  beforeEach(() => {
    // change hash depending on router LocationStrategy
    browser.get('/#/home');
  });

  // Extremely Basic Test.
  //  If this goes wrong, shit is seriously messed up.
  it('should have a title', () => {
    let subject = browser.getTitle();
    let result  = 'Edji';
    expect(subject).toEqual(result);
  });
  
  // TEMPLATE
  // it('should have `your content here` x-large', () => {
  //   let subject = element(by.css('[x-large]')).getText();
  //   let result  = 'Your Content Here';
  //   expect(subject).toEqual(result);
  // });

  /*
   * Login Tests
   */
  
  // Test: logging in with correct login information.
  // WIP
  it('user can login with correct credentials', () => {
    let loginBtn = element(by.id('buttonLogin'));

    element(by.id('usernameInput')).sendKeys('student');
    element(by.id('passwordInput')).sendKeys('student'); // protractor.Key.ENTER

    loginBtn.click().then(function() {
      browser.wait( EC.urlContains('dashboard'), 3000, 'Dashboard should open within 3 seconds');
    });
  });
  // WIP

  // Test: Not typing in a password on log in.
  // WIP
  it('user cannot login without password', () => {
    let loginBtn = element(by.id('buttonLogin'));
    let errorMsg = element(by.id('msgErrorPassword'));

    element(by.id('usernameInput')).sendKeys('student');
    loginBtn.click();
    
    browser.wait(EC.presenceOf(errorMsg), 1000);
  }); 

  // Test for typing in a non-existent user.
  // WIP

  /*
    Page Navigation Tests.
  */

  /* Test: Go to Account information page
    - Be logged into edji (teacher or student) and on dashboard, reading or project page
    - Click on your name in the bottom left corner
    - Redirect to Account info page
  */
  // WIP

  /* Test: Go back to Dashboard
    - Be logged into edji (teacher or student) and on reading, account details or project page
    - Click Edji logo in top left corner of page
    - Redirect to dashboard
  */
  // WIP

  /* Test: View guides/faq
    - Be on any Edji page except guide.edji.it
    - Click guides button at bottom of page
    - Redirect to guide.edji.it
  */
  //WIP

  /* Test: View Edji twitter page
    - Be on any Edji page except guide.edji.it
    - Click guides button at bottom of page
    - Redirect to Edji twitter page
  */
  // WIP


  /**
   * Teacher Action Tests
   */

});
