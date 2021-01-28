define(
    'deepLinks/DeepLinkParameterValidator',
    [
        'require',
        'handlers/general',
        'initdatamanagers/InstrumentsManager',
        'managers/viewsmanager',
        'customEnums/ViewsEnums',
        'enums/enums',
    ],
    function DeepLinkParameterValidator(require) {
        var instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            general = require('handlers/general'),
            validators = [];

        //------------------------------------------
        validators[eDeepLinkParameterType.LoginOption] = function (option) {
            return !general.isEmptyType(option);
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.Instrument] = function (instrumentId) {
            var instrumentIdValue = parseInt(instrumentId);

            return !isNaN(instrumentIdValue) &&
                instrumentsManager.GetInstrument(instrumentIdValue);
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.OrderDir] = function (orderDir) {
            return !general.isEmptyType(eOrderDir[orderDir]);
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.Integer] = function (intValue) {
            return !general.isEmptyType(intValue) && !isNaN(parseInt(intValue));
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.Tab] = function (tabName) {
            var caseInsensitivePattern = new RegExp(tabName, "i");

            for (var key in eNewDealTool) {
                if (!eNewDealTool.hasOwnProperty(key)) {
                    continue;
                }

                if (key.match(caseInsensitivePattern) !== null) {
                    return true;
                }
            }

            return false;
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.Form] = function (requestFormName, mappingParameter) {
            if (general.isEmptyType(requestFormName) || general.isEmptyType(eForms[requestFormName])) {
                return false;
            }

            if (mappingParameter.AllowOnlyFormsContainingView) {
                var requiredView = mappingParameter.AllowOnlyFormsContainingView,
                    mappedFormId = eForms[requestFormName],
                    viewsManager = require('managers/viewsmanager');

                return viewsManager.GetFormProperties(mappedFormId).mappedViews.indexOf(requiredView) > -1;
            }

            return true;
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.SettingsView] = function (viewName) {
            var caseInsensitivePattern = new RegExp(viewName, "i");

            for (var key in eSettingsViews) {
                if (!eSettingsViews.hasOwnProperty(key)) {
                    continue;
                }

                if (key.match(caseInsensitivePattern) !== null) {
                    return true;
                }
            }

            return false;
        };

        //------------------------------------------
        validators[eDeepLinkParameterType.String] = function (stringValue) {
            return general.isStringType(stringValue);
        };

        //------------------------------------------
        function isValid(mappingParameter, requestParameterValue) {
            return validators[mappingParameter.Type](requestParameterValue, mappingParameter);
        }

        return {
            IsValid: isValid
        };
    }
);