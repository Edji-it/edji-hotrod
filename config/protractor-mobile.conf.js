/**
 * Configuration file for Protractor testing on mobile
 * Pulls in the main protractor config and only makes changes we need for this particular config
 * @author: @AngularClass
 */

 // Import Global Protractor Configuration file
var globalConf = require('./protractor.conf.js');

// Clone the global configuration object
var localConf = JSON.parse(JSON.stringify(globalConf)).config;

// Make custom changes to any part of the global config as needed
localConf['capabilities']['chromeOptions']['args'] = [
  'show-fps-counter=true',
  'use-fake-ui-for-media-stream',
  'disable-web-security',
  '--window-size=411,731'
];

// Set the value of exports.config based on
exports.config = localConf;