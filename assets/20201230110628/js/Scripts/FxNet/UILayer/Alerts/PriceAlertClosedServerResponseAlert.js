define(
    'alerts/PriceAlertClosedServerResponseAlert',
    [
        'require',
        'handlers/general',
        'devicealerts/Alert',
        'Dictionary',
        'initdatamanagers/InstrumentsManager'
    ],
    function PriceAlertClosedServerResponseAlertDef(require) {
        var AlertBase = require('devicealerts/Alert');
        var general = require('handlers/general');
        var $instrumentsManager = require('initdatamanagers/InstrumentsManager');
        var Dictionary = require('Dictionary');

        var PriceAlertClosedServerResponseAlert = function PriceAlertClosedServerResponseAlertClass() {

            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'PriceAlertClosedServerResponseAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
                createButtons();
            };

            var prepareForShow = function () {
                this.dataRecords = this.properties.serverResponses;

                this.title(Dictionary.GetItem(1 >= this.dataRecords.length ? 'RemovePriceAlert' : 'RemovePriceAlerts'));


                for (var idx = 0; idx < this.dataRecords.length; idx++) {
                    var data = this.dataRecords[idx],
                        requestItem = this.properties.find(function (item) {
                            return item.orderID == data.itemId;
                        });

                    var instrument = $instrumentsManager.GetInstrument(data.instrumentId ? data.instrumentId : (requestItem ? requestItem.instrumentID : ''));
                    if (data.status !== eResult.Success && this.dataRecords.length > 1) {
                        data.message = Dictionary.GetItem(data.result);
                    }

                    Object.assign(data, {
                        baseSymbolId: instrument ? instrument.baseSymbol : '',
                        otherSymbolId: instrument ? instrument.otherSymbol : '',
                        orderDir: requestItem.orderDir,
                        orderRate: requestItem.orderRate,
                        entryTime: requestItem.entryTime
                    });
                }

                var closedPriceAlertsSucceeded = this.dataRecords.filter(function (result) { return result.status == eResult.Success; }).length;

                if (this.dataRecords.length === 1) {
                    if (closedPriceAlertsSucceeded === 1) {
                        this.body(Dictionary.GetItem('YourPriceAlertWasClosedSuccessfully'));
                    } else {
                        data.status = 1;
                        this.body(Dictionary.GetItem('YourPriceAlertWasNotClosedSuccessfully'));
                    }
                } else {
                    this.body(String.format(Dictionary.GetItem('countOfYourPriceAlertsWhereClosedSuccessfully'), closedPriceAlertsSucceeded));
                }
            };

            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();

                // override base on Back => onOk
                var onOk = inheritedAlertInstance.onBack = function () {
                    var redirectToViewType,
                        viewArgs = inheritedAlertInstance.properties.redirectToViewArgs || '';

                    if (!general.isEmptyValue(inheritedAlertInstance.properties.redirectToView)) {
                        redirectToViewType = inheritedAlertInstance.properties.redirectToView;
                    }

                    if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                        inheritedAlertInstance.properties.okButtonCallback();
                    }

                    inheritedAlertInstance.visible(false);

                    if (!general.isEmptyValue(redirectToViewType)) {
                        if (redirectToViewType === 'exit') {
                            dalCommon.Logout(eLoginLogoutReason.PriceAlertClosedServerResponseAlert_exit);
                        } else {

                            require(['devicemanagers/ViewModelsManager'], function ($viewModelsManager) {
                                $viewModelsManager.VManager.SwitchViewVisible(redirectToViewType, viewArgs);
                            });

                        }
                    }
                };

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem('ok'),
                        onOk,
                        'btnOk'
                    )
                );
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance,
            };
        };
        return PriceAlertClosedServerResponseAlert;
    }
);
