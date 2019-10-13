/**
 * Configuration file for Protractor testing on CircleCI
 * Pulls in the main protractor config and only makes changes we need for this particular config
 */

// Import Global Protractor Configuration file
var globalConf = require('./protractor.conf.js')

// Clone the global configuration object
var localConf = globalConf.config

// Make custom changes to any part of the global config as needed
localConf['capabilities']['chromeOptions']['args'] = [
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  '--disable-web-security',
  '--headless',
  '--window-size=1680,1050',
  '--disable-extensions',
  '--disable-gpu',
  '--no-sandbox',
]

// Use 3 instances on CircleCI
localConf['capabilities']['maxInstances'] = 1

localConf.onPrepare = () => {
  // Add Junit report output for tracking results in Circle
  var jasmineReporters = require('jasmine-reporters')
  var junitReporter = new jasmineReporters.JUnitXmlReporter({
    // setup the output path for the junit reports
    savePath: 'output/protractor/',
    // conslidate all true:
    //   output/junitresults.xml
    //
    // conslidate all set to false:
    //   output/junitresults-example1.xml
    //   output/junitresults-example2.xml
    consolidateAll: false,
  })
  jasmine.getEnv().addReporter(junitReporter)
  // We do not want to ignoreSynchronization, it defeats the purpose of protractor
  browser.ignoreSynchronization = true

  // add test log output configuration
  jasmine.getEnv().addReporter(
    new SpecReporter({
      spec: {
        // Protractor-flake needs stack trace find the correct specs to run
        displayStacktrace: true,
      },
    }),
  )
}

// Set the value of exports.config based on
exports.config = localConf
