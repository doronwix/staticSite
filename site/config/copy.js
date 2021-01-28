module.exports.tasks = {
    copy: {
        chart: {
            files: [
                {
                    expand: true,
                    cwd: '../Scripts/AdvinionChartCustomizations/',
                    src: ['**'],
                    dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Scripts/AdvinionChartCustomizations/'
                }
            ]
        },
        chartVersionTest: {
            options: {
                process: function (content, srcpath) {
                    return content.replace('{', 'chartVersion = {');
                }
            },
            files: [
                {
                    expand: true,
                    cwd: '../Scripts/AdvinionChart/ChartCore/js/6.7.0/version/',
                    src: [
                        'prochart.version.json.js'
                    ],
                    dest: '../TestJS/Tests/Chart/',
                    filter: 'isFile'
                }
            ]
        },
        other: {
            files: [
                {
                    expand: true,
                    cwd: '../Scripts/FxNet/Common/Utils/Version',
                    src: [
                        'versionpci.require.js'
                    ],
                    dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/'
                }
            ]
        },
        images: {
            expand: true,
            cwd: '../',
            src: [
                'Skins/**/img/**',
                'Skins/Shared/**',
                '!Skins/Shared/less/**',
                '!Skins/Native/less/**',
                '!Skins/Shared/backoffice/**',
                '!Skins/Shared/fonts/selection.json'
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/'
        },
        fonts: {
            expand: true,
            cwd: '../',
            src: [
                'Skins/**/fonts/**'
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/'
        },
        'fx-core-api': {
            expand: true,
            cwd: 'node_modules/@cliotech/fx-core-api/dist/scripts/',
            src: ['**'],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/fx-core-api/'
        },
        'fx-chatbot': {
            expand: true,
            cwd: 'node_modules/@cliotech/fx-chatbot/dist/',
            src: ['**'],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/fx-chatbot/'
        },
        svgIcons: {
            files: [
                {
                    expand: true,
                    cwd: 'icomoon-dist/fonts/',
                    src: ['**'],
                    dest: '../Skins/Shared/fonts/instruments/'
                },
                {
                    expand: true,
                    cwd: 'icomoon-dist/',
                    src: [
                        'selection.json'
                    ],
                    dest: '../Skins/Shared/fonts/instruments/',
                    rename: function (dest, src) {
                        return dest + src.replace('selection', 'instruments');
                    }
                }
            ]
        },
        chatbot: {
            files: [
                {
                    expand: true,
                    cwd: '../Scripts/chatbot/',
                    src: ['**'],
                    dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/fx-chatbot/'
                }
            ]
        }
    },
    concurrent: {
        copy: {
            tasks: [
                'copy:other',
                'copy:images',
                'copy:fonts',
                'copy:fx-core-api',
                'copy:fx-chatbot',
                'copy:chatbot'
            ],
            options: {
                logConcurrentOutput: true,
                compress: true
            }
        }
    }
};
