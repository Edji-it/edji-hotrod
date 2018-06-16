/**
 * Configuration file for Protractor testing on CircleCI
 * Pulls in the main protractor config and only makes changes we need for this particular config
 */

 // Import Global Protractor Configuration file
var globalConf = require('./protractor.conf.js');

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
localConf['capabilities']['maxInstances'] = 1;

// Set the value of exports.config based on
exports.config = localConf;