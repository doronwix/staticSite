define(
    'alerts/DealsClosedServerResponseAlert',
    [
        'require',
        'handlers/general',
        'devicealerts/Alert',
        'Dictionary',
        'initdatamanagers/InstrumentsManager',
        'dataaccess/dalCommon',
        'JSONHelper'
    ],
    function DealsClosedServerResponseAlertDef(require) {
        var AlertBase = require('devicealerts/Alert'),
            general = require('handlers/general'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            Dictionary = require('Dictionary'),
            JSONHelper = require('JSONHelper'),
            dalCommon = require('dataaccess/dalCommon');

        var DealsClosedServerResponseAlert = function DealsClosedServerResponseAlertClass() {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'DealsClosedServerResponseAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
                createButtons();
            };

            var prepareForShow = function () {
                this.dataRecords = this.properties.serverResponses;
                var title = (1 >= this.dataRecords.length) ? Dictionary.GetItem('CloseDealConfirmation') : Dictionary.GetItem('CloseDealsConfirmation');

                this.title(title);

                for (var idx = 0; idx < this.dataRecords.length; idx++) {
                    var data = this.dataRecords[idx],
                        requestItem = this.properties.requestData.find(function (item) {
                            return item.positionNumber == data.itemId;
                        });

                    var instrument = instrumentsManager.GetInstrument(data.instrumentId ? data.instrumentId : (requestItem ? requestItem.instrumentID : '')),
                        translateResult = function (result) {
                            var msg = Dictionary.GetItem(result.msgKey || 'InternalError'),
                                args = result.arguments;

                            if (general.isNullOrUndefined(args)) {
                                return msg;
                            }

                            return String.format(msg, args);
                        };

                    if (data.status !== eResult.Success) {
                        switch (data.result) {
                            case 'OrderError116':
                            case 'OrderError120':
                                data.arguments = JSONHelper.STR2JSON('DealsClosedServerResponseAlert:prepareForShow', data.responseArgumentsJson);

                                var instrumentId = data.arguments.pop(),
                                    translatedInstrument = $instrumentTranslationsManager.Long(instrumentId);

                                if (translatedInstrument) {
                                    data.arguments[0] = translatedInstrument;
                                }

                                instrument = $instrumentsManager.GetInstrument(instrumentId);
                                data.msgKey = data.result;
                                data.message = translateResult(data);
                                break;

                            default:
                                var key = !general.isStringType(data.result) || Dictionary.ValueIsEmpty(data.result) ? 'InternalError' : data.result;
                                data.message = Dictionary.GetItem(key);
                                break;
                        }
                    }

                    general.extendType(data, {
                        amount: data.usdValue,
                        openedRate: requestItem ? requestItem.dealRate || requestItem.orderRate : '',
                        instrumentId: instrument ? instrument.id : '',
                        closingRate: requestItem ? data.rateCalc : '',
                        pl: data.plAccountCcy,
                        orderDir: data.direction ? '1closed' : '0closed',
                        baseSymbolId: instrument ? instrument.baseSymbol : '',
                        otherSymbolId: instrument ? instrument.otherSymbol : ''
                    });
                }

                var firstValidResult = general.objectFirst(this.dataRecords, function (result) {
                    return result.status == 1;
                });

                this.plTotal = firstValidResult ? firstValidResult.bulkPlAccountCcy : '0';

                this.rowsValid = this.dataRecords.reduce(function getSum(total, result) {
                    return total + result.status;
                }, 0);

                var closedDealsSucceeded = this.dataRecords.filter(function (result) { return result.status == 1; }).length;

                if (this.dataRecords.length <= 1) {
                    if (0 < closedDealsSucceeded) {
                        this.body(Dictionary.GetItem('YourDealWasClosedSuccessfully'));
                    }
                    else {
                        this.body(Dictionary.GetItem('YourDealWasNotClosedSuccessfully'));
                    }
                }
                else {
                    this.body(String.format(Dictionary.GetItem('countOfYourDealsWhereClosedSuccessfully'), closedDealsSucceeded));
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
                            dalCommon.Logout(eLoginLogoutReason.dealsClosedServerResponseAlert_exit);
                        }
                        else {
                            require(['devicemanagers/ViewModelsManager'], function (viewModelsManager) {
                                viewModelsManager.VManager.SwitchViewVisible(redirectToViewType, viewArgs);
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

        return DealsClosedServerResponseAlert;
    }
);