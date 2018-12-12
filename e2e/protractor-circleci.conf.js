/**
 * Configuration file for Protractor testing on CircleCI
 * Pulls in the main protractor config and only makes changes we need for this particular config
 */

 // Import Global Protractor Configuration file
var globalConf = require('./protractor.conf.js');
var retry = require('protractor-retry').retry;

// Clone the global configuration object
var localConf = globalConf.config;


// Make custom changes to any part of the global config as needed
localConf['capabilities']['chromeOptions']['args'] = [
  'use-fake-ui-for-media-stream',
  'disable-web-security',
  '--headless',
  '--window-size=1680,1050',
  '--disable-extensions',
  '--disable-gpu',
  '--no-sandbox'
];

// Use 3 instances on CircleCI
localConf['capabilities']['maxInstances'] = 3;

localConf.onPrepare = () => {
  // We do not want to ignoreSynchronization, it defeats the purpose of protractor
  browser.ignoreSynchronization = true;

  // add test log output configuration
  jasmine.getEnv().addReporter(new SpecReporter({
    spec: {
      displayStacktrace: true
    }
  }));

  // Prepare Protractor Retry
  retry.onPrepare();
}

localConf.afterLaunch = () => {
  // Set how many times to retry failed tests
  return retry.afterLaunch(2);
},

localConf.onCleanUp = (results) => {
  retry.onCleanUp(results);
},

// Set the value of exports.config based on
exports.config = localConf;