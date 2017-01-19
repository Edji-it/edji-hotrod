import { browser, by, element, protractor } from 'protractor';
import { Home } from 'page-object/home-page.ts';

/*
    18 Jan 2017
    Last Modified: 18 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

describe('Home Page', () => {

    /* ---- Variable Initialization --------------- */
    let home;
    
    home = new Home();

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('Extremely Basic Test FAILED', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        expect(subject).toEqual(result);
    });

}); // describe 'Home Page'