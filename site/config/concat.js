module.exports = function(grunt) {
    var CWD = '../';
    var assetsFolder = 'assets/';

    var concatConfig = {
        options: {
            separator: '\n;\n',
            sourceMap: true,
            sourceMapStyle: 'link',
            banner: '/*!\n Version = <%= grunt.config.get("currentVersion") %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> \n*/\n'
        }
    };

    var bundlesConfig = grunt.file.readJSON("config/bundles-config.json");

    for (var bundleName in bundlesConfig) {
        if (bundlesConfig.hasOwnProperty(bundleName)) {
            var dest = bundleName.includes('.test.js') ? CWD + '/testjs/bundles/'  + bundleName : CWD + assetsFolder + '<%= grunt.config.get("currentVersion") %>/js/' + bundleName
            concatConfig[bundleName] = {
                files: [{
                    nonull: true,
                    src: bundlesConfig[bundleName].map(function(filePath) { return CWD + filePath }),
                    dest: dest
                }]
            };
        }
    }

    grunt.registerTask('concatLocalConcurrent', ['concat']);
    grunt.registerTask('concatDevConcurrent', ['concat']);

    return concatConfig;
};