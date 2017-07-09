/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `client/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`client/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'client/**/*.js', '!client/api/**/*.js', '!client/**/*.spec.js', '!client/assets/**/*.js' ],
    jsunit: [ 'client/**/*.spec.js' ],

    coffee: [ 'client/**/*.coffee', '!client/**/*.spec.coffee' ],
    coffeeunit: [ 'client/**/*.spec.coffee' ],

    atpl: [ 'client/app/**/*.tpl.html', 'client/app/**/*.jade' ],
    ctpl: [ 'client/common/**/*.tpl.html', 'client/common/**/*.jade' ],

    html: [ 'client/index.html' ],
    sass: 'client/sass/'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      'vendor/ga/analytics.js',
      'vendor/transitionize/dist/transitionize.js',
      'vendor/fastclick/lib/fastclick.js',
      'vendor/angular/angular.js',
      'vendor/angular-sanitize/angular-sanitize.min.js',
      'vendor/hammerjs/hammer.js',
      'vendor/angular-gestures/gestures.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/modules/route/route.js',
      'vendor/angular-http-auth/src/http-auth-interceptor.js',
      'vendor/ngstorage/ngStorage.js',
      'vendor/emojione/lib/js/emojione.js',
      'vendor/emojionearea/dist/emojionearea.js',
      'vendor/angular-hotkeys/build/hotkeys.js',
      'vendor/rangy/rangy-core.js',
      'vendor/angular-socket-io/socket.js',
      'vendor/textAngular/dist/textAngular-rangy.min.js',
      'vendor/textAngular/dist/textAngular-sanitize.min.js',
      'vendor/textAngular/dist/textAngular.min.js',
      'vendor/angulartics-google-analytics/dist/angulartics-ga.min.js',
      'vendor/angulartics-piwik/dist/angulartics-piwik.min.js',
      'vendor/angulartics/dist/angulartics.min.js',
      'vendor/medium-editor/dist/js/medium-editor.js',
      'vendor/angular-medium-editor/dist/angular-medium-editor.js'
    ],
    css: [
      'vendor/medium-editor/dist/css/medium-editor.css',
      'vendor/switchery/dist/switchery.css',
      'vendor/angular-hotkeys/build/hotkeys.css',
      'vendor/textAngular/dist/textAngular.css',
      'vendor/font-awesome/css/font-awesome.map.css'
    ],
    assets: [
    ]
  },
};
