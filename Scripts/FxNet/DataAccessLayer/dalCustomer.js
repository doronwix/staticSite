/* global General */
var TDALCustomer = function (jsonhelper, general) {
    function getShouldChangePassword() {
        var ajaxer = new TAjaxer(),
            callerInfo = "TDALCustomer/shouldChangePassword";

        return ajaxer.promises
            .get(callerInfo, "Customer/ShouldChangePassword", "")
            .then(processResponse)
            .fail(onError.bind(null, callerInfo));
    }

    function processResponse(responseText) {
        return jsonhelper.STR2JSON("TDALCustomer/processResponse", responseText) || {};
    }

    function onError(callerInfo) {
        ErrorManager.onError(callerInfo, "", eErrorSeverity.medium);
    }

    function getRequiredFieldsForDeposit(onSuccess) {
        var ajaxer = new TAjaxer();

        ajaxer.get("TDALCustomer/getRequiredFieldsForDeposit", "Customer/GetRequiredFieldsForDeposit", "",
            onSuccess,
            function () { ErrorManager.onError("TDALCustomer/getRequiredFieldsForDeposit", "", eErrorSeverity.medium); });
    }

    function updateMissingInformation(missingInformationModel, onSuccess) {
        var ajaxer = new TAjaxer();

        ajaxer.jsonPost("TDALCustomer/updateMissingInformation",
            "Customer/UpdateMissingCustomerInformation" + String.format("?SecurityToken={0}", systemInfo.securityToken),
            JSON.stringify(missingInformationModel),
            onSuccess,
            function (error) { ErrorManager.onError("TDALCustomer/updateMissingInformation", error.message, eErrorSeverity.low); }, 0);
    }

    function isIdNumberValid(valueToValidate, onSuccess, onFailure) {
        var ajaxer = new TAjaxer();

        ajaxer.get("TDALCustomer/isIdNumberValid", "Customer/IsIdNumberValid?" + String.format("valueToValidate={0}", valueToValidate),
            "",
            onSuccess,
            function () {
                ErrorManager.onError("TDALCustomer/getRequiredFieldsForDeposit", "", eErrorSeverity.medium);
                onFailure();
            });
    }

    function getCustomerSignalsPermissions() {
        var ajaxer = new TAjaxer(),
            callerInfo = "TDALTradingSignals/getCustomerSignalsPermissions";

        return ajaxer.promises
            .get(callerInfo, "api/tradingsignals/GetClientSignalsPermissions", "")
            .then(processResponse)
            .fail(onError.bind(null, callerInfo));
    }

    function getCustomerAgreementPhrase(OnLoadComplete) {
        if (!General.isFunctionType(OnLoadComplete)) {
            OnLoadComplete = general.emptyFn;
        }

        var ajaxer = new TAjaxer();
        var params = "countryID=" + $customer.prop.countryID;

        return ajaxer.promises
            .get("TDALCustomer/getCustomerAgreementPhrase", "Account/AgreementPhrase",
                params,
                OnLoadComplete,
                function () {
                    ErrorManager.onError("TDALCustomer/getCustomerAgreementPhrase", "", eErrorSeverity.medium);
                }
            );
    }

    function getCustomerDetails() {
        var ajaxer = new TAjaxer();


        return ajaxer.promises
            .get("TDALCustomer/getCustomerDetails", 'customer/customerDetails',
                null,
                general.emptyFn,
                function () {
                    ErrorManager.onError("TDALCustomer/getCustomerDetails", "", eErrorSeverity.medium);
                }
            );
    }

    function hasMissingInformation() {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get("TDALCustomer/getHasMissingInformation", 'customer/hasMissingInformation',
                null,
                general.emptyFn,
                function () {
                    ErrorManager.onError("TDALCustomer/getHasMissingInformation", "", eErrorSeverity.medium);
                }
            );
    }

    function getEducationalTutorials() {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get("TDALCustomer/getEducationalTutorials", "Tutorials/GetVideoLessons",
                null, null, null, 1, null, null, false
            )
            .then(function (responseText) {
                return jsonhelper.STR2JSON("dalCustomer/getEducationalTutorials", responseText);
            })
            .fail(function (error) {
                ErrorManager.onError("TDALCustomer/getEducationalTutorials", error.message, eErrorSeverity.medium);

                throw error;
            });
    }

    function getCustomer() {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get(
                "TDALCustomer/getCustomer",
                'customer/GetCustomer',
                null)
            .fail(function () {
                ErrorManager.onError("TDALCustomer/getCustomerDetails", "", eErrorSeverity.high);
            })
    }

    function getToken() {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get(
                "GetToken",
                'Account/GetToken',
                null)
            .fail(function () {
                ErrorManager.onError("TDALCustomer/getToken", "", eErrorSeverity.high);
            });
    }

    function initialScmmData(callback) {
        var ajaxer = new TAjaxer();
        return ajaxer.promises
            .get('dalCustomer/initialScmmData', 'Compliance/InitialScmmDataGet')
            .then(callback)
            .fail(function (error) {
                window.ErrorManager.onError('dalCustomer/initialScmmData', error.message, eErrorSeverity.medium);
            });
    }

    return {
        GetShouldChangePassword: getShouldChangePassword,
        getCustomer: getCustomer,
        GetCustomerDetails: getCustomerDetails,
        GetRequiredFieldsForDeposit: getRequiredFieldsForDeposit,
        IsIdNumberValid: isIdNumberValid,
        UpdateMissingInformation: updateMissingInformation,
        getCustomerSignalsPermissions: getCustomerSignalsPermissions,
        GetCustomerAgreementPhrase: getCustomerAgreementPhrase,
        HasMissingInformation: hasMissingInformation,
        GetEducationalTutorials: getEducationalTutorials,
        GetToken: getToken,
        InitialScmmData: initialScmmData
    };
};
