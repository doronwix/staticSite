module.exports.tasks = {
    browserSync: {
        dev: {
            bsFiles: {
                src: ['../Skins/Web/**/*.css']
            },
            options: {
                watchTask: true
            }
        }
    }
};
