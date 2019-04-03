/**
 * Configuration file for Protractor testing on mobile
 * Pulls in the main protractor config and only makes changes we need for this particular config
 * @author: @AngularClass
 */

// Import Global Protractor Configuration file
var globalConf = require('./protractor.conf.js')

// Clone the global configuration object
var localConf = JSON.parse(JSON.stringify(globalConf)).config

var helpers
helpers = require('../config/helpers.js') // Helps us get the root file reference.

// Make custom changes to any part of the global config as needed
localConf['capabilities']['chromeOptions']['args'] = [
  'show-fps-counter=true',
  'use-fake-ui-for-media-stream',
  'disable-web-security',
  '--window-size=411,731',
]

// Some suites we're not going to test on mobile, and we'll also have a separate suite for dedicated mobile testing
localConf['suites'] = {
  home: helpers.root('src/tests/e2e/home.spec.ts'),
  account: helpers.root('src/tests/e2e/account.spec.ts'),
  login: helpers.root('src/tests/e2e/login.spec.ts'),
  ownerTools: helpers.root('src/tests/e2e/owner-tools.spec.ts'),
  newReading: helpers.root('src/tests/e2e/new-reading.spec.ts'),
  project: helpers.root('src/tests/e2e/project.spec.ts'),
  dashboard: helpers.root('src/tests/e2e/dashboard.spec.ts'),
  discover: helpers.root('src/tests/e2e/discover.spec.ts'),
  question: helpers.root('src/tests/e2e/questions.spec.ts'),
  version: helpers.root('src/tests/e2e/version.spec.ts'),
  // heroSubscribe: helpers.root('src/tests/e2e/hero-subscribe.spec.ts'),
  all: [helpers.root('src/tests/e2e/home.spec.ts'), helpers.root('src/tests/e2e/login.spec.ts')],
}

// onPrepare doesn't pull in from the globalConfig, so we need to set it again here
localConf['onPrepare'] = function() {
  // We do not want to ignoreSynchronization, it defeats the purpose of protractor
  browser.ignoreSynchronization = true

  // add test log output configuration
  jasmine.getEnv().addReporter(
    new SpecReporter({
      spec: {
        displayStacktrace: true,
      },
    }),
  )
}

// Set the value of exports.config based on
exports.config = localConf
