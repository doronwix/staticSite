/// <reference path="../node_modules/grunt-contrib-uglify/tasks/uglify.js" />
/// <reference path="../node_modules/grunt/lib/grunt.js" />

// reference https://github.com/gruntjs/grunt-contrib-uglify

var uglifySelection = [
	"**/*.js",
	"!**/*.min.js",
	"!**/*.json.js",
	"!**/*.config.js",
	"!AdvinionChart/**/*",
	"!AdvinionChartCustomizations/**/*",
	"!chatbot/**/*",
	"!fx-core-api/**/*",
];

// debugger;

module.exports = function (grunt) {
	var _debug = grunt.option("debug") || grunt.option("verbose");

	grunt.log.debug("Debug option: additional output files in ./config/temp/*.json");

	// grab version
	var version = grunt.config.get("currentVersion");

	/**
	 *
	 * @param {String} v
	 */
	function sourceMapIn(v) {
		return v.endsWith(".js") ? v + ".map" : false;
	}

	// grunt.files
	// http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically

	var createFilesConfiguration = function (bundleName, srcFiles) {
		var CWD = "../";
		var destPath = CWD + (bundleName.includes(".test.js") ? "/testjs/bundles/" : "assets/" + version + "/js/");

		return {
			bundleName: bundleName,
			dest: destPath,
			src: srcFiles,
			cwd: CWD,
			expand: true,
			rename: function (dest) {
				return dest + this.bundleName;
			},
		};
	};

	// uglify compress options:
	// https://github.com/mishoo/UglifyJS2#compressor-options

	var uglifyConfigPerEnv = {
		uprod: {
			options: {
				mangle: true,
				compress: {
					hoist_funs: false, // hoist function declarations
				},
				beautify: false,
				sourceMap: true,
				sourceMapIncludeSources: false,
				sourceMapIn: sourceMapIn,
			},
		},
		uqa: {
			options: {
				mangle: true,
				compress: {
					hoist_funs: false, // hoist function declarations
				},
				beautify: true,
				sourceMap: true,
				sourceMapIncludeSources: false,
				sourceMapIn: sourceMapIn,
			},
		},
		udev: {
			options: {
				mangle: false,
				compress: {
					hoist_funs: false, // hoist function declarations
				},
				beautify: true,
				sourceMap: true,
				sourceMapIncludeSources: false,
				sourceMapIn: sourceMapIn,
			},
		},
		ulocal: {
			options: {
				mangle: false,
				compress: false,
				beautify: true,
				sourceMap: true,
				sourceMapIncludeSources: false,
				sourceMapIn: sourceMapIn,
			},
		},
		"test-local": {
			options: {
				mangle: true,
				compress: true,
				sourceMap: {
					includeSources: true,
				},

				sourceMapIn: sourceMapIn,
			},
			files: [
				{
					expand: true,
					cwd: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
					src: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/FxNet/Common/Constants/Enums/*.js',
					dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
				},
			],
		},
		"fxnet-local": {
			options: {
				mangle: true,
				compress: true,
				sourceMap: {
					includeSources: true,
				},

				sourceMapIn: sourceMapIn,
			},
			files: [
				{
					expand: true,
					cwd: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
					src: uglifySelection,
					dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
				},
			],
		},
		"fxnet-dev": {
			options: {
				mangle: true,
				compress: true,
				sourceMap: {
					includeSources: true,
				},

				sourceMapIn: sourceMapIn,
			},
			files: [
				{
					expand: true,
					cwd: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
					src: uglifySelection,
					dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
				},
			],
		},
		"fxnet-qa": {
			options: {
				mangle: true,
				compress: true,

				sourceMap: {
					includeSources: true,
				},

				sourceMapIn: sourceMapIn,
			},
			files: [
				{
					expand: true,
					cwd: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
					src: uglifySelection,
					dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
				},
			],
		},
		"fxnet-prod": {
			options: {
				mangle: true,
				compress: true,
			},
			files: [
				{
					expand: true,
					cwd: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
					src: uglifySelection,
					dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/',
				},
			],
		},
	};

	var self = Object.create(uglifyConfigPerEnv);

	// process bundle-config.json and create deployment plan
	var projBundlesConfig = grunt.file.readJSON("config/bundles-config.json");
	grunt.log.debug(JSON.stringify(projBundlesConfig, 0, 2));

	var subTasksPerEnv = {
		ulocal: [],
		udev: [],
		uprod: [],
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
				files: { value: [bundleFilesConfig], enumerable: true },
			};

			subTaskTargetName = taskName + "-local";
			self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.ulocal, fileDescitorObj);
			subTasksPerEnv.ulocal.push("newer:uglify:" + subTaskTargetName);

			subTaskTargetName = taskName + "-dev";
			self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.udev, fileDescitorObj);
			subTasksPerEnv.udev.push("uglify:" + subTaskTargetName);

			subTaskTargetName = taskName + "-qa";
			self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.uqa, fileDescitorObj);
			subTasksPerEnv.uprod.push("uglify:" + subTaskTargetName);

			subTaskTargetName = taskName + "-prod";
			self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.uprod, fileDescitorObj);
			subTasksPerEnv.uprod.push("uglify:" + subTaskTargetName);

			subTaskTargetName = taskName + "-non-bundled";
			self[subTaskTargetName] = Object.create(uglifyConfigPerEnv.uprod, fileDescitorObj);
			subTasksPerEnv.uprod.push("uglify:" + subTaskTargetName);
		}
	}

	// all project bundles in one files object
	self.uprod.files = self.udev.files = self.ulocal.files = allProjFilesArrayFormat;

	// concurrent per bundle tasks registration
	grunt.initConfig({
		concurrent: subTasksPerEnv,
		//subTasksPerEnv = {
		//    ulocal: subTasksPerEnv.ulocal,
		//    udev: subTasksPerEnv.udev,
		//    uprod: subTasksPerEnv.uprod
		//}
	});

	// adding concurrent task aliases
	grunt.registerTask("uglifyLocalConcurrent", ["concurrent:ulocal"]);
	grunt.registerTask("uglifyDevConcurrent", ["concurrent:udev"]);
	grunt.registerTask("uglifyQaConcurrent", ["concurrent:uqa"]);
	grunt.registerTask("uglifyProdConcurrent", ["concurrent:uprod"]);

	if (_debug) {
		grunt.file.write(
			"config/temp/bundle-files-config-array-" + version + ".json",
			JSON.stringify(allProjFilesArrayFormat, 0, 2)
		);

		grunt.file.write("config/temp/uglify-exported-tasks-" + version + ".json", JSON.stringify(self, 0, 2));
	}

	return self;
};
