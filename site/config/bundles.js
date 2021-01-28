module.exports.tasks = {
    bundles: {
        web: {
            src: [
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/web.require.config.js'
        },
        mobile: {
            src: [
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/mobile.require.config.js'
        },
        desktop: {
            src: [

            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/desktop.require.config.js'
        }
    },
    
    concurrent: {
        bundles: {
            tasks: [
                'bundles:web',
                'bundles:mobile',
                'bundles:desktop'
            ],
            options: {
            logConcurrentOutput: true,
            compress: true
                }
        }
    }
};