module.exports.tasks = {
    sync: {
        chart: {
            expand: true,
            cwd: '../Scripts/AdvinionChart/',
            src: [
                '**'
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/js/Advinion/',
            pretend: false,
            failOnError: false,
            updateAndDelete: true
        },
        images: {
            expand: true,
            cwd: '../',
            src: [
                'Skins/**/img/**'
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/',
            pretend: false,
            failOnError: false,
            updateAndDelete: true
        },
        fonts: {
            expand: true,
            cwd: '../',
            src: [
                'Skins/**/fonts/**'
            ],
            dest: '../assets/<%= grunt.config.get("currentVersion") %>/',
            pretend: false,
            failOnError: false,
            updateAndDelete: true
        }
    },
    concurrent: {
        sync: {
            tasks: [
                'sync:chart',
                'sync:images',
                'sync:fonts'
            ],
            options: {
                logConcurrentOutput: true,
                compress: true
            }
        }
    }
};