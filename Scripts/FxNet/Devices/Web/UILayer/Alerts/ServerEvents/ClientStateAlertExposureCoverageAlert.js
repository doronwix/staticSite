define(
    'devicealerts/serverevents/ClientStateAlertExposureCoverageAlert',
    [
        'require',
        'devicealerts/Alert',
        'knockout',
        'Dictionary',
        'initdatamanagers/Customer',
        'cachemanagers/PortfolioStaticManager'
    ],
    function ClientStateAlertExposureCoverageAlertDef(require) {
        var ko = require("knockout"),
            AlertBase = require('devicealerts/Alert'),
            Dictionary = require('Dictionary'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            customer = require('initdatamanagers/Customer');

        var ClientStateAlertExposureCoverageAlert = function ClientStateAlertExposureCoverageAlertClass() {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = 'devicealerts/serverevents/ClientStateAlertExposureCoverageAlert';
                inheritedAlertInstance.popCounter = ko.observable(0);
                inheritedAlertInstance.prepareForShow = prepareForShow;
            }

            function prepareForShow() {
                var isMarginMaintenance = customer.prop.maintenanceMarginPercentage > 0;

                if (isMarginMaintenance) {
                    inheritedAlertInstance.title(Dictionary.GetItem('exposureCoverageTitle'));
                }

                inheritedAlertInstance.body(getAlertBody());
                inheritedAlertInstance.injectDepositButtons(true);
            }

            function getAlertBody() {
                var exposureCoverageCall = Format.toNumberWithThousandsSeparator(customer.prop.minPctEQXP);
                var liquidationPercentage = customer.prop.LiquidationPercentage;
                var isMarginMaintenance = customer.prop.maintenanceMarginPercentage > 0;
                var hasPendingWithdrawals = portfolioManager.Portfolio.pendingWithdrawals.sign() > 0;

                var bodyText;

                if (isMarginMaintenance) {
                    bodyText = Dictionary.GetItem('MARGIN_DEPOSIT_WHEN_MARGIN_MAINTENANCE');

                    if (hasPendingWithdrawals) {
                        bodyText += Dictionary.GetItem('MARGIN_DEPOSIT_2B'); // last row of message (variant with withdrawals): 'Alternatively, you may deposit additional funds or cancel your Pending Withdrawals.'
                    }
                } else {
                    // first part of message: 'Your Exposure Coverage is below {0}%.<br />To reduce your current risk you can decrease your Net Exposure.'
                    bodyText = String.format(Dictionary.GetItem('MARGIN_DEPOSIT_1'), exposureCoverageCall) + '<br />';

                    // liquidation part of message: 'Your position(s) will be liquidated if your Exposure Coverage reaches {0}%.'
                    if (liquidationPercentage > 0) {
                        bodyText += String.format(Dictionary.GetItem('MARGIN_DEPOSIT_11'), liquidationPercentage) +
                            '<br />';
                    }

                    if (hasPendingWithdrawals) {
                        bodyText += Dictionary.GetItem('MARGIN_DEPOSIT_1B'); // last row of message (variant with withdrawals): 'Alternatively, you may deposit additional funds or cancel your Pending Withdrawals.'
                    } else {
                        bodyText += Dictionary.GetItem('MARGIN_DEPOSIT_1A'); // last row of message (variant without withdrawals): 'Alternatively, you may deposit additional funds.'
                    }
                }

                return bodyText;
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return ClientStateAlertExposureCoverageAlert;
    }
);
