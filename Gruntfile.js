module.exports = function ( grunt ) {

  /**
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  // grunt.loadNpmTasks('grunt-concurrent');
  // grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-aws');
  // grunt.loadNpmTasks('grunt-nodemon');
  //grunt.loadNpmTasks('grunt-contrib-less');
  // grunt.loadNpmTasks('grunt-contrib-compass');
  // grunt.loadNpmTasks('grunt-sass');
  // grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-bump');
  // grunt.loadNpmTasks('grunt-coffeelint');
  // grunt.loadNpmTasks('grunt-karma');
  // grunt.loadNpmTasks('grunt-ng-annotate');
  // grunt.loadNpmTasks('grunt-html2js');
  // grunt.loadNpmTasks('grunt-connect');

  /**
   * Load in our build configuration file.
   */
  var userConfig = require( './build.config.js' );

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

    // nodemon: {
    //   dev: {
    //     script: 'index.js',
    //     options: {
    //       args: ['dev'],
    //       nodeArgs: ['--debug'],
    //       callback: function (nodemon) {
    //         nodemon.on('log', function (event) {
    //           console.log(event.colour);
    //         });
    //       },
    //       env: {
    //         PORT: '8444'
    //       },
    //       cwd: 'edji-server',
    //       ignore: ['node_modules/**'],
    //       ext: 'js,coffee',
    //       watch: ['**'],
    //       // delay: 1000,
    //       legacyWatch: true
    //     }
    //   },
    //   exec: {
    //     options: {
    //       // exec: 'less'
    //     }
    //   }
    // },

    // // Serve Angular build on :9000
    // connect: {
    //   build: {
    //     port: 9000,
    //     base: 'build'
    //   }
    // },

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    // meta: {
    //   banner:
    //     '/**\n' +
    //     ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
    //     ' * <%= pkg.homepage %>\n' +
    //     ' *\n' +
    //     ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
    //     ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
    //     ' */\n'
    // },

    /**
     * Creates a changelog on a new version.
     */
    // changelog: {
    //   options: {
    //     dest: 'CHANGELOG.md',
    //     template: 'changelog.tpl'
    //   }
    // },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          "package.json"
        ],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        commitFiles: [
          "package.json"
        ]
      }
    },
     
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
        cwd: "buil/",
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

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask( 'push:dev', [  's3:dev' ]);
  grunt.registerTask( 'push:prod', [ 's3:prod'  ]);

  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    grunt.file.copy('client/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    var jsFiles = filterForJS( this.filesSrc );

    grunt.file.copy( 'karma/karma-unit.tpl.js', grunt.config( 'build_dir' ) + '/karma-unit.js', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });

};
