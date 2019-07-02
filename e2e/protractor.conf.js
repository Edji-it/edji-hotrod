/**
 * Configuration file for Protractor testing
 * @author: @AngularClass
 */

require('ts-node/register')
var helpers

helpers = require('./helpers.js') // Helps us get the root file reference.
SpecReporter = require('jasmine-spec-reporter').SpecReporter

exports.config = {
  // The address of a running selenium server.
  baseUrl: 'http://localhost:3375/',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: 'chrome',
    // marionette: true,
    chromeOptions: {
      args: [
        'show-fps-counter=true',
        'use-fake-ui-for-media-stream',
        'disable-web-security',
        '--window-size=1680,1050',
        '--disable-extensions',
        '--disable-gpu',
        '--no-sandbox',
      ],
    },
    shardTestFiles: true,
    maxInstances: 5,
    loggingPrefs: {
      driver: 'SEVERE',
      server: 'SEVERE',
      browser: 'SEVERE',
    },
  },

  /*
   Run a suite of tests using 'yarn e2e --suite suiteNameHere'
   - Spec patterns are relative to the location of the spec file. They may include glob patterns.
  */
  suites: {
    account: helpers.root('e2e/src/account.spec.ts'),
    coteacher: helpers.root('e2e/src/owner-tools__co-teacher.spec.ts'),
    dashboard: helpers.root('e2e/src/dashboard.spec.ts'),
    discover: helpers.root('e2e/src/discover.spec.ts'),
    discoverPublic: helpers.root('e2e/src/discover-share-public.spec.ts'),
    heroSubscribe: helpers.root('e2e/src/hero-subscribe.spec.ts'),
    home: helpers.root('e2e/src/home.spec.ts'),
    leaderboard: helpers.root('e2e/src/owner-tools__leaderboard.spec.ts'),
    license: helpers.root('e2e/src/license.spec.ts'),
    login: helpers.root('e2e/src/login.spec.ts'),
    newReading: helpers.root('e2e/src/new-reading.spec.ts'),
    readingMedia: helpers.root('e2e/src/reading-media.spec.ts'),
    ownerTools: helpers.root('e2e/src/owner-tools.spec.ts'),
    project: helpers.root('e2e/src/project.spec.ts'),
    question: helpers.root('e2e/src/questions.spec.ts'),
    referral: helpers.root('e2e/src/referral.spec.ts'),
    readingLink: helpers.root('e2e/src/reading-link.spec.ts'),
    readingrecap: helpers.root('e2e/src/owner-tools__reading-recap.spec.ts'),
    version: helpers.root('e2e/src/version.spec.ts'),
    all: [helpers.root('e2e/src/home.spec.ts'), helpers.root('e2e/src/login.spec.ts')],
  },

  exclude: [],

  framework: 'jasmine',

  allScriptsTimeout: 65000,

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: false,
    includeStackTrace: false, // Reporting is better handled by our SpecReporter below
    // A longer default timeout makes our test suite unusable
    defaultTimeoutInterval: 60000,
    print: () => {}, // take out the dot logging when tests are run
  },
  directConnect: true,

  onPrepare: function() {
    // We do not want to ignoreSynchronization, it defeats the purpose of protractor
    browser.ignoreSynchronization = true

    // add test log output configuration
    jasmine.getEnv().addReporter(
      new SpecReporter({
        spec: {
          displayStacktrace: false, // turned off as we are tracking console errors per test
        },
      }),
    )
  },

  /**
   * Angular 2 configuration
   * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
   */
  useAllAngular2AppRoots: true,
}
