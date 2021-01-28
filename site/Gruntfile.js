var path = require('path');
/*Grunt config file*/
module.exports = function (grunt) {
    // measures the time each task takes
    var lessTaskConfig = require('./config/less/helper'),
        lessTaskResource;

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-available-tasks');
    grunt.loadNpmTasks('grunt-max-filesize');
    grunt.loadNpmTasks('grunt-lesshint');

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-proxy');

    grunt.loadNpmTasks('grunt-connect-prism');

    grunt.loadNpmTasks('grunt-express');

    global.workingDir = lessTaskConfig.workingDir;

    if (grunt.cli.tasks.indexOf('less') >= 0) {
        console.log('css path: ', global.workingDir.cssPath);
        console.log('less path: ', global.workingDir.lessPath);
    }

    function generateVersion() {
        return grunt.template.today("yyyymmddHHMMss");
    }

    var version = 'string';
    var versionTextPath = '../scripts/fxnet/common/utils/version/version.txt';

    if (grunt.file.isFile(versionTextPath)) {
        version = grunt.file.read(versionTextPath).toString();
        grunt.log.writeln('Existing Version: ' + version);
    }
    else {
        version = generateVersion();
        grunt.log.writeln('New Version: ' + version);
        grunt.task.run('replace:dist'); // set version files
    }

    grunt.verbose.ok('build version: ' + version);

    grunt.registerTask('copyCoreAssetsFile', function () {
        grunt.log.writeln('Copying Assets File');
        grunt.file.copy('node_modules/@cliotech/fx-core-api/dist/scripts/assets.js', '../scripts/fxnet/assets.js');
    });

    grunt.loadTasks('tasks');

    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');

    var options = {
        config: {
            eslintFormatter: require("eslint-stylish-config")
        },
        currentVersion: version,
        availabletasks: {
            tasks: {
                options: {
                    filter: 'exclude',
                    tasks: ['concat', 'uglify']
                }
            }
        },

        connect: {
            options: {
                base: '../',
                port: 9005,
                hostname: 'traderlocal.iforex.com',
                livereload: 35730,
                keepalive:true,
                //protocol: 'https',
                //key: grunt.file.read('server.key').toString(),
                //cert: grunt.file.read('server.crt').toString(),
                //ca: grunt.file.read('ca.crt').toString(),
                //passphrase: 'grunt'
            },
            livereload: {
                options: {
                    open: {
                        target: 'http://traderlocal.iforex.com:9005/test.html'
                    },
                  middleware: function(connect) {
                    var middlewares = [
                        require('grunt-connect-prism/middleware'),
                        connect().use(function (req, res, next) {
                        //on connect event ( first call )
                        next();
                        }),
                        // Serve static files.
                        serveStatic(options.connect.options.base),
                        // Make empty directories browsable.
                        serveIndex(options.connect.options.base)
                        ];
                    return middlewares;
                  }
                }
              },
          },
              // Empties folders to start fresh
              // The API that we are going to use grunt-connect-prism with
         express: {
              api: {
               options:{
                  port: 9091,
                  server: path.resolve('./express-api.js')
               }
             }
          },
          prism: {
            options: {
              mode: 'mock',
              mocksPath: './mocks',        
              // server
              host: 'traderlocal.iforex.com',
              port: 80,
              https: false,
              // client
              context: '/webpl3',
              useApi: true,
              xforward: true,
              headers: {
                'Content-Encoding': 'gzip, deflate, br',
                'Cookie': 'NativeUnknownApp=true; LID=1; Language=English; Theme=light|false; SD=traderlocal.iforex.com; DB=0B; CDN=; geoip=GR; ViewMode=FullSite; MinDealGroupId=3; _hjid=fc643c16-3880-4998-91ad-a768f9f48947; _gid=GA1.2.1412340734.1610544485; rbzid=6TTU5GUt8wEdsmrepatUkkOHqpbu/SjojvgQH/WV5RRt0HJgUwXh0Crpcyx8pfJZyO+XJW9S5keUMJffwXvJ9Bub0n2rvk5eMp03dQS155umuShD5qBAZoJL10hRGcF3q4QDzjVfJbYBAK/eZY8w0NYuSRW42YJcgmEQq9XFpkC5V8F8dfZ04pdkhRzzQSdVXIXjH3ARjU6kK6x52akAFozV9HhiFTTAvkRZjHVGRZLTxsOE17SvLtKbeXk/Qe9WZSOxyCcrkMe5r10BflgBqJMYNTlThjCn1bESHaTHTYY=; rbzsessionid=b8200678eb31b452fc379d54672eac0c; Version=20201230110628; ASP.NET_SessionId=pdjcdosrfvutsi4mhmcoufrc; AF=18e38611-b746-4d64-9c63-499a118660fc; UserDeviceInformation=True|1366|False; _gat=1; SnapABugRef=https%3A%2F%2Ftraderlocal.iforex.com%2Fwebpl3%2Faccount%2Flogin%20; SnapABugHistory=1#; SnapABugUserAlias=%23; SnapABugVisit=1#1610554594; FXNET_SessionId=f488f4fd-fcc5-4a99-9717-58321eff425a; B=6B|43F|0RF|3FP|3SP|0TST|405509749-VER|daba7adb06d3af5f967815d9f23d3dd4d24c66ae-H|135967748-DVER|9d19f3d0e02a852c6194473dfdab860deb5b6410-DH|405511052-MVER|3152bea20568e71cfd18c6bf78f6b644bd0d6051-MH|0-AL; CS=6; FXnetWeb_identity=XYtSoqy1hhySD1zhf3_r1641nXvYAFTcfM0jUO3bKEQm50SJX-yzOh4TcYB8yaatx2Wqih__1FQtqw6nL5EGSxQ6wR52AfzC9c52x8JgQ1kiO3AOyB9Rdm7uHirJvGb8y5gthfJEXNErDPR663oQp-GCMzkOtW04vlleD-uuxSKnqaef1MKZPGeDqdWqD8UoqJ1iIcef9bALdrREe1H2v9ANetZIDvnyroSq3i5hBDL7iG-vzwGoa5AJX5dROHGcTf_iPG2Y0TPvc25gFC5GCXbBsfWrCanxPGkYEZa_D-U8EYmulALDpumYvdLl9ul1ny_lviIjSZN8PetJDdZwHIEph93LnZq3RNUZmWrNi2FDHwTRKij68u6uLhmVD5kJytzaNWZKkXxjuxHJu8NIZ3fztR6riu0K4UCZ1-2qO1d53eQYgJA44ek8QSk1FQfALFPNQsRfPaNX90-SskbOxyYDum8YuqH6ZPkXXnvdewH2FQB8'
              },
              /* rewrites requests to context */
              rewrite: {
                //'^/web/*': '/webpl3/web',
                //'^/api/authors\??.*': '/api/authors',
                
                //'^/webpl3/assets/20201230110628/js/scripts/preloader-web.js': '/assets/20201230110628/js/scripts/preloader-web.js'
                
              },
              shouldRecord: function (req, res) {
                return res.statusCode !== 401;
              },
              serve: {},
            }
          },
          
  
    };

    grunt.initConfig(options);

    var configs = require('load-grunt-configs')(grunt, options);

    // Merge configuration
    grunt.config.merge(configs);


    grunt.registerTask('serve', 'Compile then start a connect web server', function(prismMode) {

        var prismTask = 'prism:serve';
    
        if (prismMode) {
          prismTask = prismTask + ':' + prismMode;
        }
    
        grunt.task.run([


          //'express:api',
          prismTask,
          'connect:livereload',
          'watch:js'

        ]);
      });

    /**
     * clean version
     * may need to run with grunt flag --force or -f since deleting outer files 
     */
    grunt.registerTask('reset-version', ['clean:version']);

    // new version
    grunt.registerTask('new-version', 'Change application version', function () {
        var newVersion = generateVersion();
        grunt.config.set('Current Version', newVersion);
        grunt.log.writeln('New Version: ' + newVersion);

        grunt.task.run('clean');

        grunt.config.merge({
            currentVersion: newVersion
        });

        grunt.task.run('replace');
        grunt.task.run('concat');
        grunt.task.run('bundles');
        grunt.task.run('copy');
    });

    grunt.loadNpmTasks('grunt-newer');

	// build JS
	grunt.registerTask("js", ["eslint:fxnet", "testjs", "concatLocalConcurrent"]);

	grunt.registerTask("uglify-local", ["newer:uglify:fxnet-local"]);
	grunt.registerTask("uglify-local-full", ["uglify:fxnet-local"]);
	grunt.registerTask("uglify-dev", ["uglify:fxnet-dev"]);
	grunt.registerTask("uglify-qa", ["uglify:fxnet-qa"]);
	grunt.registerTask("uglify-prod", ["uglify:fxnet-prod"]);

    // the default is production
    grunt.registerTask('default', ['prod']);

    //run traderlocal website
    grunt.registerTask('start', ['open:local']);

    grunt.registerTask('eslint-build', ['newer:concurrent:eslint', 'newer:eslint:noko']);
    grunt.registerTask('eslint-build-full', ['concurrent:eslint', 'newer:eslint:noko']);

    grunt.registerTask('badHabbitsSoft', ['eslint:badHabbitsSoft']);
    grunt.registerTask('badHabbits', ['eslint:badHabbitsQunit', 'jsinspect:all']);

    grunt.registerTask('duplicate', ['jsinspect:vm']);

    // unit tests
    grunt.registerTask('testjs', ['copy:chartVersionTest', 'concurrent:qunit']);

    grunt.registerTask('concurrentCompile', ['newer:concurrent:less', 'maxFilesize:css', 'newer:concurrent:copy']);
    grunt.registerTask('concurrentCompileFull', ['concurrent:less', 'maxFilesize:css', 'concurrent:copy']);
    grunt.registerTask('concurrentLess', ['concurrent:less', 'maxFilesize:css']);
    grunt.registerTask('concurrentQunit', ['copy:chartVersionTest', 'concurrent:qunit']);

	// local
	grunt.registerTask("local", [
		"newer:replace:html",
		"eslint-build",
		"newer:concat",
		"requirejs",
		"uglify-local",
		"testjs",
	]);
	grunt.registerTask("fulllocal", [
		"replace:html",
		//"concurrent:eslint",
		"clean:js",
		"concat",
		"requirejs",
		"uglify-local",
		"concurrentCompileFull",
		"testjs",
	]);
	grunt.registerTask("quickLocal", [
		"replace:html",
		"clean:js",
		"concurrent:copy",
		"concat",
		"requirejs",
		//"uglify-local",
		//"concurrent:eslint",
	]);
	grunt.registerTask("concat-bundles", ["copyCoreAssetsFile", "concat", "bundles"]);

    // new name
    grunt.registerTask('local-deploy', ['concat', 'concurrentCompile']);

	// per environment
	grunt.registerTask("dev", [
		"replace:pci",
		"replace:html",
		"concurrent:eslint",
		"concat",
		"requirejs",
		"uglify-dev",
		"concurrentQunit",
		"concurrentCompileFull",
	]);
	grunt.registerTask("qa", [
		"replace:pci",
		"replace:html",
		"concurrent:eslint",
		"concat",
		"requirejs",
		"uglify-qa",
		"concurrentQunit",
		"concurrentCompileFull",
	]);
	grunt.registerTask("prod", [
		"replace:pci",
		"replace:html",
		"concurrent:eslint",
		"concat",
		"requirejs",
		"uglify-prod",
		"concurrentQunit",
		"concurrent:less",
		"concurrent:copy",
	]);

	/**
	 * Local purpose task
	 * After altering global.workDir paths run "grunt local" in command line
	 * This will compile CSS to LESS based on Broker_X/Language specified on global.workDir (csspath/lessPath)
	 */

    grunt.registerTask('watch-tests', ['watch:qunit']); // Watch tests
    grunt.registerTask('watch-js', ['watch:jslight']); //just js related tasks
    grunt.registerTask('watch-less', ['watch:less']); // Watch less
    grunt.registerTask('watch-duplicate', ['watch:duplicates']); // Watch duplicates on vms

    grunt.registerTask('requirejs', ['shell:requirejsMobile', 'shell:requirejsWeb', 'shell:requirejsDesktop']);

    //generate instrument fonts from svg files using icomoon-cli
    grunt.registerTask('build-instrument-fonts', () => {
        const instrumentsPath = grunt.option('instrumentsPath');
        const svgPath = grunt.option('svgPath');

        grunt.task.run(`generate-fonts: --svgPath=${svgPath}`);
        grunt.task.run('copy:svgIcons');
        grunt.task.run(`build-icons-css: --instrumentsPath=${instrumentsPath} --svgPath=${svgPath}`);
        grunt.task.run(`build-letters-css: --instrumentsPath=${instrumentsPath}`);
    });

    lessTaskResource = require('./config/less/taskresource');
    Object.keys(lessTaskResource.composedLessTasks).forEach(function (task) {
        grunt.registerTask(task, lessTaskResource.composedLessTasks[task]);
    });

    // On watch events configure lesshint:watch to only run on changed file
    grunt.event.on('watch', function (action, filepath) {
        if (filepath && filepath.toLowerCase && filepath.toLowerCase().endsWith('.less')) {
            grunt.config('lesshint.watch.src', filepath);
        }
    });
};