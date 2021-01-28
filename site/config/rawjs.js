module.exports = function(grunt) {

    /// global module declarations
    var currentConfig = {};
    var logger = grunt.log;

    /// implementations

    var fs = require("fs"),
        mkdirp = require('mkdirp');
    var getCurrentConfig = function(arg) {
        var argv = require('minimist')(process.argv.slice(2));

        var argvProps = [];

        Object.keys(argv)
            .forEach(function(k) {
                argvProps = argvProps.concat(k.split(":"));
            });

        var currentConfig = {};

        //set paths
        currentConfig.pathPrefix = argv.pathPrefix ||
            (__dirname.split('\\').slice(0, __dirname.split('\\').length - 2).join('\\') + '\\');

        currentConfig.watch = -1 <= (argvProps.indexOf("watch") + arg.indexOf("watch"));
        currentConfig.debug = -1 <= (argvProps.indexOf("debug") + arg.indexOf("debug"));
        currentConfig.webpack = -1 <= (argvProps.indexOf("webpack") + arg.indexOf("webpack"));
        currentConfig.uglify = -1 <= (argvProps.indexOf("uglify") + arg.indexOf("uglify"));

        //get version
        var version = grunt.config.get('currentVersion');

        currentConfig.pathPrefixOut = currentConfig.pathPrefix + 'assets\\' + version + '\\js\\';
        currentConfig.pathPrefixWeb = '/WebPL3/';
        currentConfig.pathPrefixLength = currentConfig.pathPrefix.length;

        // create destination if doesn't exist
        mkdirp.sync(currentConfig.pathPrefixOut);

        return currentConfig;
    }

    var walking = function(dir) {
        var crtDir = dir;

        var walk = function(dir, done) {
            var results = [];
            fs.readdir(dir, function(err, list) {
                if (err) return done(err);

                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return done(null, results);

                    //file = `${dir}/${file}`;
                    file = dir + "/" + file;
                    fs.stat(file, function(errStat, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function(errWalk, res) {
                                results = results.concat(res);
                                next();
                            });
                        } else {
                            if (file.endsWith(".js"))
                            { results.push(file); }
                            next();
                        }
                    });
                })();
            });
        };

        return new Promise(function(resolve, reject) {
            walk(crtDir,
                function(err, list) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(list);
                    }
                });
        });
    };

    var convertEntries = function(bundles, arrFiles, pathPrefix, fParse) {
        var entries = {};

        Object.keys(bundles)
            .forEach(function(k, kIdx, arrK) {
                if (0 > ['main.js', 'mobilemain.js', 'webviewmodels.js', 'mobileviewmodels.js'].indexOf(k.trim().toLowerCase())) {
                    return;
                }
                var kEntry = k.substring(0, k.length - 3);
                entries[kEntry] = [];

                bundles[k].forEach(function(el, elIdx, arrEl) {
                    var fp = pathPrefix + el;

                    var startStarPath = fp.indexOf('*');

                    var arrFound = arrFiles.filter(function(fName) {
                        if (0 < startStarPath) {// for files match a path with '*'
                            var n = fName.toUpperCase().indexOf(fp.substr(0, startStarPath).toUpperCase());
                            return 0 <= n;
                        } else {
                            return fName.toUpperCase() === fp.toUpperCase();
                        }
                    });

                    if (0 < arrFound.length) {
                        arrEl[elIdx] = arrFound[0];
                        arrFound.forEach(function(f, fIdx, arrFounds) {
                            entries[kEntry].push(fParse(f));
                        });
                    } else {
                        if (currentConfig.debug) {
                            logger.warn("for \"" + kEntry + "\" file missing: \"" + el + "\"");
                        }
                    }
                });
            });
        return entries;
    };

    var scripts2TagEntries = function(entries) {

        Object.keys(entries)
            .forEach(function(k, kIdx, arrK) {
                var content = "";
                if (0 >= entries[k].length) {
                    return;
                }
                entries[k].forEach(function(el, elIdx, arrEls) {
                    content += '_xlsd(\"' + el + '\");\n';
                });
                var fName = currentConfig.pathPrefixOut + k + ".js";

                fs.access(fName,
                    function(err) {
                        if (err && (err.code !== 'ENOENT')) {
                            logger.error(err.toString());
                            return;
                        }

                        var s0 =
                            "var _xlsd = function(s) {var e = document.createElement('script'); e.setAttribute('src', s); e.async = false; (document.body || document.head).appendChild(e); }";
                        fs.writeFileSync(fName, "(function(){\n" + s0 + "\n" + content + "\n delete _xlsd;\n})();");
                        var fName2Remove = fName + ".map";

                        try {
                            fs.accessSync(fName2Remove);
                            fs.unlinkSync(fName2Remove);
                        } catch (ex) {

                        }


                    });
            });
    };

    var go = function(args, done) {
        currentConfig = getCurrentConfig(args || []);

        if (currentConfig.debug) {
            console.dir({ unuglifyConfig: currentConfig });
        }

        //get bundlesConfig
        var bundlesConfig = require(currentConfig.pathPrefix + "nodeUtils\\config\\bundles-config.json");

        var convertedEntries;// = {};

        walking(currentConfig.pathPrefix + "Scripts")
            .then(function(arrFiles) {
                if (!(Array.isArray(arrFiles) && (arrFiles.length > 0))) {
                    logger.error("no files found for bundlesConfig!");
                    throw "no files found for bundlesConfig!";
                }

                convertedEntries = convertEntries(bundlesConfig, arrFiles, currentConfig.pathPrefix,
                    function(s) {
                        return currentConfig.pathPrefixWeb + s.substring(currentConfig.pathPrefixLength);
                    });

            })
            .then(function() {
                if (!convertedEntries) {
                    logger.error("no convertedEntries found after convertEntries!");
                    throw "no convertedEntries found after convertEntries!";
                }
                scripts2TagEntries(convertedEntries);
                if (done) {
                    done();
                }
            })
            .catch(function(walkErr) {
                logger.error(walkErr);
                if (done) {
                    done();
                }
            });
    }


    grunt.task.registerTask('rawjs',
        function(subtask1, subtask2) {
            go([subtask1, subtask2], grunt.task.current.async());
        });

    return {};
}