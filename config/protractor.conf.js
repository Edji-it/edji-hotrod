/**
 * Configuration file for Protractor testing
 * @author: @AngularClass
 */

require('ts-node/register');
var helpers;

helpers = require('./helpers.js'); // Helps us get the root file reference.
SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
  // The address of a running selenium server.
  baseUrl: 'http://localhost:3375/',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    marionette: true,
    'chromeOptions': {
      'args': ['show-fps-counter=true','use-fake-ui-for-media-stream','disable-web-security','--window-size=1680,1050']
    },
    shardTestFiles: true,
    maxInstances: 1
  },

  /*
   Run a suite of tests using 'yarn run protractor --suite suiteNameHere'
   - Spec patterns are relative to the location of the spec file. They may include glob patterns.
  */
  suites: {
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
    heroSubscribe: helpers.root('src/tests/e2e/hero-subscribe.spec.ts'),
    all:        [helpers.root('src/tests/e2e/home.spec.ts'),  helpers.root('src/tests/e2e/login.spec.ts')]
  },

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
    // browser.driver.manage().window().setSize(parseInt(browser.params.width), parseInt(browser.params.height));
  },

  /**
   * Angular 2 configuration
   * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
   */
   useAllAngular2AppRoots: true
  }