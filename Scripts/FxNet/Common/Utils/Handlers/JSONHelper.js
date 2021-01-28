/*global eErrorSeverity */
define(
    "JSONHelper",
    [
        "handlers/Logger",
        "handlers/general"
    ],
    function (logger, general) {
        function JSONHelperClass() {
            function strToJson(callerName, jsonString, errorSeverity, onErrorCallback) {
                if (!general.isDefinedType(jsonString) ||
                    general.isNumberType(jsonString) ||
                    jsonString == '') {
                    return null;
                }

                if (general.isObjectType(jsonString)) {
                    return jsonString;
                }

                if (general.isNumber(jsonString)) {
                    return Number(jsonString);
                }

                // default severity is 'high'- if severity is not given the severity is high
                errorSeverity = errorSeverity || eErrorSeverity.medium;

                try {
                    return JSON.parse(jsonString);
                } catch (err) {
                    var msgJson = JSON.stringify({
                        error: "JSONHelper.STR2JSON threw an exception",
                        name: err.name,
                        message: err.message,
                        str: jsonString,
                        stack: err.stack
                    }, null, 4);

                    logger.log(callerName, msgJson, onErrorCallback, errorSeverity);

                    return null;
                }
            }

            function isValid(jsonString) {
                if (!jsonString ||
                    !general.isStringType(jsonString)) {
                    return false;
                }

                if (general.isNumber(jsonString)) {
                    return true;
                }

                if (jsonString.indexOf('[') < 0 &&
                    jsonString.indexOf('{') < 0) {
                    return false;
                }

                try {
                    return !!JSON.parse(jsonString);
                } catch (e) {
                    return false;
                }
            }

            return {
                STR2JSON: strToJson,
                IsValid: isValid
            };
        }

        JSONHelper = new JSONHelperClass();

        return JSONHelper;
    }
);

