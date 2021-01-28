var helper = require('./helper'),
    eApps = helper.config.app,
    defBrokers = helper.config.defaultBrokers,
    staticVersion = 1,
    destinationFolder = '../assets/<%= grunt.config.get("currentVersion") %>/',
    staticDestinationFolder = '../assets/static_v' + staticVersion + '/';

var renameBrFiles = function (dest, src, theme) {
    var fileName = src.replace(/less\/style\.css$/i, 'style.css');

    fileName = fileName.replace('style.css', 'style.' + theme + '.css');

    return (dest + fileName).toLowerCase();
};

var normalizeThemedFilename = function (dest, src, theme) {
    src = src.replace('.css', '.' + theme + '.css');

    return (dest + src).toLowerCase();
};

var getSplashScreenFiles = function (App, theme, lang) {
    lang = lang ? `**/${lang}` : '**';

    return {
        expand: true,
        cwd: '../',
        src: [
            `Skins/${App}/${lang}/splash-screen.less`,
            '!Skins/' + App + '/AllBrokers/**/*.less',
            '!Skins/' + App + '/Broker0/**/*.less', // iforex
            '!Skins/' + App + '/Broker107/**/*.less',
            '!Skins/' + App + '/Broker150/**/*.less'
        ], // fxmarker
        ext: '.css',
        dest: destinationFolder,
        rename: function (dest, src) {
            var fileName = src.replace(/less\/splash-screen\.css$/i, 'splash-screen.css');

            fileName = fileName.replace('splash-screen.css', 'splash-screen.' + theme + '.css');

            return (dest + fileName).toLowerCase();
        }
    };
};

var resource = {
    destinationFolder: destinationFolder,
    nativeAppFiles: {
        expand: true,
        cwd: '../',
        src: [
            'Skins/Native/AllBrokers/Default/native-android.less',
            'Skins/Native/AllBrokers/Default/native-ios.less'
        ],
        ext: '.css',
        dest: destinationFolder,
        rename: function (dest, src) {
            var fileName = src.replace(/.less$/i, '.css');

            return (dest + fileName).toLowerCase();
        }
    },
    scmmFiles: {
        expand: true,
        cwd: '../',
        src: [
            'Skins/Shared/backoffice/scmm/style.less'
        ],
        ext: '.css',
        dest: destinationFolder,
        rename: function (dest) {
            var src = 'Skins/Shared/backoffice/scmm/style.less',
                fileName = src.replace(/style\.less$/i, 'scmm.css');
            return (dest + fileName).toLowerCase();
        }
    },
    getComponentsFiles: function (App, brokerId, language, theme) {
       return {
            expand: true,
            cwd: '../',
            src: [`Skins/${App}/Broker${brokerId}/${language}/components/*.less`],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                return normalizeThemedFilename(dest, src, theme);
            }
        };
    },
    getChartFiles: function (theme, defBrokerId) {
        return {
            expand: true,
            cwd: '../',
            src: ['Skins/Web/Broker' + defBrokerId + '/Default/chart.less',
                'Skins/Mobile/Broker' + defBrokerId + '/Default/chart.less'],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                return normalizeThemedFilename(dest, src, theme);
            }
        };
    },
    getExternalFiles: function (theme) {
        return {
            expand: true,
            cwd: '../',
            src: [
                'Skins/Web/AllBrokers/Default/external-pages.less'
            ],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                return normalizeThemedFilename(dest, src, theme);
            }
        }
    },
    getJqueryFiles: function (theme) {
        return {
            expand: true,
            cwd: '../',
            src: [
                'Skins/Web/AllBrokers/Default/jquery.less'
            ],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                return normalizeThemedFilename(dest, src, theme);
            }
        };
    },
    getLayoutsFiles: function (theme, lang) {
        lang = lang ? lang : '*';

        return {
            expand: true,
            cwd: '../',
            src: [
                `Skins/Web/Broker0/${lang}/less/Layout.less`,
                '!Skins/Web/Broker0/Default/**',
                `Skins/Web/Broker107/${lang}/less/Layout.less`,
                '!Skins/Web/Broker107/Default/**',
                `Skins/Web/Broker150/${lang}/less/Layout.less`,
                '!Skins/Web/Broker150/Default/**'
            ],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                var fileName = src.replace(/less\/layout\.css$/i, 'layout.css');

                fileName = fileName.replace('.css', '.' + theme + '.css');

                return (dest + fileName).toLowerCase();
            }
        };
    },
    getMBrFiles: function (brokerId, theme, lang) {
        lang = lang ? lang : '*';

        return {
            expand: true,
            cwd: '../',
            src: [
                `Skins/Mobile/Broker${brokerId}/${lang}/style.less`,
                '!Skins/Mobile/Broker' + brokerId + '/Default/**'
            ],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                return renameBrFiles(dest, src, theme);
            }
        };
    },
    getWBrFiles: function (brokerId, theme, lang) {
        lang = lang ? lang : '*';

        return {
            expand: true,
            cwd: '../',
            src: [
                `Skins/Web/Broker${brokerId}/${lang}/style.less`,
                '!Skins/Web/Broker' + brokerId + '/Default/**'
            ],
            ext: '.css',
            dest: destinationFolder,
            rename: function (dest, src) {
                return renameBrFiles(dest, src, theme);
            }
        };
    },
    getBrStaticFiles: function (brokerId) {
        return {
            expand: true,
            cwd: '../',
            src: [
                'Skins/Static_v' + staticVersion + '/Broker' + brokerId + '/ingenico.less'
            ],
            ext: '.css',
            dest: staticDestinationFolder + 'broker' + brokerId,
            flatten: true
        };
    },
    getSplashScreenFilesMobile: function (theme, lang) {
        return getSplashScreenFiles(eApps.mobile, theme, lang);
    },
    getSplashScreenFilesWeb: function (theme, lang) {
        return getSplashScreenFiles(eApps.web, theme, lang);
    }
};

module.exports = resource;
