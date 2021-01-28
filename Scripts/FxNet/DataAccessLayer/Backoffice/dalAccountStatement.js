define("dataaccess/Backoffice/dalAccountStatement",
    [
        "require",
        'generalmanagers/ErrorManager',
        'JSONHelper'
    ],
    function () {
        var self = {},
            ErrorManager = require('generalmanagers/ErrorManager'),
            JSONHelper = require('JSONHelper'),
            callerInfo = "dalAccountStatement ",
            baseUrl = "api/backoffice/accountstatement/";

        function onDalAjaxError(error) {
            ErrorManager.onError(callerInfo, error.message, eErrorSeverity.medium);
        }

        self.getSymbols = function () {
            var url = baseUrl + "getsymbols/"; 
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getSymbols", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getCustomerBalances = function () {
            var url = baseUrl + "getcustomerbalances/";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getCustomerBalances", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.saveConvertBalance = function (convertBalance) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, baseUrl + "saveconvertbalance", JSON.stringify(convertBalance))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:saveConvertBalance", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getActionDetails = function (transactionId) {
            var url = baseUrl + "GetActionDetails";
            var ajaxer = new TAjaxer();
            var params = "transactionId=" + transactionId;

            return ajaxer.promises.get(callerInfo, url, params, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getActionDetails", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.saveConvertAccountLine = function (convertAccountLine) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, baseUrl + "saveConvertAccountLine", JSON.stringify(convertAccountLine))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getWithdrawals", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.deletePosition = function (data) {
            var url = baseUrl + "RestoreDeletePositionRequest";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, url, JSON.stringify(data))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:deletePosition", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.restorePosition = function (data) {
            var url = baseUrl + "RestorePositionRequest";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, url, JSON.stringify(data))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:restorePosition", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getLiquidityProvider = function () {
            var url = baseUrl + "GetLiquidityProvider";
            var ajaxer = new TAjaxer();


            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getLiquidityProvider", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getGeneralActionTypes = function () {
            var url = baseUrl + "GetGeneralActionTypes";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getGeneralActionTypes", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getAmendDepositActionTypes = function (requestId) {
            var url = baseUrl + "GetAmendDepositActionTypes?requestId=" + requestId;
            var ajaxer = new TAjaxer();

            return ajaxer.promises.post(callerInfo, url, null, null, null, null, null, null, false)
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getAmendDepositActionTypes", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.saveGeneralActions = function (data) {
            var url = baseUrl + "AccountAction";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, url, JSON.stringify(data))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:saveGeneralActions", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.saveAmendDeposit = function (data) {
            var url = baseUrl + "AmendDepositAction";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(callerInfo, url, JSON.stringify(data))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:saveAmendDeposit", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.getDefaultAmountValues = function (data) {
            var url = baseUrl + "GetDefaultAmountValues";
            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(callerInfo, url, JSON.stringify(data))
                .then(function (response) {
                    return JSONHelper.STR2JSON("dalAccountStatement:getDefaultAmountValues", response);
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        return self;
    });
