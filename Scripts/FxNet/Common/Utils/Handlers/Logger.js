var Logger = function (dalCommon) {
    return {
        log: function log(source, message, callback, severity) {
            severity = severity || eErrorSeverity.medium;

            dalCommon
                .AddLog(source, message)
                .then(callback)
                .done();
        },
        info: function info(source, message, callback) {
            dalCommon.AddInfo(source, message)
                .then(callback)
                .done();
        },
        warn: function warn(source, message, callback, severity) {
            severity = severity || eErrorSeverity.warning;

            dalCommon
                .AddWarning(source, message)
                .then(callback)
                .done();
        },
        error: function error(source, message, callback, severity) {
            severity = severity || eErrorSeverity.low;

            dalCommon
                .AddLog(source, message)
                .then(callback)
                .done();
        }
    }
};
