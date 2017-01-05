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
    browser.wait( EC.urlContains('dashboard'), 10000, 'Dashboard should open within 3 seconds. It did not. Login potentially failed.');
  } // function logInWithStudentAccount

  function logInWithTeacherAccount () 
  {
    browser.wait(EC.urlContains('home'), 3000, 'logInWithTeacherAccount(): could not find the URL for the home page. :(');

    element(by.id('usernameInput')).sendKeys('teach');
    element(by.id('passwordInput')).sendKeys('teach'); // protractor.Key.ENTER
    
    pressEnter();
    browser.wait( EC.urlContains('dashboard'), 10000, 'Dashboard should open within 3 seconds. It did not. Login potentially failed.');
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

  function enterProjectCode(projectCode)
  {
    let codeInput = element(by.id('projectCodeInput'));

    codeInput.sendKeys(projectCode);
  } // function enterProjectCodeAndSubmit(code)

  function submitProjectCode(projectCode)
  {
    enterProjectCode(projectCode);
    pressEnter();
  } // function submitProjectCode(projectCode)

  function enterGuestName(guestName)
  {
    let guestCodeInput  = element(by.id('guestNameInput'));
    guestCodeInput.sendKeys(guestName);
  } // function joinAsGuest(guestName)

  function clickSidebarAccountButton()
  {
    let accountBtn = element(by.id('accountButton'));
    accountBtn.click();
  } // function pressAccountButton()

  function clickLogoButton()
  {
    let sideBar = element(by.id('sideBar')); // Make sure we're using the sidebar, ya know?
    let logoBtn = element(by.id('logo'));
    logoBtn.click();
  } // function clickLogoButton()

  function verifyURL(urlSnippet)
  {
    browser.wait(EC.urlContains(urlSnippet), 5000, ('Never arrived at the url containing: ' + urlSnippet + '. :('));
  } // function verifyURL(urlSnippet)

  function clickOnFooterGuidesButton()
  {
    let footer = element(by.id("footer")); // hey it finds this though... solution in the works.
    

    let fterGuidesBtn = footer.element(by.id("footerGuidesLink")); // IT CAN'T FIND IT
    fterGuidesBtn.click();
  } // function clickOnFooterGuidesButton()

  /*
------------------------------------ Super Basic Tests ---------------------------------
  */

  /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
  */
  it('should have a title', () => {
    let subject = browser.getTitle();
    let result  = 'Edji';
    expect(subject).toEqual(result);
  });

  /*
------------------------------------- Login Tests --------------------------------------
   */

  // Test: logging in with correct login information.
  it('user can login with correct credentials', () => {
    verifyURL("home");
    logInWithStudentAccount();
  });

  // Test: Not typing in a password on log in.
  it('user cannot login without password', () => {
    let errorMsg = element(by.id('msgErrorPassword'));

    enterUsernameAndPassword("student", "");
    pressEnter();
    
    browser.wait(EC.presenceOf(errorMsg), 5000, 'The error message never showed up. Like my last date. T_T');
  }); 

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

  /* Test: Go to Account information page
    - Be logged into edji (teacher or student) and on dashboard, reading or project page
    - Click on your name in the bottom left corner
    - Redirect to Account info page
  */
  it('user can go to Account information page', () => {
    // Home Page
    logInWithStudentAccount();

    // Dashboard
    verifyURL('dashboard');
    clickSidebarAccountButton();

    // Account Page
    verifyURL('account');
  });

  /* Test: Go back to Dashboard
    - Be logged into edji (teacher or student) and on reading, account details or project page
    - Click Edji logo in top left corner of page
    - Redirect to dashboard
  */
  it('user can log in, go to home, and go back to the dashboard', () => {
    // Home Page
    logInWithStudentAccount(); // Uses the student account.

    // Dashboard
    verifyURL('dashboard');
    clickSidebarAccountButton();

    // Account Page
    verifyURL("account");
    clickLogoButton();

    // Dashboard
    verifyURL("dashboard");
  });

  /* Test: View guides/faq
    - Be on any Edji page except guide.edji.it
    - Click guides button at bottom of page
    - Redirect to guide.edji.it
  */
  // WORK IN PROGRESS
  it('user can view guides/FAQ', () => {
    // Home Page
    clickOnFooterGuidesButton();

    // Guides Page
    verifyURL("guide");
  });

  /* Test: View Edji twitter page
    - Be on any Edji page except guide.edji.it
    - Click guides button at bottom of page
    - Redirect to Edji twitter page
  */
  // WORK IN PROGRESS
  it('user can go to the EDJI twitter page', () => {
    let footer = element(by.id("footer")); // hey it finds this though... solution in the works.
    let twitterLink = footer.element(by.id("footerTwitterLink")); // IT CAN'T FIND IT
    browser.waitForAngular();
    twitterLink.click();
    verifyURL("twitter");
  });

  /*
------------------------------------- Teacher Action Tests ------------------------------------
   */

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
  // WORK IN PROGRESS
  it('teacher can add a reading', () => {
    // Home Page
    logInWithTeacherAccount();
    
  });

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
  
  /* Test: Get to project through quick code, enter as guest
    - Path to Edji.it 
    - Enter in valid project code, click join project or hit enter
    - Redirect to “Join” page
    - Click on join as guest field and type in valid not vulgar name hit enter or click join project button
    - Redirect to project
  */
  it('user can get to a project through quick code, enter as guest', () => {
    // Home Page
    enterProjectCode('fcx6');
    pressEnter();

    // Join/Login Page
    verifyURL("join");
    enterGuestName('Queen Elizabeth II');
    pressEnter();

    //Project Page
    verifyURL("project");
    expect(element(by.id("projectTitle")).isPresent()).toBe(true, 'Could not find the project title.');  //FIND THE TITLE
  });

  /* Test: Get to project through quick code, be rejected because of vulgar name
    - Path to Edji.it
    - Enter in valid project code, click join project or hit enter
    - Redirect to “Join” page
    - Click on join as guest field and type in vulgar name hit enter or click join project button
    - Receive “Name is invalid” error message
  */
  it('can get to project through quick code, be rejected because of vulgar name', () => {
    // Home Page
    submitProjectCode('fcx6');

    // Join / Login Page
    verifyURL("join");
    enterGuestName("Fucking Fucks");
    pressEnter();
    let errorMsg = element(by.binding('errorObject.invalidAuthorName'));
    browser.wait(EC.presenceOf(errorMsg), 3000, 'The error message should show up. It did not.');
  });

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
  it('enter a project code from the dashboard', () => {
    //Home Page
    logInWithStudentAccount();

    // Dashboard
    verifyURL("dashboard");
    enterProjectCode('fcx6');
    let joinProjectBtn = element(by.buttonText("Join Project!"));
    browser.waitForAngular();
    joinProjectBtn.click();

    //Project Page
    verifyURL("project");
    expect(element(by.id("projectTitle")).isPresent()).toBe(true, 'Could not find the project title.');  //FIND THE TITLE
  });

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
