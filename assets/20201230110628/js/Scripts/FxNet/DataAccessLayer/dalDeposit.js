define(
    'dataaccess/dalDeposit',
    [
        'require',
        'global/UrlResolver',
        'handlers/general',
        'handlers/Ajaxer',
        'generalmanagers/ErrorManager'
    ],
    function DALDeposit(require) {
        var urlResolver = require('global/UrlResolver'),
            general = require('handlers/general'),
            Ajaxer = require('handlers/Ajaxer'),
            errorManager = require('generalmanagers/ErrorManager');

        function getUserDepositDetails() {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get(
                    "TDALDeposit/GetUserActions", "Payments/Deposit/GetUserActions", ""
                );
        }

        function getLastSuccesfullDepositCurrency() {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("TDALDeposit/GetLastSuccesfullDepositCurrency", "Payments/Deposit/GetLastSuccesfullDepositCurrency", "")
                .fail(function () {
                    errorManager.onError("TDALDeposit/GetLastSuccesfullDepositCurrency", "getLastSuccesfullDepositCurrency", eErrorSeverity.low);
                });
        }

        function getConcretePayments(selectedCountryId, userCountryId, brokerId) {
            var ajaxer = new Ajaxer(),
                action = 'ConcretePayments/' + 'co' + selectedCountryId + '-uco' + userCountryId + '-br' + brokerId,
                url = urlResolver.getStaticJSActionPath("Payments/Deposit", action);

            return ajaxer.promises
                .get(
                    "TDALDeposit/GetConcretePayments", url,
                    null, null, null, null, null, null, false
                );
        }

        function getPaymentCountries(brokerId, countryId) {
            var ajaxer = new Ajaxer(),
                action = 'Countries/br' + brokerId + 'c' + countryId,
                url = urlResolver.getStaticJSActionPath("Payments/Deposit", action);


            return ajaxer.promises
                .get("TDALDeposit/GetPaymentCountries", url,
                    null, null, null, 0, null, null, false)
                .fail(function () {
                    errorManager.onError("TDALDeposit/GetPaymentCountries", "getPaymentCountries", eErrorSeverity.low);
                });
        }

        function getEWalletCurrencies(paymentType, countryId, concretePaymentTypeId) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("TDALDeposit/getCurrencies", "Payments/EWallet/GetCurrencies"
                    + "?paymentType=" + paymentType
                    + "&countryId=" + countryId
                    + "&concretePaymentTypeId=" + concretePaymentTypeId,
                    "", null, null, 0)
                .fail(function () {
                    errorManager.onError("TDALDeposit/getEWalletCurrencies", "getEWalletCurrencies", eErrorSeverity.low);
                });
        }

        //---------------------------------------------------

        function getPaymentStatus(requestId, depositingActionType, OnDepositPaymentStatusTimeout) {
            return getPaymentStatusBase(requestId, depositingActionType, OnDepositPaymentStatusTimeout, "Payments/Deposit/GetPaymentStatus", "TDALDeposit/getPaymentStatus", "getPaymentStatus");
        }

        function getFinalPaymentStatus(requestId, depositingActionType, OnDepositFinalPaymentStatusTimeout) {
            return getPaymentStatusBase(requestId, depositingActionType, OnDepositFinalPaymentStatusTimeout, "Payments/Deposit/getFinalPaymentStatus", "TDALDeposit/getFinalPaymentStatus", "getFinalPaymentStatus");
        }

        function getPaymentStatusBase(requestId, depositingActionType, OnRequestTimeoutFunction, apiPath, callerName, methodName) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get(callerName, apiPath + "?requestId=" + requestId + "&depositingActionType=" + depositingActionType)
                .fail(function (error) {
                    if (error instanceof AjaxError && (error.httpStatus === 504 || error.httpStatus === 0) && general.isFunctionType(OnRequestTimeoutFunction)) {
                        OnRequestTimeoutFunction();
                    } else {
                        errorManager.onError(callerName, methodName, eErrorSeverity.medium);
                        throw error;
                    }
                });
        }

        //-------------------------------------------------
        // CreditCard
        //---------------------------------------------------

        function getCreditCardData(paymentType) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("TDALDeposit/GetCreditCardData", "api/payments/ccdeposit/GetCreditCardData/" + paymentType,
                    "",
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("TDALDeposit/GetCreditCardData", "GetCreditCardData", eErrorSeverity.medium);
                    return error;
                });
        }

        function getAllowedCreditCardData() {
            var ajaxer = new Ajaxer(),
                controller = 'CreditCard',
                action = 'GetAllowedCreditCards',
                url = "Payments/" + controller + "/" + action;

            return ajaxer.promises
                .get("TDALDeposit/getAllowedCreditCards", url)
                .fail(function (error) {
                    errorManager.onError("TDALDeposit/GetAllowedCreditCards", "GetAllowedCreditCards", eErrorSeverity.medium);
                    throw error;
                });
        }

        function getAllowedCreditCardsWithAmountValidation() {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("TDALDeposit/GetCreditCardData", "api/payments/ccdeposit/GetAllowedCreditCardsWithAmountValidation")
                .fail(function (error) {
                    errorManager.onError("TDALDeposit/GetAllowedCreditCardsWithAmountValidation", "GetAllowedCreditCardsWithAmountValidation", eErrorSeverity.medium);
                    throw error;
                });
        }

        //---------------------------------------------------

        function setUsedCardAsDefault(paymentID) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .post("TDALDeposit/setUsedCardAsDefault", "api/payments/ccdeposit/SetUsedCardAsDefault/" + paymentID,
                    "",
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("TDALDeposit/setUsedCardAsDefault", error.message, eErrorSeverity.low);
                })
                .done();
        }

        //---------------------------------------------------

        function removeUsedCard(paymentID) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .post("TDALDeposit/removeUsedCard", "api/payments/ccdeposit/RemoveUsedCard/" + paymentID,
                    "",
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("TDALDeposit/removeUsedCard", error.message, eErrorSeverity.low);
                });
        }

        function depositCreditCard(ccRequest) {
            var ajaxer = new Ajaxer();

            var sb = new StringBuilder(),
                browserDetails = Object.assign({
                    challengeWindowSize: ePaymentsChallengeWindowSize.Fullscreen
                },
                    Browser.getBrowserDetails());

            sb.append(String.format("paymentID={0}&", ccRequest.paymentID || "-1"));
            sb.append(String.format("cardNumber={0}&", ccRequest.cardNumber));
            sb.append(String.format("expMonth={0}&", ccRequest.expMonth));
            sb.append(String.format("expYear={0}&", ccRequest.expYear));
            sb.append(String.format("cardTypeID={0}&", ccRequest.cardTypeID));
            sb.append(String.format("depositCurrency={0}&", ccRequest.depositCurrency));
            sb.append(String.format("cardHolderName={0}&", ccRequest.cardHolderName));
            sb.append(String.format("amount={0}&", ccRequest.amount));
            sb.append(String.format("cvv={0}&", ccRequest.cvv));
            sb.append(String.format("paymentAuthMode={0}&", ccRequest.paymentAuthMode));
            sb.append(String.format("browserData={0}&", JSON.stringify(browserDetails)));
            sb.append(String.format("SecurityToken={0}", systemInfo.securityToken));

            return ajaxer.promises
                .post("dalDeposit:depositCreditCard", "api/payments/ccdeposit/DepositCreditCard",
                    sb.toString(),
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("api/payments/ccdeposit", error.message, eErrorSeverity.medium);
                });
        }

        function depositEWallet(ccRequest) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify(ccRequest);

            return ajaxer.promises
                .jsonPost("dalDeposit:depositEWallet",
                    "Payments/EWallet/Deposit",
                    params,
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("Payments/EWallet/Deposit", error.message, eErrorSeverity.medium);
                });
        }

        function depositEmailEWallet(ccRequest) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify(ccRequest);

            return ajaxer.promises
                .jsonPost("dalDeposit:depositEWallet",
                    "Payments/EWalletExtended/Deposit",
                    params,
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("Payments/EWalletExtended/Deposit", error.message, eErrorSeverity.medium);
                });
        }

        function depositMoneyBookers(ccRequest) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify(ccRequest);

            return ajaxer.promises
                .jsonPost("dalDeposit:depositEWallet",
                    "Payments/MoneyBookers/Deposit",
                    params,
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("Payments/MoneyBookers/Deposit", error.message, eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------

        function getWireTransferCountries() {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("RegularWireTransfer/getWireTransferCountries", "Payments/RegularWireTransfer/GetWireTransferCountries",
                    null,
                    null,
                    null,
                    0)
                .fail(function () {
                    errorManager.onError("RegularWireTransfer/getWireTransferCountries", "", eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------

        function getWireTransferCountryInfo(countryID) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("RegularWireTransfer/getWireTransferCountryInfo", "Payments/RegularWireTransfer/GetWireTransferCountryInfo",
                    "countryID=" + countryID,
                    null,
                    null,
                    0)
                .fail(function () {
                    errorManager.onError("RegularWireTransfer/GetWireTransferCountryInfo", "", eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------

        function depositWireTransfer(req) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify(req);

            return ajaxer.promises
                .jsonPost("dalDeposit:depositWireTransfer",
                    "Payments/RegularWireTransfer/Deposit",
                    params,
                    null,
                    null, 0)
                .fail(function (error) {
                    errorManager.onError("Payments/RegularWireTransfer/Deposit", error.message, eErrorSeverity.medium);
                });
        }


        //---------------------------------------------------
        // Astropay
        //---------------------------------------------------

        function getAstropayPaymentMethods() {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .get("Astropay/getPaymentMethods", "Payments/Astropay/GetPaymentMethods",
                    null,
                    null,
                    null,
                    0, null, null, false)
                .fail(function () {
                    errorManager.onError("Astropay/getPaymentMethods", "", eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------
        // InatecAPM
        //---------------------------------------------------
        function depositInatecAPM(ccRequest) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify(ccRequest);

            return ajaxer.promises
                .jsonPost("dalDeposit:depositInatecAPM",
                    "Payments/InatecAPM/Deposit",
                    params,
                    null,
                    null,
                    0)
                .fail(function (error) {
                    errorManager.onError("Payments/InatecAPM/Deposit", error.message, eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------
        // ForcedClearers
        //---------------------------------------------------
        function getForcedClearers() {
            var ajaxer = new Ajaxer(),
                url = "api/backoffice/deposit/getforcedclearers/";

            return ajaxer.promises
                .get(
                    'dataaccess/dalDeposit',
                    url,
                    null,
                    null,
                    null,
                    0, null, null, false)
                .then(JSON.parse)
                .fail(function (error) {
                    errorManager.onError('dataaccess/dalDeposit', error.message, eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------
        // Forced Deposit
        //---------------------------------------------------
        function submitForcedDeposit(forcedDepositData) {
            var ajaxer = new Ajaxer();

            return ajaxer.promises
                .jsonPost(
                    'dataaccess/dalDeposit',
                    "api/backoffice/deposit/doforceddeposit",
                    JSON.stringify(forcedDepositData),
                    null,
                    null)
                .fail(function (error) {
                    errorManager.onError('dataaccess/dalDeposit', error.message, eErrorSeverity.medium);
                    return error;
                });
        }

        function failDeposit(requestId) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify({ requestId: requestId });

            return ajaxer.promises
                .jsonPost(
                    "TDALDeposit/failDeposit",
                    "Payments/Deposit/FailDeposit",
                    params,
                    null,
                    null
                )
                .fail(function (error) {
                    errorManager.onError("Payments/Deposit/FailDeposit", error.message, eErrorSeverity.medium);
                });
        }

        //---------------------------------------------------
        // Deposit activity logging
        //---------------------------------------------------
        function sendDepositActivityMessage(errorType, errorDetails, isGenericCreditCard, frameGuid) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify({
                    errorType: errorType,
                    errorDetails: errorDetails,
                    isGenericCreditCard: isGenericCreditCard,
                    frameGuid: frameGuid
                });

            ajaxer.jsonPost(
                "Deposit/WriteDepositErrorActivityLog",
                "Deposit/WriteDepositErrorActivityLog",
                params,
                general.emptyFn,
                function (error) {
                    var msg = error ? error.message : "";

                    errorManager.onError("Deposit/WriteDepositErrorActivityLog", msg, eErrorSeverity.medium);
                }
            );
        }

        function logFrameNotLoadedMessage(errorType, errorDetails, frameGuid) {
            sendDepositActivityMessage(errorType, errorDetails, true, frameGuid);
        }

        function logGenericCCDepositActivityMessage(errorType, errorDetails) {
            sendDepositActivityMessage(errorType, errorDetails, true);
        }

        function logDepositCommunication(messageType, message, action) {
            sendDepositCommunication(messageType, message, action, false);
        }

        function logGenericCCDepositCommunication(messageType, message, action) {
            sendDepositCommunication(messageType, message, action, true);
        }

        function sendDepositCommunication(messageType, message, action, isGenericCreditCard) {
            var ajaxer = new Ajaxer(),
                params = JSON.stringify({
                    messageType: messageType,
                    message: message,
                    action: action,
                    isGenericCreditCard: isGenericCreditCard
                });

            ajaxer.jsonPost(
                "Deposit/LogDepositCommunication",
                "Deposit/LogDepositCommunication",
                params,
                general.emptyFn,
                function () {
                    errorManager.onError("Deposit/LogDepositCommunication", "", eErrorSeverity.medium);
                }
            );
        }

        return {
            getPaymentStatus: getPaymentStatus,
            getFinalPaymentStatus: getFinalPaymentStatus,
            getCreditCardData: getCreditCardData,
            getAllowedCreditCardData: getAllowedCreditCardData,
            getAllowedCreditCardsWithAmountValidation: getAllowedCreditCardsWithAmountValidation,
            depositCreditCard: depositCreditCard,
            depositEWallet: depositEWallet,
            depositEmailEWallet: depositEmailEWallet,
            depositMoneyBookers: depositMoneyBookers,
            depositInatecAPM: depositInatecAPM,
            setUsedCardAsDefault: setUsedCardAsDefault,
            removeUsedCard: removeUsedCard,
            getWireTransferCountryInfo: getWireTransferCountryInfo,
            depositWireTransfer: depositWireTransfer,
            getEWalletCurrencies: getEWalletCurrencies,
            getAstropayPaymentMethods: getAstropayPaymentMethods,
            getWireTransferCountries: getWireTransferCountries,
            getConcretePayments: getConcretePayments,
            getPaymentCountries: getPaymentCountries,
            getUserDepositDetails: getUserDepositDetails,
            getLastSuccesfullDepositCurrency: getLastSuccesfullDepositCurrency,
            failDeposit: failDeposit,
            getForcedClearers: getForcedClearers,
            submitForcedDeposit: submitForcedDeposit,

            LogDepositCommunication: logDepositCommunication,
            LogGenericCCDepositActivityMessage: logGenericCCDepositActivityMessage,
            LogGenericCCDepositCommunication: logGenericCCDepositCommunication,
            LogFrameNotLoadedMessage: logFrameNotLoadedMessage
        };
    }
);
