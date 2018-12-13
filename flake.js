// using commonjs:
var protractorFlake = require('protractor-flake')
// Default Options
protractorFlake({
  parser: 'standard'
}, function (status, output) {
  process.exit(status)
})

// Full Options
protractorFlake({
  protractorPath: './node_modules/protractor',
  maxAttempts: 2,
  parser: 'standard',
  // expects node to be in path
  // set this to wherever the node bin is located
  nodeBin: 'node',
  // set color to one of the colors available at 'chalk' - https://github.com/chalk/ansi-styles#colors
  color: 'magenta',
  protractorArgs: [],
  // specify a different protractor config to apply after the first execution attempt
  // either specify a config file, or cli args (ex. --capabilities.browser=chrome)
  // protractorRetryConfig: './e2e/protractor-circleci.conf.js' 
}, function (status, output) {
  process.exit(status)
})