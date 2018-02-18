// //Import Global Configuration file
// var globalConf = require('./protractor.conf.js');

// //Clone the global configuration object. You can follow any cloning mechanism
// var localConf = JSON.parse(JSON.stringify(globalConf));

// //Make custom changes to suit your suite. May be add Suites or anything thats at suite level
// localConf['capabilities'] = {
//   'browserName': 'chrome',
//   marionette: true,
//   'chromeOptions': {
//     'args': ['show-fps-counter=true','use-fake-ui-for-media-stream','disable-web-security','--window-size=411,731']
//   },
//   shardTestFiles: true,
//   maxInstances: 1
// };

// // Set the value of exports.config based on
// exports.config = localConf;

// Get configuration file for protractor mobile from the config folder
exports.config = require('./config/protractor-mobile.conf.js').config;