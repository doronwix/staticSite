var app = {
        mobile: 'mobile',
        web: 'web'
    },
    themes = {
        light: 'light',
        dark: 'dark'
    },
    directions = {
        ltr: 'ltr',
        rtl: 'rtl'
    },
    languages = ['Arabic', 'Chinese', 'Czech', 'Dutch', 'English', 'Filipino', 'Francais', 'German', 'Greek', 'Hebrew', 'Hindi', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Malay', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Spanish', 'Swedish', 'Thai', 'Turkish'],
    defaultBrokers = [0, 107, 150],
    brokers = [0, 1, 2, 3, 6, 33, 107, 108, 150],
    brokerTree = {
        0: [1, 2, 6],
        107: [108],
        150: [3, 33]
    },
    getLangDirection = function (language) {
        return ['Arabic', 'Hebrew'].indexOf(language) !== -1 ? directions.rtl : directions.ltr;
    },
    workingDir,
    lessConfig;

var ucFirst = function (str) {
    return str[0].toUpperCase() + str.slice(1);
};

/**
 * Change those paths depending on what broker/Language you are working on
 * More details - http://wiki.iforexdev.com/wiki/14/grunt-utilities
 */
lessConfig = {
    platform: ucFirst(app.web),
    brokerId: 1,
    language: 'English',
    chartsOnly: 0,
    theme: themes.light,
    nativeOnly: {
        compile: 0,
        platform: 'native-ios' //change it to native-android when needed
    }
};

lessConfig.fileName = (lessConfig.platform === 'Mobile' || lessConfig.brokerId !== 0) ? 'style' : 'Layout';
lessConfig.lessDir = (defaultBrokers.indexOf(lessConfig.brokerId) != -1 && lessConfig.platform === 'Web') ? '/less' : '';

lessConfig.cssPath = '/Broker' + lessConfig.brokerId + '/' + lessConfig.language + '/' + lessConfig.fileName + '.' + lessConfig.theme + '.css';
lessConfig.lessPath = '/Broker' + lessConfig.brokerId + '/' + lessConfig.language + lessConfig.lessDir + '/' + lessConfig.fileName + '.less';

if (lessConfig.chartsOnly === 1) {
    lessConfig.cssPath = '/AllBrokers/Default/chart-customization.' + lessConfig.theme + '.css';
    lessConfig.lessPath = '/AllBrokers/Default/chart-customization' + lessConfig.theme + '.less';
}

if (lessConfig.nativeOnly.compile === 1) {
    lessConfig.cssPath = 'AllBrokers/Default/' + lessConfig.nativeOnly.platform + '.css';
    lessConfig.lessPath = 'AllBrokers/Default/' + lessConfig.nativeOnly.platform + '.less';
}

workingDir = {
    cssPath: lessConfig.nativeOnly.compile ?
        '../assets/<%= grunt.config.get("currentVersion") %>/Skins/Native/AllBrokers/Default/' + lessConfig.nativeOnly.platform + '.css' :
        '../assets/<%= grunt.config.get("currentVersion") %>/Skins/' + lessConfig.platform + lessConfig.cssPath,
    lessPath: lessConfig.nativeOnly.compile ?
        '../Skins/Native/' + lessConfig.lessPath :
        '../Skins/' + lessConfig.platform + lessConfig.lessPath
};

var helper = {
    config: {
        brokerTree: brokerTree,
        brokers: brokers,
        defaultBrokers: defaultBrokers,
        directions: directions,
        app: app,
        themes: themes,
        languages: languages
    },
    getLangDirection: getLangDirection,
    lessConfig: lessConfig,
    workingDir: workingDir,
    getFiles: function () {
        var files = {};
        files[workingDir.cssPath] = workingDir.lessPath;
        return files;
    },
    /* !PAY ATTENTION - check places where 'getTaskConfig' is already called
    // getTaskConfig expects 'files' to be Array
    //*/
    getTaskConfig: function (files, opts) {
        var options = { sourceMap: false, compress: true };
        opts = opts || {};
        Object.assign(options, opts);

        return {
            options: options,
            files: files
        };
    },
    ucFirst: ucFirst
};

module.exports = helper;