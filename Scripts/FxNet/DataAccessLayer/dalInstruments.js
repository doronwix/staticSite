/* global UrlResolver */
var TDALInstruments = function (ajaxer, jsonHelper, general, logger) {
    var _ajaxer = ajaxer;

    function getScheduleGroup(instrumentId) {
        var action = "schgrp" + instrumentId;
        var url = UrlResolver.getStaticResourcePath(action);

        return _ajaxer.promises
            .get("TDALInstruments/getScheduleGroup", url, "", null, null, null, null, null, false)
            .then(processResponse)
            .fail(onGetScheduleGroupError);
    }

    function changeUiOrder(uiOrder, onLoadComplete) {
        uiOrder = uiOrder || [];

        _ajaxer.promises
            .jsonPost(
                "dalCommon/ChangeUIOrder",
                "api/customer/ChangeUIOrder",
                JSON.stringify(uiOrder.join("|"))
            )
            .then(onLoadComplete).fail(
                function (error) {
                    ErrorManager.onError("TdalCommon/ChangeUIOrder", error.message, eErrorSeverity.low);
                }
            );
    }

    function getPresets(args) {
        // "fu12-s12-fo67-br3.js";
        var action = "";

        action += "fu" + args.futuresPermission;
        action += "-s" + args.stocksPermission;
        action += "-fo" + args.folderId;
        action += "-br" + args.brokerId;

        var url = UrlResolver.getStaticJSActionPath("Presets", action);

        return _ajaxer.promises
            .get("TDALInstruments/getPresets", url, null, null, null, null, null, null, false) //try 5 times before failing
            .progress(onProgress)
            .then(processResponse)
            .fail(function (error) {
                return onFirstFailReportAndGoToOrigin(error, url);
            });
    }

    function onFirstFailReportAndGoToOrigin(error, url) {
        ErrorManager.onError("TDALInstruments/getPresets", error.message, eErrorSeverity.medium);

        return _ajaxer.promises
            .get("TDALInstruments/getPresets from origin", url)
            .progress(onProgress)
            .then(processResponse)
            .fail(onGetPresetsError);
    }

    function processResponse(responseText) {
        return jsonHelper.STR2JSON("dalInstruments:processResponse", responseText);
    }

    function onGetPresetsError(error) {
        return onError("TDALInstruments/getPresets", error);
    }

    function onGetScheduleGroupError(error) {
        return onError("TDALInstruments/getScheduleGroup", error);
    }

    function onError(methodName, error) {
        ErrorManager.onError(methodName, error.message, eErrorSeverity.medium);

        throw error;
    }

    function onProgress(status) {
        status = status || {};
        status.State = status.State || eAjaxerState.None;

        if (status.State === eAjaxerState.Retry && general.isDefinedType(Logger)) {
            var warningMessage = "Client cache has expired - retried: " + JSON.stringify(status);

            logger.warn("TDALInstruments", warningMessage, general.emptyFn, eErrorSeverity.warning);
        }
    }

    return {
        ChangeUIOrder: changeUiOrder,
        GetPresets: getPresets,
        GetScheduleGroup: getScheduleGroup
    };
};