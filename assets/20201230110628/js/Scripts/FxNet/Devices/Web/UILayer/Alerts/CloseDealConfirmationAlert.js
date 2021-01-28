define(
    'devicealerts/CloseDealConfirmationAlert',
    [
        "require",
        'devicealerts/Alert',
        "knockout",
        'handlers/general',
        'dataaccess/dalorder',
        "Dictionary"
    ],
    function CloseDealConfirmaionAlertDef(require) {
        var AlertBase = require('devicealerts/Alert'),
            general = require('handlers/general'),
            dalOrders = require('dataaccess/dalorder'),
            Dictionary = require("Dictionary"),
            ko = require("knockout");

        var CloseDealConfirmaionAlert = function CloseDealConfirmaionAlertClass() {
            var inheritedAlertInstance = new AlertBase(),
                defaultProp = { spotRate: ko.observable(0) };

            function init() {
                inheritedAlertInstance.alertName = 'CloseDealConfirmationAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.properties = defaultProp;

                createButtons();
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem("ok"),
                        function () {
                            var deal = inheritedAlertInstance.properties.deal;

                            if (general.isDefinedType(inheritedAlertInstance.properties.caller)) {
                                inheritedAlertInstance.caller(inheritedAlertInstance.properties.caller);
                            }

                            if (deal) {
                                var tmpDealObj = ko.toJS(deal);

                                inheritedAlertInstance.visible(false);
                                dalOrders.CloseDeals([tmpDealObj], inheritedAlertInstance.caller().OnCloseDealReturn);
                            }
                        },
                        'btnOk'
                    ),
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem("cancel"),
                        function () {
                            inheritedAlertInstance.visible(false);
                        },
                        'btnCancel colored'
                    )
                );
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        }

        return CloseDealConfirmaionAlert;
    }
);
