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
  
  multiCapabilities: [
    // Android | Capabilities to be passed to the webdriver instance
    {
      seleniumAddress: 'http://localhost:4723/wd/hub',
      chromeOptions: {
        args: [
          'show-fps-counter=true',
          'use-fake-ui-for-media-stream',
          '--window-size=411,731'
          ]
      },
      // specs: [
        // 'src/tests/e2e/mobile/home.spec.ts',
        // 'src/tests/e2e/mobile/account.spec.ts',
        // 'src/tests/e2e/mobile/login.spec.ts',
        // 'src/tests/e2e/mobile/owner-tools.spec.ts',
        // 'src/tests/e2e/mobile/new-reading.spec.ts',
        // 'src/tests/e2e/mobile/project.spec.ts',
        // 'src/tests/e2e/mobile/dashboard.spec.ts',
        // 'src/tests/e2e/mobile/questions.spec.ts',
        // 'src/tests/e2e/mobile/version.spec.ts',
      // ],
      browserName: 'chrome',
      marionette: true,
      platformName: 'Android',
      platformVersion: '7.0',
      deviceName: 'Android Emulator',
      shardTestFiles: true,
    },
    // Desktop | Capabilities to be passed to the webdriver instance
    {
      browserName: 'chrome',
      marionette: true,
      chromeOptions: {
        args: [
          'show-fps-counter=true',
          'use-fake-ui-for-media-stream',
          '--window-size=1680,1050'
          ]
      },
      // specs: [
        // 'src/tests/e2e/desktop/home.spec.ts',
        // 'src/tests/e2e/desktop/account.spec.ts',
        // 'src/tests/e2e/desktop/login.spec.ts',
        // 'src/tests/e2e/desktop/owner-tools.spec.ts',
        // 'src/tests/e2e/desktop/new-reading.spec.ts',
        // 'src/tests/e2e/desktop/project.spec.ts',
        // 'src/tests/e2e/desktop/dashboard.spec.ts',
        // 'src/tests/e2e/desktop/questions.spec.ts',
        // 'src/tests/e2e/desktop/version.spec.ts',
      // ],
      shardTestFiles: true,
      maxInstances: 1
    }
  ],
  maxSessions: 1,

  // // iOS | Capabilities to be passed to the webdriver instance
  // seleniumAddress: 'http://localhost:4723/wd/hub',

  // // Reference: https://github.com/appium/sample-code/blob/master/sample-code/examples/node/helpers/caps.js
  // capabilities: {
  //   browserName: 'chrome',
  //   platformName: 'Android',
  //   platformVersion: '7.0',
  //   deviceName: 'Android Emulator',
  // },

  /*
  Run a suite of tests using 'yarn run protractor --suite suiteNameHere'
  - Spec patterns are relative to the location of the spec file. They may include glob patterns.
   */
  suites: {
    // Example suite: homepage: 'tests/e2e/homepage/**/*Spec.js',

    // To test the entire site:
    home:       helpers.root('src/tests/e2e/home.spec.ts'),
    account:    helpers.root('src/tests/e2e/account.spec.ts'),
    login:      helpers.root('src/tests/e2e/login.spec.ts'),
    ownerTools: helpers.root('src/tests/e2e/owner-tools.spec.ts'),
    newReading: helpers.root('src/tests/e2e/new-reading.spec.ts'),
    project:    helpers.root('src/tests/e2e/project.spec.ts'),
    dashboard:  helpers.root('src/tests/e2e/dashboard.spec.ts'),
    discover:   helpers.root('src/tests/e2e/discover.spec.ts'),
    question:   helpers.root('src/tests/e2e/questions.spec.ts'),
    version:    helpers.root('src/tests/e2e/version.spec.ts'),
    all:        [helpers.root('src/tests/e2e/home.spec.ts'),  helpers.root('src/tests/e2e/login.spec.ts')]
  }, // suites

  exclude: [],

  framework: 'jasmine2',

  allScriptsTimeout: 10000,

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
  }