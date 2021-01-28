/// <reference path="../node_modules/grunt-contrib-uglify/tasks/uglify.js" />
/// <reference path="../node_modules/grunt/lib/grunt.js" />

// reference https://github.com/gruntjs/grunt-contrib-uglify

module.exports = function (grunt) {
    var _debug = grunt.option('debug') || grunt.option('verbose');

    grunt.log.debug("Debug option: additional output files in ./config/temp/*.json");
    
    // grab version
    var version = grunt.config.get("currentVersion");

    // grunt.files
    // http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
    var CWD = '../';
    var assetsDestFolder = 'assets/';
    var destVersionPath = CWD + assetsDestFolder + version + '/js/';


    var createFilesConfiguration = function (bundleName, srcFiles) {
        // todo export config to external json and read, like bundle
        return {
            bundleName: bundleName,
            dest: assetsDestFolder,
            src: srcFiles,
            cwd: CWD,
            expand: true,
            rename: function () {
                return destVersionPath + this.bundleName;
            }
        };
    }

    // uglify compress options: 
    // https://github.com/mishoo/UglifyJS2#compressor-options

    var uglifyConfigPerEnv = {
        uprod: {
            options: {
                mangle: true,
                compress: {
                    hoist_funs: false // hoist function declarations
                },

                beautify: false,

                sourceMap: true,
                sourceMapIncludeSources: false

            }
        },
        udev: {
            options: {
                mangle: false,
                compress: {
                    hoist_funs: false // hoist function declarations
                },

                beautify: true,

                sourceMap: true,
                sourceMapIncludeSources: false

            }
        },
        ulocal: {
            options: {
                mangle: false,
                compress: false,

                beautify: true,

                sourceMap: true,
                sourceMapIncludeSources: true

            }
        }

    };
    var self = Object.create(uglifyConfigPerEnv);

    // process bundle-config.json and create deployment plan
    var projBundlesConfig = grunt.file.readJSON("config/bundles-config.json");
    grunt.log.debug((JSON.stringify(projBundlesConfig, 0, 2)));

    var subTasksPerEnv = {
        ulocal: [],
        udev: [],
        uprod: []
    };

    var allProjFilesArrayFormat = [];

    // for each bundle in config create:
    // 1. files object per bundle
    // 2. accumulate all bundles files object to one (back compatibility- old with no concurrent)
    // 3. create task per bundle per environment

    var subTaskTargetName;

    for (var bundleName in projBundlesConfig) {
        if (projBundlesConfig.hasOwnProperty(bundleName)) {
            var srcFiles = projBundlesConfig[bundleName];
            var bundleFilesConfig = createFilesConfiguration(bundleName, srcFiles);

            allProjFilesArrayFormat.push(bundleFilesConfig);

            // create per bundle per task
            // task name is the bundle name 
            var taskName = bundleName;

            var fileDescitorObj = {
                files: { value: [bundleFilesConfig], enumerable: true }
            };

            subTaskTargetName = taskName + '-local';
            self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.ulocal, fileDescitorObj);
            subTasksPerEnv.ulocal.push('newer:uglify:' + subTaskTargetName);

            subTaskTargetName = taskName + '-dev';
            self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.udev, fileDescitorObj);
            subTasksPerEnv.udev.push('uglify:' + subTaskTargetName);

            subTaskTargetName = taskName + '-prod';
            self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.uprod, fileDescitorObj);
            subTasksPerEnv.uprod.push('uglify:' + subTaskTargetName);
        }
    }

    // all project bundles in one files object
    self.uprod.files = self.udev.files = self.ulocal.files = allProjFilesArrayFormat;

    // concurrent per bundle tasks registration
    grunt.initConfig({
        concurrent: subTasksPerEnv
		//subTasksPerEnv = {
        //    ulocal: subTasksPerEnv.ulocal,
        //    udev: subTasksPerEnv.udev,
        //    uprod: subTasksPerEnv.uprod
        //}
    });

    
    if (_debug) {
        grunt.file.write('config/temp/bundle-files-config-array-' + version + '.json',
            JSON.stringify(allProjFilesArrayFormat, 0, 2));

        grunt.file.write('config/temp/uglify-exported-tasks-' + version + '.json',
            JSON.stringify(self, 0, 2));
    }

    return self;
};
