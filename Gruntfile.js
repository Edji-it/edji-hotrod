/**
 * Grunt! Taskrunner goodness for:
 * - Deploying to S3 and invalidating Cloudfront
 * - Verifying we are deploying from the correct branch
 */
module.exports = function ( grunt ) {

    /**
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     */
    grunt.loadNpmTasks('grunt-aws');
    grunt.loadNpmTasks('grunt-checkbranch');
  
    /**
     * Load in our build configuration file.
     */
    // var userConfig = require( './build.config.js' );
  
    /**
     * This is the configuration object Grunt uses to give each plugin its
     * instructions.
     */
    var taskConfig = {
      /**
       * We read in our `package.json` file so we can access the package name and
       * version. It's already there, so we don't repeat ourselves here.
       */
      pkg: grunt.file.readJSON("package.json"),
      
      // Read the file
      aws: grunt.file.readJSON('aws-keys.json'),
  
      s3: {
        options: {
          accessKeyId: "<%= aws.accessKeyId %>",
          secretAccessKey: "<%= aws.secretAccessKey %>",
          bucket: "edji.it",
          region: "us-west-2"
        },
        dev: {
          cwd: "dist/",
          src: "**",
          options: {
              bucket: "dev.edji.it"
          }
        },
        prod: {
          cwd: "dist/",
          src: "**",
          options: {
              bucket: "edji.it"
          }
        }
      },
  
      cloudfront: {
        options: {
          accessKeyId: "<%= aws.accessKeyId %>",
          secretAccessKey: "<%= aws.secretAccessKey %>",
          // distributionId: 'E2S6W7VTFUQ0T8',
          invalidations: [
            '/index.html'
          ]
        },
        dev: {
          options: {
            distributionId: 'E3SATWU8COUAWT'
          }
        },
        prod: {
          options: {
            distributionId: 'E2S6W7VTFUQ0T8'
          }
        }
      },
  
      /**
       * The `index` task compiles the `index.html` file as a Grunt template. CSS
       * and JS files co-exist here but they get split apart later.
       */
      index: {
  
      },
  
      /**
       * And for rapid development, we have a watch set up that checks to see if
       * any of the files listed below change, and then to execute the listed
       * tasks when they do. This just saves us from having to type "grunt" into
       * the command-line every time we want to see what we're working on; we can
       * instead just leave "grunt watch" running in a background terminal. Set it
       * and forget it, as Ron Popeil used to tell us.
       *
       * But we don't need the same thing to happen for all the files.
       */
      delta: {
        /**
         * By default, we want the Live Reload to work for all tasks; this is
         * overridden in some tasks (like this file) where browser resources are
         * unaffected. It runs by default on port 35729, which your browser
         * plugin should auto-detect.
         */
        options: {
          livereload: true
        },
  
        /**
         * When the Gruntfile changes, we just want to lint it. In fact, when
         * your Gruntfile changes, it will automatically be reloaded!
         */
        gruntfile: {
          files: 'Gruntfile.js',
          tasks: [ 'jshint:gruntfile' ],
          options: {
            livereload: false
          }
        }
  
      }
  
    };
  
    // grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );
  
    /**
     * The `compile` task gets your app ready for deployment by concatenating and
     * minifying your code.
     */
    grunt.registerTask( 'push:dev', [  's3:dev' ]);
    grunt.registerTask( 'push:prod', [ 'checkbranch:master:true', 's3:prod'  ]);
  
  };