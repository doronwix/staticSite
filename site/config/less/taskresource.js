var resource = require('./resource');
var helper = require('./helper');

var defBrokers = helper.config.defaultBrokers,
    arrBrokers = helper.config.brokers,
    brokerTree = helper.config.brokerTree,
    ucFirst = helper.ucFirst,
    eApps = helper.config.app,
    eThemes = helper.config.themes,
    languages = helper.config.languages,
    arrThemes = Object.keys(eThemes),
    arrApps = Object.keys(eApps);

var defaultLang = 'English',
    chartFiles = {},
    componentFilesWeb = {},
    mobileInternal = {},
    mobileInternalByLang = {},
    webInternal = {},
    webInternalByLang = {},
    InternalFiles = {},
    InternalFilesByLang = {},
    themedExternalFiles = {},
    themedExternalFilesByLang = {},
    ExternalFiles = {},
    ExternalFilesByLang = {},
    defaultTasks = {
        nativeAppCss: resource.nativeAppFiles,
        scmmFiles: resource.scmmFiles,
        staticBroker1: resource.getBrStaticFiles(1),
        staticBroker3: resource.getBrStaticFiles(3)
    },
    themedTasks = {
        externalPages: resource.getExternalFiles,
        layouts: resource.getLayoutsFiles,
        vendor: resource.getJqueryFiles,
        splashScreen: function () { }
    };



defBrokers.forEach(function (defaultBrokerId) {
    brokerTree[defaultBrokerId].forEach(function (brokerId) {
        componentFilesWeb[brokerId] = {};

        languages.forEach(function (language) {
            componentFilesWeb[brokerId][language] = {};

            arrThemes.forEach(function (theme) {
                var files = resource.getComponentsFiles(eApps.web, brokerId, language, theme);
                var resultArray = typeof componentFilesWeb[brokerId][language][theme] !== 'undefined' ?
                    componentFilesWeb[brokerId][language][theme] : [];
                    resultArray.push(files);
                    componentFilesWeb[brokerId][language][theme] = resultArray;
            });
        });
    });
});

arrThemes.forEach(function (theme) {
    chartFiles[theme] = [];
    mobileInternal[theme] = [];
    mobileInternalByLang[theme] = [];
    webInternal[theme] = [];
    webInternalByLang[theme] = [];
    InternalFiles[theme] = [];
    InternalFilesByLang[theme] = [];
    themedExternalFiles[theme] = [];
    themedExternalFilesByLang[theme] = [];
    ExternalFiles[theme] = [];
    ExternalFilesByLang[theme] = [];
});

var TASKS = {},
    COMPOSEDTASKS = {},
    CONCURENTTASKS = [];

arrBrokers.forEach(function (BrokerId) {
    arrThemes.forEach(function (theme) {
        mobileInternal[theme].push(resource.getMBrFiles(BrokerId, theme));
        webInternal[theme].push(resource.getWBrFiles(BrokerId, theme));

        mobileInternalByLang[theme].push(resource.getMBrFiles(BrokerId, theme, defaultLang));
        webInternalByLang[theme].push(resource.getWBrFiles(BrokerId, theme, defaultLang));
    });
});

arrThemes.forEach(function (theme) {
    Object.keys(themedTasks).forEach(function (task) {
        var getTaskFiles = themedTasks[task];

        if (task === 'splashScreen') {
            mobileInternal[theme].push(resource.getSplashScreenFilesMobile(theme));
            webInternal[theme].push(resource.getSplashScreenFilesWeb(theme));
            mobileInternalByLang[theme].push(resource.getSplashScreenFilesMobile(theme, defaultLang));
            webInternalByLang[theme].push(resource.getSplashScreenFilesWeb(theme, defaultLang));
        } else if (task === 'vendor') {
            var taskFiles = getTaskFiles(theme),
                langTaskFiles = getTaskFiles(theme, defaultLang);

            mobileInternal[theme].push(taskFiles);
            webInternal[theme].push(taskFiles);
            mobileInternalByLang[theme].push(langTaskFiles);
            webInternalByLang[theme].push(langTaskFiles);
        } else {
            themedExternalFiles[theme].push(getTaskFiles(theme));
            themedExternalFilesByLang[theme].push(getTaskFiles(theme, defaultLang));
        }
    });
    
    defBrokers.forEach(function (defBrokerId) {
        var files = resource.getChartFiles(theme, defBrokerId);

        chartFiles[theme].push(files);
        mobileInternal[theme].push(files);
        webInternal[theme].push(files);
        mobileInternalByLang[theme].push(files);
        webInternalByLang[theme].push(files);

    });

    arrBrokers.forEach(function (BrokerId) {
        mobileInternal[theme].push(resource.getMBrFiles(BrokerId, theme));
        webInternal[theme].push(resource.getWBrFiles(BrokerId, theme));

        mobileInternalByLang[theme].push(resource.getMBrFiles(BrokerId, theme, defaultLang));
        webInternalByLang[theme].push(resource.getWBrFiles(BrokerId, theme, defaultLang));
    });
});

arrThemes.forEach(function (theme) {
    ExternalFiles[theme] = [defaultTasks.staticBroker1, defaultTasks.staticBroker3].concat(themedExternalFiles[theme]);
    ExternalFilesByLang[theme] = [defaultTasks.staticBroker1, defaultTasks.staticBroker3].concat(themedExternalFilesByLang[theme]);
    InternalFiles[theme] = [].concat(mobileInternal[theme], webInternal[theme]);
    InternalFilesByLang[theme] = [].concat(mobileInternalByLang[theme], webInternalByLang[theme]);
});

TASKS.watch = helper.getTaskConfig(
    helper.getFiles(),
    {
        sourceMap: true,
        compress: true,
        sourceMapURL: 'style.' + helper.lessConfig.theme + '.css.map',
        sourceMapRootpath: '/webpl3/Skins/',
        modifyVars: { theme: '"' + helper.lessConfig.theme + '"' }
    }
);

Object.keys(defaultTasks).forEach(function (task) {
    TASKS[task] = helper.getTaskConfig(
        [defaultTasks[task]],
        { modifyVars: { theme: '"' + eThemes.light + '"' } }
    );
    CONCURENTTASKS.push('less:' + task);
});

COMPOSEDTASKS['less:componentsweb'] = [];


defBrokers.forEach(function (defaultBrokerId) {
    brokerTree[defaultBrokerId].forEach(function (brokerId) {
        var composedBrTask = 'less:componentsweb' + brokerId;
        COMPOSEDTASKS[composedBrTask] = [];

        languages.forEach(function (language) {
            var composedBrLangTask = 'less:componentsweb' + brokerId + language;
            COMPOSEDTASKS[composedBrLangTask] = [];

            arrThemes.forEach(function (theme) {
                var taskName = 'componentsweb' + brokerId + language + theme;
                TASKS[taskName] = helper.getTaskConfig(
                    [componentFilesWeb[brokerId][language][theme]],
                    { modifyVars: {
                            language: '"' + language + '"',
                            theme: '"' + theme + '"',
                            direction: '"' + helper.getLangDirection(language) + '"',
                            defaultBrokerId: defaultBrokerId 
                        } 
                    }
                );
                COMPOSEDTASKS[composedBrLangTask].push('less:' + taskName);
            });
            COMPOSEDTASKS[composedBrTask].push(composedBrLangTask);
        });
        COMPOSEDTASKS['less:componentsweb'].push(composedBrTask);
    });
});

arrThemes.forEach(function (theme) {
    // DEPLOY THEMED TASKS
    TASKS['deployDev' + theme] = helper.getTaskConfig(
        [InternalFiles[theme], ExternalFiles[theme]],
        {
            sourceMap: true,
            compress: false,
            modifyVars: { theme: '"' + theme + '"' }
        }
    );
    TASKS['deployQA' + theme] = helper.getTaskConfig(
        [InternalFiles[theme], ExternalFiles[theme]],
        {
            sourceMap: true,
            compress: true,
            modifyVars: { theme: '"' + theme + '"' }
        }
    );

    TASKS['deployDevEnglish' + theme] = helper.getTaskConfig(
        [InternalFilesByLang[theme], ExternalFilesByLang[theme]],
        {
            sourceMap: false,
            compress: true,
            modifyVars: { theme: '"' + theme + '"' }
        }
    );
    TASKS['deployQAEnglish' + theme] = helper.getTaskConfig(
        [InternalFilesByLang[theme], ExternalFilesByLang[theme]],
        {
            sourceMap: true,
            compress: true,
            modifyVars: { theme: '"' + theme + '"' }
        }
    );

    TASKS['chart' + theme] = helper.getTaskConfig(
        chartFiles[theme],
        { modifyVars: { theme: '"' + theme + '"' } }
    );

    // THEMED TASKS
    Object.keys(themedTasks).forEach(function (task) {
        var getTaskFiles = themedTasks[task];
        if (task !== 'splashScreen') {
            TASKS[task + theme] = helper.getTaskConfig(
                [getTaskFiles(theme)],
                { modifyVars: { theme: '"' + theme + '"' } }
            );
        } else {
            TASKS[task + ucFirst(eApps.mobile) + theme] = helper.getTaskConfig(
                [resource.getSplashScreenFilesMobile(theme)],
                { modifyVars: { theme: '"' + theme + '"' } }
            );

            TASKS[task + ucFirst(eApps.web) + theme] = helper.getTaskConfig(
                [resource.getSplashScreenFilesWeb(theme)],
                { modifyVars: { theme: '"' + theme + '"' } }
            );
        }
    });

    arrApps.forEach(function (App) {
        arrBrokers.forEach(function (BrokerId) {
            var taskName = App + 'Broker' + BrokerId + theme,
                getFiles = App === eApps.mobile ? resource.getMBrFiles :
                    resource.getWBrFiles;

            TASKS[taskName] = helper.getTaskConfig(
                [getFiles(BrokerId, theme)],
                { modifyVars: { theme: '"' + theme + '"' } }
            );
        });
    });
});

COMPOSEDTASKS['less:deployDev'] = [
    'less:deployDev' + eThemes.light,
    'less:deployDev' + eThemes.dark
];

COMPOSEDTASKS['less:deployDevEnglish'] = [
    'less:deployDevEnglish' + eThemes.light,
    'less:deployDevEnglish' + eThemes.dark,
    'less:componentsweb1English',
    'less:componentsweb2English',
    'less:componentsweb3English',
    'less:componentsweb6English',
    'less:componentsweb33English',
    'less:componentsweb108English'
];

COMPOSEDTASKS['less:deployQA'] = [
    'less:deployQA' + eThemes.light,
    'less:deployQA' + eThemes.dark
];

COMPOSEDTASKS['less:deployQAEnglish'] = [
    'less:deployQAEnglish' + eThemes.light,
    'less:deployQAEnglish' + eThemes.dark
];

COMPOSEDTASKS['less:chart'] = [
    'less:chart' + eThemes.light,
    'less:chart' + eThemes.dark
];


CONCURENTTASKS.push('less:chart');
CONCURENTTASKS.push('less:componentsweb');

arrBrokers.forEach(function (BrokerId) {
    var mTaskName = eApps.mobile + 'Broker' + BrokerId,
        wTaskName = eApps.web + 'Broker' + BrokerId;

    COMPOSEDTASKS['less:' + mTaskName] = [
        'less:' + mTaskName + eThemes.light,
        'less:' + mTaskName + eThemes.dark
    ];
    COMPOSEDTASKS['less:' + wTaskName] = [
        'less:' + wTaskName + eThemes.light,
        'less:' + wTaskName + eThemes.dark
    ];
    CONCURENTTASKS.push('less:' + mTaskName);
    CONCURENTTASKS.push('less:' + wTaskName);
});

Object.keys(themedTasks).forEach(function (task) {
    var taskName = 'less:' + task;

    if (task !== 'splashScreen') {
        CONCURENTTASKS.push(taskName);
        COMPOSEDTASKS[taskName] = [
            taskName + eThemes.light,
            taskName + eThemes.dark
        ];
    } else {
        taskName = 'less:' + task + ucFirst(eApps.mobile);
        CONCURENTTASKS.push(taskName);
        COMPOSEDTASKS[taskName] = [
            taskName + eThemes.light,
            taskName + eThemes.dark
        ];

        taskName = 'less:' + task + ucFirst(eApps.web);
        CONCURENTTASKS.push(taskName);
        COMPOSEDTASKS[taskName] = [
            taskName + eThemes.light,
            taskName + eThemes.dark
        ];
    }
});

module.exports = {
    lessTasks: {
        less: TASKS,
        concurrent: {
            less: {
                tasks: CONCURENTTASKS,
                options: { logConcurrentOutput: true, compress: true }
            },
            lessDevEnglish: {
                tasks: COMPOSEDTASKS['less:deployDevEnglish'],
                options: { logConcurrentOutput: true, compress: true }
            }
        }
    },
    composedLessTasks: COMPOSEDTASKS
};
