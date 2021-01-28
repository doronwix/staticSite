module.exports.tasks = {
    maxFilesize: {
        css: {
            options: {
                maxBytes: 921600 // 900 KB
            },
            src: [
                '../assets/<%= grunt.config.get("currentVersion") %>/Skins/**/*.css'
            ]
        }
    }
};