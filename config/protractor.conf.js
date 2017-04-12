/*
  Last Modified: 19 Jan 2017

  Configurations for running Protractor and get things testing.
*/

/**
 * @author: @AngularClass
 */

// Require
require('ts-node/register');

var helpers;

helpers = require('./helpers.js'); // Helps us get the root file reference.
SpecReporter = require('jasmine-spec-reporter').SpecReporter;

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

  /*
  Run a suite of tests using 'yarn run protractor --suite suiteNameHere'
  - Spec patterns are relative to the location of the spec file. They may include glob patterns.
   */
  suites: {
    // Example suite: homepage: 'tests/e2e/homepage/**/*Spec.js',

    // To test the entire site:
    home:     helpers.root('src/tests/e2e/home.spec.ts'),
    login:    helpers.root('src/tests/e2e/login.spec.ts'),
    ownerTools:  helpers.root('src/tests/e2e/owner-tools.spec.ts'),
    newReading:  helpers.root('src/tests/e2e/new-reading.spec.ts'),
    dashboard: helpers.root('src/tests/e2e/dashboard.spec.ts'),
    project: helpers.root('src/tests/e2e/project.spec.ts'),
    all:      [helpers.root('src/tests/e2e/home.spec.ts'),  helpers.root('src/tests/e2e/login.spec.ts')]
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
    defaultTimeoutInterval: 400000,
    print: () => {} // take out the dot logging when tests are run
  },
  directConnect: true,

  onPrepare: function() {
    browser.ignoreSynchronization = true;

    // add test log output configuration
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
  },

  /**
   * Angular 2 configuration
   *
   * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
   * `rootEl`
   */
   useAllAngular2AppRoots: true
  };
