var Logger = (function (AjaxerExternal) {

    function log(source, message) {
        var params = JSON.stringify({
            loggedErrorString: JSON.stringify({ Location: source, Info: message })
        });

        AjaxerExternal.post("Error/ExternalLog", params);
    }

    function warn(source, warningMessage) {
        var params = JSON.stringify({
            loggedErrorString: JSON.stringify({ Location: source, Info: warningMessage })
        });

        AjaxerExternal.post("Error/ExternalWarn", params);
    }

    return {
        log: log,
        warn: warn
    }
})(AjaxerExternal);
