define("modules/environmentData", [], function EnvironmentDataDef() {
	var environmentData = {};

	return {
		get: function () {
			return environmentData;
		},

		set: function (ed) {
			Object.assign(environmentData, ed);
		},
	};
});
