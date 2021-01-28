module.exports = function (grunt) {
    var chalk = require('chalk'),
        path = require('path'),
        assetsPath = 'assets/js/',
        moduleNameRegex = /define(?:[\W]+)(?:['"])([\w\/\-]+)(?:['"])/gm;

    grunt.registerMultiTask('bundles', 'Generate require.config bundles configuration', function () {
        var requireBundlesConfig = {
            bundles: {}
        };

        this.files.forEach(function (file) {
            file.src.filter(function (filepath) {
                grunt.log.writeln('Filepath: ' + filepath);

                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                }

                return true;
            }).map(function(filepath, i) {
                if (grunt.file.isDir(filepath)) {
                    return;
                }

                var filename = path.basename(filepath);

                return {
                    name: assetsPath + filename.substr(0, filename.lastIndexOf('.')),
                    source: grunt.file.read(filepath)
                };
            }).forEach(function (item) {
                requireBundlesConfig.bundles[item.name] = [];

                var match = moduleNameRegex.exec(item.source);

                do {
                    if (match) {
                        requireBundlesConfig.bundles[item.name].push(match[1]);
                    }

                    match = moduleNameRegex.exec(item.source);
                } while (match);
            });

            // Write the destination file.
            grunt.file.write(file.dest, "var require = " + JSON.stringify(requireBundlesConfig, 0, 2) + ";");

            // Print a success message.
            grunt.verbose.write('File ' + chalk.cyan(file.dest) + ' created.');
        });
    });
};