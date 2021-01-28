define(
    "dataaccess/Backoffice/dalWireTransfer",
    [
        "require",
        'JSONHelper'
    ],
    function () {
        var JSONHelper = require('JSONHelper'),
            self = {},
            callerInfo = "dalWireTransfer",
            baseUrl = "api/backoffice/wiretransfer/";

        function onDalAjaxError(error) {
            ErrorManager.onError(callerInfo, error.message, eErrorSeverity.medium);
        }

        self.getWireTransferInfos = function () {
            var url = baseUrl + "getwiretransferinfos/";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalWireTransfer:getWireTransferInfos", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getWireTransferBanks = function () {
            var url = baseUrl + "getwiretransferbanks/";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalWireTransfer:getWireTransferBanks", response);
                })
                .fail(onDalAjaxError);
        };

        self.insertWireTransferCanceledRequest = function (wireTransferInfo) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, baseUrl + "insertwiretransfercanceledrequest", JSON.stringify(wireTransferInfo))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalWireTransfer:insertWireTransferCanceledRequest", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.saveWireTransferComment = function (wireTransferId, wireTransferComment) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, baseUrl + "savewiretransfercomment", JSON.stringify({ WireTransferId: wireTransferId, WireTransferComment: wireTransferComment }))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalWireTransfer:saveWireTransferComment", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.saveWireTransfer = function (wireTransferInfo) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, baseUrl + "saveWireTransfer", JSON.stringify(wireTransferInfo))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalWireTransfer:saveWireTransfer", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getBrokers = function () {
            var url = baseUrl + "getbrokers/";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalWireTransfer:getBrokers", response);
                })
                .fail(onDalAjaxError);
        };

        return self;
    });
