module.exports.tasks = {
    watch: {
        options: {
            livereload: '<%= connect.options.livereload %>',
            spawn: false,
            interrupt: true
        },
        less: {
            files: [
                '../Skins/Web/**/*.less',
                '../Skins/Mobile/**/*.less',
                '../Skins/Native/**/*.less',
                '../Skins/**/img/**',
                '../Skins/**/fonts/**'
            ],
            tasks: [
                'less:watch',
                'maxFilesize:css',
                'lesshint:watch'
            ]
        },
        js: {
            tasks: [
                'requirejs'
            ],
            files: [
                '../Scripts/**/*.js',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Vendor/**/*.js',
                '!../Scripts/Advinion/**/*.js',
                '!../Scripts/Registration/**/*.js'
            ]
        },
        jslight: {
            tasks: [
                'replace:html',
                'concurrent:copy',
                'concat',
                'bundles',
                'requirejs',
                'eslint:fxnet'
            ],
            files: [
                '../Scripts/**/*.js',
                '../nodeutils/**/*.js',
                '../rootHtmls/**/*.html',
                '../Scripts/**/*.html',
                '../TestJS/**/*.js',
                '../**/*.aspx',
                './config/bundles-config.json',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Vendor/**/*.js',
                '!../Scripts/Advinion/**/*.js',
                '!../Scripts/Registration/**/*.js'
            ]
        },
        eslint: {
            files: [
                '../Scripts/**/*.js',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Vendor/**/*.js',
                './config/bundles-config.json'
            ],
            tasks: [
                'newer:eslint:fxnet'
            ]
        },
        nodeUtilslint: {
            tasks: [
                'newer:eslint:nodeUtils'
            ],
            files: [
                'config/*.js',
                '.*.js'
            ]
        },
        uglify: {
            tasks: [
                'concatLocalConcurrent',
                'bundles'
            ],
            files: [
                '../Scripts/**/*.js',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Vendor/**/*.js',
                './config/bundles-config.json',
                '../scripts/fxnet/common/utils/version/version.txt',
                '../scripts/fxnet/common/utils/version/*'
            ]
        },
        uglify_mobile_only: {
            tasks: [
                'uglify:mobilemain.js-local',
                'uglify:preloader.js-local',
                'bundles'
            ],
            files: [
                '../Scripts/**/*.js',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Vendor/**/*.js',
                './config/bundles-config.json',
                '../scripts/fxnet/common/utils/version/version.txt',
                '../scripts/fxnet/common/utils/version/*'
            ]
        },
        uglify_web_only: {
            tasks: [
                'uglify:main.js-local',
                'uglify:preloader.js-local',
                'bundles'
            ],
            files: [
                '../Scripts/**/*.js',
                '!../Scripts/Services/**/*.js',
                '!../Scripts/Vendor/**/*.js',
                './config/bundles-config.json',
                '../scripts/fxnet/common/utils/version/version.txt',
                '../scripts/fxnet/common/utils/version/*'
            ]
        },
        duplicates: {
            tasks: [
                'jsinspect:vm'
            ],
            files: [
                '../Scripts/FxNet/UILayer/ViewModels/**/*.js',
                '../Scripts/FxNet/Devices/Mobile/UILayer/ViewModels/**/*.js',
                '../Scripts/FxNet/Devices/Web/UILayer/ViewModels/**/*.js',
                '../Scripts/FxNet/Devices/Desktop/UILayer/ViewModels/**/*.js'
            ]
        }
    }
};