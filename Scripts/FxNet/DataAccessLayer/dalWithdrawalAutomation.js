define(
    "dataaccess/dalWithdrawalAutomation",
    [
        'require',
        'JSONHelper',
        'handlers/general',
        'handlers/Ajaxer'
    ],
    function () {
        var JSONHelper = require('JSONHelper'),
            self = {},
            callerInfo = "dalWithdrawalAutomation",
            baseUrl = "api/backoffice/withdrawal/",
            general = require('handlers/general'),
            TAjaxer = require('handlers/Ajaxer');

        function onDalAjaxError(error) {
            ErrorManager.onError(callerInfo, error.message, eErrorSeverity.medium);
        }

        // public service api
        self.getWithdrawals = function (withdrawalId, successFn) {
            var url = baseUrl + "getWithdrawals/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.get(
                callerInfo,
                url,
                null,
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:getWithdrawals", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError,
                null, null, null, false
            );
        };

        self.getWithdrawalLines = function (withdrawalId, successFn) {
            var url = baseUrl + "getWithdrawalLines/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.get(
                callerInfo,
                url,
                null,
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:getWithdrawalLines", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError,
                null, null, null, false
            );
        };

        self.getNostroBanks = function (successFn) {
            var url = baseUrl + "getNostroBanks";
            var ajaxer = new TAjaxer();

            ajaxer.get(
                callerInfo,
                url,
                null,
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:getNostroBanks", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError,
                null, null, null, false
            );
        };

        self.saveComment = function (saveCommentRequest, succesFn) {
            var url = baseUrl + "saveComment/" + saveCommentRequest.WithdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(saveCommentRequest.Comment),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:saveComment", response);

                    if (general.isFunctionType(succesFn)) {
                        succesFn(serverModel, saveCommentRequest.Comment);
                    }
                },
                onDalAjaxError
            );
        };

        self.saveWithdrawalMethod = function (saveWithdrawalMethodRequest, successFn) {
            var url = baseUrl + "saveWithdrawalMethod/" + saveWithdrawalMethodRequest.WithdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(saveWithdrawalMethodRequest),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:saveWithdrawalMethod", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.failWithdrawalLines = function (withdrawalId, failWithdrawalLinesRequest, successFn) {
            var url = baseUrl + "splitFailingWithdrawalLines/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(failWithdrawalLinesRequest),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:failWithdrawalLines", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.succeedWithdrawalLines = function (withdrawalId, succeedWithdrawalLinesRequest, successFn) {
            var url = baseUrl + "succeedWithdrawalLines/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(succeedWithdrawalLinesRequest),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:succeedWithdrawalLines", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.resendWithdrawalLines = function (withdrawalId, resendWithdrawalLinesRequest, successFn) {
            var url = baseUrl + "resendWithdrawalLines/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(resendWithdrawalLinesRequest),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:resendWithdrawalLines", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };


        self.cancelPendingProcessingWithdrawal = function (withdrawalId, dto, withdrawalStatus, successFn) {
            var url = baseUrl + "cancelWithdrawal/" + withdrawalStatus + "/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(dto),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:cancelPendingProcessingWithdrawal", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.processWithdrawal = function (withdrawalId, withdrawalRequestDto, successFn) {
            var url = baseUrl + "processWithdrawal/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(withdrawalRequestDto),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:processWithdrawal", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.forceProcessWithdrawal = function (withdrawalId, successFn) {
            var url = baseUrl + "forceProcessWithdrawal/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                '',
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:forceProcessWithdrawal", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.rependCanceledWithdrawal = function (withdrawalId, withdrawalRequestDto, successFn) {
            var url = baseUrl + "rependCanceledWithdrawal/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(withdrawalRequestDto),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:rependCanceledWithdrawal", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.rependApprovedWithdrawal = function (withdrawalId, withdrawalRequestDto, successFn) {
            var url = baseUrl + "rependApprovedWithdrawal/" + withdrawalId;
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                callerInfo,
                url,
                JSON.stringify(withdrawalRequestDto),
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:rependApprovedWithdrawal", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                onDalAjaxError
            );
        };

        self.approveWithdrawal = function (withdrawalId, approveWithdrawalRequestDto) {
            var url = baseUrl + "approveWithdrawal/" + withdrawalId;
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .jsonPost(
                    callerInfo,
                    url,
                    JSON.stringify(approveWithdrawalRequestDto))
                .then(function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:approveWithdrawal", response);
                    return serverModel;
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        self.approveWithdrawalWithEquityConfirmation = function (withdrawalId, approveWithdrawalRequestDto) {
            var url = baseUrl + "approveWithdrawalWithEquityConfirmation/" + withdrawalId;
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .jsonPost(
                    callerInfo,
                    url,
                    JSON.stringify(approveWithdrawalRequestDto))
                .then(function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalWithdrawalAutomation:approveWithdrawalWithEquityConfirmation", response);
                    return serverModel;
                })
                .fail(function (error) {
                    onDalAjaxError(error);
                });
        };

        return self;
    }
);
