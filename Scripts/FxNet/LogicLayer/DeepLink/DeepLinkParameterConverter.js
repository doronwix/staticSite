define(
    'deepLinks/DeepLinkParameterConverter',
    [
        'customEnums/ViewsEnums',
        'enums/enums',
    ],
    function DeepLinkParameterConverter() {
        var converters = [],
            matchPlusRegex = /\+/g;

        //------------------------------------------
        converters[eDeepLinkParameterType.LoginOption] = function (loginOption) {
            return loginOption;
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.Instrument] = function (instrumentId) {
            return parseInt(instrumentId);
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.OrderDir] = function (orderDir) {
            return eOrderDir[orderDir];
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.Integer] = function (intValue) {
            return parseInt(intValue);
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.Tab] = function (tabName) {
            var caseInsensitivePattern = new RegExp(tabName, "i");

            for (var key in eNewDealTool) {
                if (!eNewDealTool.hasOwnProperty(key)) {
                    continue;
                }

                if (key.match(caseInsensitivePattern) !== null) {
                    return eNewDealTool[key];
                }
            }

            return null;
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.Form] = function (formName) {
            return eForms[formName];
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.SettingsView] = function (viewName) {
            var caseInsensitivePattern = new RegExp(viewName, "i");

            for (var key in eSettingsViews) {
                if (!eSettingsViews.hasOwnProperty(key)) {
                    continue;
                }

                if (key.match(caseInsensitivePattern) !== null) {
                    return eSettingsViews[key];
                }
            }

            return null;
        };

        //------------------------------------------
        converters[eDeepLinkParameterType.String] = function (stringValue) {
            var returnStringValue = stringValue.replace(matchPlusRegex, ' ')
            return returnStringValue;
        }

        //------------------------------------------
        function convert(mappingParameter, parameterValue) {
            return converters[mappingParameter.Type](parameterValue);
        }

        return {
            Convert: convert
        };
    }
);