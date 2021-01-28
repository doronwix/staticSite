define(
    'deviceviewmodels/NewLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'dataaccess/dalorder',
        'initdatamanagers/Customer',
        'initdatamanagers/InstrumentsManager',
        'modules/permissionsmodule',
        'devicemanagers/StatesManager',
        'FxNet/LogicLayer/Deal/DealLifeCycle',
        'StateObject!Transaction',
        'modules/FavoriteInstrumentsManager',
        'viewmodels/Limits/AmountFieldsWrapper',
        'viewmodels/Limits/LimitBaseViewModel',
        'managers/viewsmanager',
        'devicemanagers/AlertsManager',
        'handlers/limit'
    ],
    function NewLimitDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').NewLimitConfiguration,
            dalOrders = require('dataaccess/dalorder'),
            customer = require('initdatamanagers/Customer'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            permissionsModule = require('modules/permissionsmodule'),
            statesManager = require('devicemanagers/StatesManager'),
            dealLifeCycle = require('FxNet/LogicLayer/Deal/DealLifeCycle'),
            stateObject = require('StateObject!Transaction'),
            favoriteInstrumentsManager = require('modules/FavoriteInstrumentsManager'),
            AmountFieldsWrapper = require('viewmodels/Limits/AmountFieldsWrapper'),
            LimitBaseViewModel = require('viewmodels/Limits/LimitBaseViewModel'),
            ViewsManager = require('managers/viewsmanager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            limit = require('handlers/limit');

        var NewLimitViewModel = general.extendClass(LimitBaseViewModel, function NewLimitClass(_params) {
            var self = this,
                parent = this.parent, // inherited from LimitBaseViewModel
                data = this.Data, // inherited from LimitBaseViewModel
                validationModel = {},
                fieldWrappers = new AmountFieldsWrapper(),
                baseOrder = parent.BaseOrder,
                expirationDateModel = parent.ExpirationDate,
                setLimitsModel = parent.SetLimitsModel,
                selectedInstrumentWrapper,
                params = _params || {};

            function init(customSettings) {
                stateObject.update(eStateObjectTopics.ReadyForUse, false);
                parent.init.call(self, customSettings); // inherited from LimitBaseViewModel

                setObservables();
                setComputables();
                setSubscribers();

                setLimitsModel.Start(setLimitsModelDependencies);

                setChartProperties();

                data.hasToolsDataUpdated(true);
                stateObject.update(eStateObjectTopics.ReadyForUse, true);
                stateObject.update('currentRateDirectionSwitch', settings.currentRateDirectionSwitch);
                stateObject.update("PageName", eDealPage.NewLimitViewModel);
            }

            function setObservables() {
                data.corporateActionDate = ko.observable();
                data.showShareCorporateActionDealInfo = ko.observable();

                data.isFavorite = stateObject.set('isFavorite', ko.observable());
                data.hasToolsDataUpdated = stateObject.get("hasToolsDataUpdated");

                data.switchIsFavorite = function () {
                    if (permissionsModule.CheckActionAllowed("addFavorite", true)) {
                        switchIsFavorite(data.selectedInstrument());
                    }
                };

                data.profileKeyForDefaultTab = ko.observable(settings.profileKeyForDefaultTab);
                data.isProcessing = ko.observable(false);
            }

            function setComputables() {
                data.OrderButtonEnabled = self.createComputed(function () {
                    var isMarketClosed = statesManager.States.IsMarketClosed(),
                        hasInstrument = data.hasInstrument(),
                        viewModelReady = data.hasInstrument() && data.limitsReady() && data.quotesAvailable(),
                        isLimitLevelValid = data.openLimit ? data.openLimit.isValid() : false,
                        isActiveQuote = data.isActiveQuote(),
                        isBrokerAllowLimitsOnNoRates = customer.prop.brokerAllowLimitsOnNoRates,
                        isExpirationDateTimeValid = expirationDateModel.IsValid(),
                        hasLimitsErrors = setLimitsModel.Validate().length > 0,
                        isOrderDirSelected = data.isShowBuyBox() || data.isShowSellBox(),
                        isSelectedDealAmountValid = general.isFunctionType(data.selectedDealAmount.isValid) ? data.selectedDealAmount.isValid() : false,
                        hasDealMinMaxAmounts = data.dealMinMaxAmounts().length > 0;

                    //evaluate this observable in order to trigger this computed
                    data.selectedDealAmount();

                    return (!data.isProcessing() && (isBrokerAllowLimitsOnNoRates || (!isMarketClosed && isActiveQuote)) &&
                        isOrderDirSelected && hasInstrument && viewModelReady && isExpirationDateTimeValid && isLimitLevelValid
                        && !hasLimitsErrors && hasDealMinMaxAmounts && isSelectedDealAmountValid);
                });

                data.isVisibleNewLimit = self.createComputed(function () {
                    return params.isShowNewLimit();
                });

                selectedInstrumentWrapper = self.createComputed(function () {
                    return data.selectedInstrument();
                });
            }

            function setSubscribers() {
                self.subscribeAndNotify(selectedInstrumentWrapper, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);

                    if (instrument) {
                        var corporateActionDate = instrument.getCorporateActionDate();
                        setLimitsModel.SetInitial();
                        parent.setLimitTabsFromClientProfile();

                        data.isFavorite(favoriteInstrumentsManager.IsFavoriteInstrument(instrumentId));

                        expirationDateModel.UpdateSelectedWithToday(instrumentId);
                        data.corporateActionDate(corporateActionDate);
                        data.showShareCorporateActionDealInfo(
                            dealLifeCycle.sharesIsCorporateActionDateSignificant_BeforeDeal(
                                customer.prop.dealPermit,
                                instrument.assetTypeId,
                                corporateActionDate
                            )
                        );
                    }
                });

                self.subscribeAndNotify(data.isVisibleNewLimit, function (isVisible) {
                    if (isVisible) {
                        parent.registerToDispatcher();

                        ko.postbox.publish('new-limit-view', { instrument: data.ccyPair(), instrumentStatus: data.isActiveQuote() ? 'live' : 'disabled' });
                    }
                    else {
                        parent.unRegisterFromDispatcher();
                    }
                });
            }

            function setLimitsModelDependencies() {
                validationModel.Limits = ko.validatedObservable({
                    stopLossAmount: setLimitsModel.Data.stopLossAmount,
                    takeProfitAmount: setLimitsModel.Data.takeProfitAmount,
                    ccySLAmount: setLimitsModel.Data.ccySLAmount,
                    ccyTPAmount: setLimitsModel.Data.ccyTPAmount,
                    stopLossRate: setLimitsModel.Data.stopLossRate,
                    takeProfitRate: setLimitsModel.Data.takeProfitRate,
                    stopLossPercent: setLimitsModel.Data.stopLossPercent,
                    takeProfitPercent: setLimitsModel.Data.takeProfitPercent
                });

                fieldWrappers.init(setLimitsModel, data);

                setStopLossDependencies();
                setTakeProfitDependencies();

                data.limitsReady(true);
                parent.setLimitTabsFromClientProfile();
            }

            function setStopLossDependencies() {
                self.subscribeTo(data.enableSLLimit, function (enabled) {
                    if (enabled) {
                        return;
                    }

                    setLimitsModel.Data.stopLossRate("");
                    setLimitsModel.Data.stopLossAmount("");
                    setLimitsModel.Data.stopLossPercent("");
                    fieldWrappers.Data.stopLossInCustomerCcy("");
                });

                self.subscribeTo(setLimitsModel.Data.curSlActiveTab, function (activeTab) {
                    data.isSlRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                    data.isSlAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                    data.isSlPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                });

                self.subscribeTo(setLimitsModel.Data.stopLossPercent, function (stopLossPercent) {
                    data.displaySlPercentSymbol(!general.isEmptyValue(stopLossPercent) && stopLossPercent !== "NA");
                });

                self.subscribeTo(fieldWrappers.Data.stopLossInCustomerCcy, function (stopLossInCustomerCcy) {
                    data.displaySlAmountCcySymbol(!general.isEmptyValue(stopLossInCustomerCcy) && stopLossInCustomerCcy !== "NA");
                });
            }

            function setTakeProfitDependencies() {
                self.subscribeTo(data.enableTPLimit, function (enabled) {
                    if (enabled) {
                        return;
                    }

                    setLimitsModel.Data.takeProfitRate("");
                    setLimitsModel.Data.takeProfitAmount("");
                    setLimitsModel.Data.takeProfitPercent("");
                    fieldWrappers.Data.takeProfitInCustomerCcy("");
                });

                self.subscribeTo(setLimitsModel.Data.curTpActiveTab, function (activeTab) {
                    data.isTpRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                    data.isTpAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                    data.isTpPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitPercent, function (takeProfitPercent) {
                    data.displayTpPercentSymbol(!general.isEmptyValue(takeProfitPercent) && takeProfitPercent !== "NA");
                });

                self.subscribeTo(fieldWrappers.Data.takeProfitInCustomerCcy, function (takeProfitInCustomerCcy) {
                    data.displayTpAmountCcySymbol(!general.isEmptyValue(takeProfitInCustomerCcy) && takeProfitInCustomerCcy !== "NA");
                });
            }

            function orderButtonHandler() {
                if (!data.OrderButtonEnabled()) {
                    return;
                }

                var limitsErrors = setLimitsModel.Validate();

                if (limitsErrors.length) {
                    return;
                }

                if (!permissionsModule.CheckActionAllowed('newLimit', true, { register: registerParams.traderInstrumentId + data.selectedInstrument() + registerParams.traderOrderDir + (data.orderDir() === 0 ? "Sell" : "Buy") }))
                    return false;

                if (statesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return false;
                }

                if (baseOrder.LimitValidateQuote(data.selectedInstrument())) {
                    var newLimit = new limit();
                    parent.fillData(newLimit);

                    if (invalidEnableSlTpLimit(newLimit)) {
                        return enabledSltpValidationError();
                    }

                    data.isProcessing(true);
                    data.hasInstrument(false);
                    dalOrders.AddLimit(newLimit, parent.onOpenLimit);
                    ko.postbox.publish('new-limit-details', { tradingDirection: newLimit.orderDir === eOrderDir.Buy ? 'Buy' : newLimit.orderDir === eOrderDir.Sell ? 'Sell' : 'None', dealSize: newLimit.amount, isAdvancedView: setLimitsModel.ViewProperties.isAdvancedView().toString(), expirationType: expirationDateModel.Data.expirationDateSelector.IsGoodTillCancelChecked() ? "Good Till Cancel" : "Specific Date" });
                }
            }

            function invalidEnableSlTpLimit(newLimit) {
                return data.enableSLLimit() && newLimit.ifDoneSLRate === 0 || data.enableTPLimit() && newLimit.ifDoneTPRate === 0;
            }

            function ignoreSltpValidationError() {
                data.enableSLLimit(false);
                data.enableTPLimit(false);
                orderButtonHandler();
            }

            function enabledSltpValidationError() {
                AlertsManager.UpdateAlert(
                    AlertTypes.GeneralOkAlert,
                    Dictionary.GetItem('pleaseNoteTitle'),
                    Dictionary.GetItem('sltpValidationMsg', 'deals_NewLimit'),
                    null,
                    { okButtonCallback: ignoreSltpValidationError }
                );

                AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
            }

            function switchIsFavorite(instrumentId) {
                if (favoriteInstrumentsManager.IsFavoriteInstrument(instrumentId)) {
                    favoriteInstrumentsManager.RemoveFavoriteInstrument(instrumentId);
                    data.isFavorite(false);

                    ko.postbox.publish("favorite-instrument-update", { instrumentId: instrumentId, isRemoveInstrument: true });
                }
                else {
                    favoriteInstrumentsManager.AddFavoriteInstrument(instrumentId);
                    data.isFavorite(true);

                    ko.postbox.publish("favorite-instrument-update", { instrumentId: instrumentId, isAddInstrument: true });
                }
            }

            function setChartProperties() {
                stateObject.update("stopLossRateLimit", setLimitsModel.Data.stopLossRate);
                stateObject.update("takeProfitRateLimit", setLimitsModel.Data.takeProfitRate);
                stateObject.update("openLimit", data.openLimit);
                stateObject.update('chart', settings.chart);
                stateObject.update('switchToRate', switchToRate);
            }

            function switchToRate() {
                setLimitsModel.SetActiveTab(eSetLimitsTabs.Rate);
            }

            function onPriceAlertClick() {
                ViewsManager.SwitchViewVisible(eForms.NewPriceAlert,
                    {
                        transactionTab: eTransactionSwitcher.NewPriceAlert, isActiveQuote: false,
                        instrumentId: data.selectedInstrument()
                    });
            }

            function dispose() {
                setLimitsModel.Stop();
                fieldWrappers.dispose();
                fieldWrappers = null;
                stateObject.unset('currentRateDirectionSwitch');

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                OrderButtonHandler: orderButtonHandler,
                ExpirationDate: expirationDateModel,
                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,
                SetLimitsInfo: setLimitsModel.ObservableSetLimitsObject,
                LimitLevelField: parent.LimitLevelField,
                FieldWrappers: fieldWrappers,
                OnPriceAlertClick: onPriceAlertClick
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NewLimitViewModel(params);

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
