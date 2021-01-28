var ErrorManager = function (Logger) {
    // Extend Error prototype
    Error.prototype.getFullExceptionMessage = function () {
        var self = this;

        var messageObj = {
            Message: self.message,
            StackTrace: (self.stack || '').replace(self.message, '').replace(/\n|\r\n/g, ' ').replace(/\s\s+/g, ' '),
            Path: window.location.pathname,
            UserAgent: window.navigator.userAgent
        };
        return JSON.stringify(messageObj);
    };
 
    function getFullMessage(source, errorMessage) {
        var messageObj = {
            Message: errorMessage,
            Source: source,
            UserAgent: window.navigator.userAgent
        };
        return JSON.stringify(messageObj);
    }

    function onException(msg, url, lineNumber, columnNumber, error) {
        if (isNullOrUndefined(error)) {
            return true;
        }

        handleUnknownException(msg, error);

        throw error;
    }

    var onError = function (source, errorMessage) {
        var loggedMessage = getFullMessage(source, errorMessage);
        Logger.log(source, loggedMessage);
    };

    function handleUnknownException(msg, error) {
        if (typeof Logger !== "undefined") {
            // log the UnknownError if the error is not in the blacklist
            var loggedMessage = (error && error.getFullExceptionMessage()) || msg;
            Logger.log("UnknownError", loggedMessage);
        }
    }

    function onWarning(source, warningMessage) {
        var loggedMessage = getFullMessage(source, warningMessage);
        Logger.warn(source, loggedMessage);
    }

    var getFullExceptionMessage = function (ex) {
        return ex.getFullExceptionMessage();
    };

    return {
        getFullExceptionMessage: getFullExceptionMessage,
        onError: onError,
        onWarning: onWarning,
        onException: onException
    };
}(Logger);

window.onerror = ErrorManager.onException;