//duplicate code identifier
//https://github.com/danielstjules/jsinspect#usage
//https://www.npmjs.com/package/grunt-jsinspect
// config file: .jsinspectrc
module.exports.tasks = {
	jsinspect: {
		all: {
			options: {
				failOnMatch: true,
				outputPath: null,
				reporter: "default"
			},
			src: [
				'../Scripts/FxNet/**/*.js'
			]
		},
		vm: {
			options: {
				failOnMatch: false,
				outputPath: null,
				reporter: "default"
			},
			src: [
				'../Scripts/FxNet/UILayer/ViewModels/**/*.js',
				'../Scripts/FxNet/Devices/Mobile/UILayer/ViewModels/**/*.js',
				'../Scripts/FxNet/Devices/Web/UILayer/ViewModels/**/*.js',
				'../Scripts/FxNet/Devices/Desktop/UILayer/ViewModels/**/*.js'
			]
		},
		output: {
			options: {
				failOnMatch: true,
				outputPath: "output/inspect.results.json",
				reporter: "json"
			},
			src: [
				'../Scripts/FxNet/UILayer/Managers/**/*.js'
			]
		}
	}
};