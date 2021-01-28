/**
    * clean 
    * 1. version file
    * 2. bundles
    */
module.exports.tasks = {
    clean: {
        options: {
            force: true,
            'no-write': false
        },

        version: ['../scripts/fxnet/common/utils/version/*'],
        js: ['../assets/<%= grunt.config.get("currentVersion") %>/js/**'],
        temp: ['./config/temp/*.*']
    }
};