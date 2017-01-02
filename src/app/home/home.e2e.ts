import { browser, by, element, protractor } from 'protractor';

describe('App', () => {

  let EC = protractor.ExpectedConditions;
  
  beforeEach(() => {
    // change hash depending on router LocationStrategy
    browser.get('/#/home');
  });


  it('should have a title', () => {
    let subject = browser.getTitle();
    let result  = 'Edji';
    expect(subject).toEqual(result);
  });
  
  // it('should have `your content here` x-large', () => {
  //   let subject = element(by.css('[x-large]')).getText();
  //   let result  = 'Your Content Here';
  //   expect(subject).toEqual(result);
  // });

  /**
   * Login Tests
   */
  
  it('user can login with correct credentials', () => {
    element(by.id('usernameInput')).sendKeys('student');
    element(by.id('passwordInput')).sendKeys('student'); // protractor.Key.ENTER
    element(by.id('buttonLogin')).click().then(function() {
      browser.wait( EC.urlContains('dashboard'), 3000, 'Dashboard should open within 3 seconds');
    });
  });

  it('user cannot login without password', () => {
    element(by.id('usernameInput')).sendKeys('student');
    element(by.id('buttonLogin')).click();

    let errorMsg = element(by.id('msgErrorPassword'));
    browser.wait(EC.presenceOf(errorMsg), 1000);
  });

  /**
   * Project Code Tests
   */

});
