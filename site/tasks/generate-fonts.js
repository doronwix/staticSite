module.exports = function(grunt) {
	const pipeline = require('icomoon-cli');
	const utils = require('../utils/utils');

	 grunt.registerTask('generate-fonts', function() {
			const done = this.async();
			
			function processTask() {
				const svgPath = grunt.option('svgPath');
				const svgIcons = utils.readIconsPath(svgPath);

				return pipeline({
					icons: svgIcons,
					selectionPath: '../Skins/Shared/fonts/instruments/instruments.json',
					outputDir: 'icomoon-dist',
					forceOverride: true,
					visible: false,		
					whenFinished () {
						done();
					}									
				});
			}
	
			processTask();
	    });
}