import { browser, by, element, protractor } from 'protractor';

describe('App', () => {

  let EC    = protractor.ExpectedConditions; // vital
  
  // Does this before each test.
  beforeEach(() => {
    // change hash depending on router LocationStrategy
    browser.get('/#/home');
  });
  
  /*
    ---------------------------- Common Functions ------------------------------
    
    These are functions that are going to be used in many places throughout the tests.
  */

  function logInWithStudentAccount () 
  {
    browser.wait(EC.urlContains('home'), 3000, 'logInWithStudentAccount(): could not find the URL for the home page. :(');

    element(by.id('usernameInput')).sendKeys('student');
    element(by.id('passwordInput')).sendKeys('student'); // protractor.Key.ENTER
    
    pressEnter();
    browser.wait( EC.urlContains('dashboard'), 10000, 'Dashboard should open within 3 seconds');
  } // function logInWithStudentAccount

  function pressEnter ()
  {
    browser.waitForAngular();
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
  } // function pressEnter ()

  function enterUsernameAndPassword(username, password)
  {
    browser.wait(EC.urlContains('home'), 10000, 'enterUsernameAndPassword(): could not find the URL for the home page. :(');

    element(by.id('usernameInput')).sendKeys(username);
    element(by.id('passwordInput')).sendKeys(password);
  } // function enterUsername(username)

  function enterPassword(password)
  {
    element(by.id('passwordInput')).sendKeys(password);
  } // function enterPassword(password)

  function enterProjectCodeAndSubmit(projectCode)
  {
    let codeInput = element(by.id('projectCodeInput'));
    codeInput.sendKeys(projectCode);
    pressEnter();
  } // function enterProjectCodeAndSubmit(code)

  function joinAsGuest(guestName)
  {
    let guestCodeInput  = element(by.id('guestNameInput'));

    guestCodeInput.sendKeys(guestName);
    pressEnter();
  } // function joinAsGuest(guestName)

  /*
    ------------------------------------ Super Basic Tests ---------------------------------
  */

  /* Test: Extremely Basic Test.
    - I've been keeping this in there because it tells me when I'm being excessively
      dumb elsewhere.
  */
  it('should have a title', () => {
    let subject = browser.getTitle();
    let result  = 'Edji';
    expect(subject).toEqual(result);
  });

  /*
   * ------------------------------------- Login Tests --------------------------------------
   */

  // Test: logging in with correct login information.
  it('user can login with correct credentials', () => {
    logInWithStudentAccount();
  });

  // Test: Not typing in a password on log in.
  it('user cannot login without password', () => {
    let errorMsg = element(by.id('msgErrorPassword'));

    enterUsernameAndPassword("student", "");
    pressEnter();
    
    browser.wait(EC.presenceOf(errorMsg), 5000, 'The error message never showed up. Like my last date. T_T');
  }); 

  // WIP
  // Test for typing in a non-existent user.
  it('user cannot login with an non-existent user', () => {
    let errorMsg = element(by.id('msgErrorPassword'));

    enterUsernameAndPassword("HitlerHatesEDJI", "student");
    pressEnter();
    
    browser.wait(EC.presenceOf(errorMsg), 3000, 'The error message never showed up. Like my last date. T_T');
  });

  /*
    ---------------------------------- Page Navigation Tests ----------------------------------
  */

  // WIP 
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

  // WIP 
  /* Test: View Edji twitter page
    - Be on any Edji page except guide.edji.it
    - Click guides button at bottom of page
    - Redirect to Edji twitter page
  */

  /*
   * ------------------------------------- Teacher Action Tests ------------------------------------
   */

  // WIP
  /* Test: Add a reading
    - Go to Teacher Dashboard
    - Click add a reading button
    - Redirect to Add a Reading page
    - Click on new title box and Enter title
    - Tab/click to source url, enter URL
    - Tab/click to contact, paste content or type in content
    - Tab and hit enter/ click on “Add reading button”
    - Redirect to reading page of newly created reading
  */

  // WIP
  /* Test: Add reading, don’t enter title
    - Go to Teacher Dashboard
    - Click add a reading button
    - Redirect to Add a Reading page
    - Tab/click to source url, enter URL
    - Tab/click to contact, paste content or type in content
    - Tab and hit enter/ click on “Add reading button”
    - Receive error message asking to give reading a title
  */

  // WIP
  /* Test: Add reading, don’t enter content
    - Go to Teacher Dashboard
    - Click add a reading button
    - Redirect to Add a Reading page
    - Click on new title box, enter title
    - Tab/click to source url, enter URL
    - Tab and hit enter/ click on “Add reading button”
    - Receive error message asking to give reading some content
  */

  /*
    ----------------------------------- Student Action Tests --------------------------------------
  */

  // WIP
  /* Test: Get to project through quick code, enter as guest
    - Path to Edji.it 
    - Enter in valid project code, click join project or hit enter
    - Redirect to “Join” page
    - Click on join as guest field and type in valid not vulgar name hit enter or click join project button
    - Redirect to project
  */
  it('user can get to a project through quick code, enter as guest', () => {
    enterProjectCodeAndSubmit('fcx6');
    browser.waitForAngular();
    joinAsGuest('Queen Elizabeth II');
    browser.wait(EC.urlContains('session'), 5000);
  });

  // WIP
  /* Test: Get to project through quick code, be rejected because of vulgar name
    - Path to Edji.it
    - Enter in valid project code, click join project or hit enter
    - Redirect to “Join” page
    - Click on join as guest field and type in vulgar name hit enter or click join project button
    - Receive “Name is invalid” error message
  */

  // WIP
  /* Test: Type in invalid project code at quick code enter
    - Path to Edji.it
    - Click on quick code and enter in invalid code, click enter or join button
    - Receive error stating that code is invalid
  */
  
  // WIP
  /* Test: Get to new project through dashboard
    - Be on Student dashboard page
    - Click project code and enter valid project code, click join button or hit enter
    - Redirect to project
  */

  // WIP
  /* Test: Go to previous project
    - Go to student dashboard
    - Click on a project under “your projects”
    - Redirect to correct project
  */

  // WIP
  /* Test: Make a comment on a project
    - Go to a valid project
    - Click and highlight section of the text
    - Click Emoji button
    - Go to Emoji keyboard (on screen) and choose an emoji
    - Click done button
  */

});
