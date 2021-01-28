
module.exports.tasks = {
  uglify: {
      options: {
        mangle: false,
        compress: true 
      },

      applibtest: {
          files: [{
            expand: true,
            cwd: '../assets/<%= grunt.config.get("currentVersion") %>/js',
            src: '**/*.js',
            dest: 'dest/js'
          }]
    }
  }
}
