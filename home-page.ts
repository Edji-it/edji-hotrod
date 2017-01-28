import { browser, by, element, protractor } from 'protractor';

/*
    18 Jan 2017
    Last Modified: 18 Jan 2017
    Nicholas Pumper

    A Page Object for the home page.
*/

var Home = function() {
    let loginButton;

    // Initialization
    loginButton = element(by.id('buttonLogin'));
} // var Home