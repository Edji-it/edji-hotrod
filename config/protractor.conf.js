/**
 * @author: @AngularClass
 */

require('ts-node/register');
var helpers = require('./helpers.js');

exports.config = {
  
  // The address of a running selenium server.
  baseUrl: 'http://localhost:3375/',        // Point it at localhost!
  //baseUrl: 'http://dev.edji.it/#/home',     // Point it at dev.edji.it!

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    marionette: true,
    'chromeOptions': {
      'args': ['show-fps-counter=true']
    } // chrome options
  }, // capabilities

  // Spec patterns are relative to the location of the spec file. They may include glob patterns.
  suites: {
    // Example suite: homepage: 'tests/e2e/homepage/**/*Spec.js',

    // To test the entire site:
    fulle2e: [
      '../src/tests/home/home.e2e.ts'
    ],
    home:     '../src/tests/e2e/home.spec.ts',
    oldhome:  helpers.root('src/tests/e2e/home.e2e.ts')
  }, // suites
  
  exclude: [],

  framework: 'jasmine2',

  allScriptsTimeout: 110000,

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: false,
    includeStackTrace: false,
    defaultTimeoutInterval: 400000
  },
  directConnect: true,

  onPrepare: function() {
    browser.ignoreSynchronization = true;
  },

  /**
   * Angular 2 configuration
   *
   * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
   * `rootEl`
   */
   useAllAngular2AppRoots: true
  };
