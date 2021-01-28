module.exports.tasks = {
    replace: {
        dist: {
            options: {
                patterns: [{
                    match: 'hash',
                    replacement: '<%= grunt.config.get("currentVersion") %>'
                }]
            },
            files: [{
                expand: true,
                flatten: true,
                src: [
                    '../Scripts/Global/version.txt',
                    '../Scripts/Global/version.js'
                ],
                dest: '../Scripts/FxNet/Common/Utils/Version'
            }]
        },
        html: {
            options: {
                patterns: [{
                    match: 'version',
                    replacement: '<%= grunt.config.get("currentVersion") %>'
                }]
            },
            files: [{
                expand: true,
                flatten: true,
                src: [
                    '../rootHtmls/webtrader.html',
                    '../rootHtmls/mobiletrader.html'
                ],
                dest: '../assets/<%= grunt.config.get("currentVersion") %>/html/'
            }]
        },
		pci: {
            options: {
                patterns: [{
                    match: 'hash',
                    replacement: '<%= ((new Date().getTime() * 10000) + 621355968000000000) %>'
                }]
            },
            files: [{
                expand: true,
                flatten: true,
                src: [
                    '../Scripts/Global/versionpci.require.js',
					'../Scripts/Global/versionPCI.js'
                ],
                dest: '../Scripts/FxNet/Common/Utils/Version'
            }]
        }	

    }
}
