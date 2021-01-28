module.exports.tasks = {
	shell: {
		requirejsMobile: {
			command:
				'r.js.cmd -o r/app.build.mobile.js dir=../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts',
			options: {
				async: false,
				stdout: true,
				stderr: true,
				failOnError: true,
			},
		},
		requirejsWeb: {
			command:
				'r.js.cmd -o r/app.build.web.js dir=../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts',
			options: {
				async: false,
				stdout: true,
				stderr: true,
				failOnError: true,
			},
		},
		requirejsDesktop: {
			command:
				'r.js.cmd -o r/app.build.desktop.js dir=../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts',
			options: {
				async: false,
				stdout: true,
				stderr: true,
				failOnError: true,
			},
		},
	},
};
