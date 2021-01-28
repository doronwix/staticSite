/*global eNewDealLimitType  */
define(
    'deviceviewmodels/NewDealSlipViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'initdatamanagers/Customer',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'modules/permissionsmodule',
        'StateObject!Transaction',
        'modules/FavoriteInstrumentsManager',
        'FxNet/LogicLayer/Deal/DealLifeCycle',
        'viewmodels/Limits/AmountFieldsWrapper',
        'FxNet/LogicLayer/Deal/NewDealValidator',
        'viewmodels/Deals/DealBaseViewModel',
        'managers/viewsmanager'
    ],
    function NewDealSlipDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').NewDealConfiguration,
            customer = require('initdatamanagers/Customer'),
            newDealValidator = require('FxNet/LogicLayer/Deal/NewDealValidator'),
            statesManager = require('devicemanagers/StatesManager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            permissionsModule = require('modules/permissionsmodule'),
            dealLifeCycle = require('FxNet/LogicLayer/Deal/DealLifeCycle'),
            AmountFieldsWrapper = require('viewmodels/Limits/AmountFieldsWrapper'),
            stateObject = require('StateObject!Transaction'),
            favoriteInstrumentsManager = require('modules/FavoriteInstrumentsManager'),
            DealBaseViewModel = require('viewmodels/Deals/DealBaseViewModel'),
            ViewsManager = require('managers/viewsmanager');

        var NewDealSlipViewModel = general.extendClass(DealBaseViewModel, function NewDealSlipClass(_params) {
            var self = this,
                parent = this.parent,                       // inherited from DealBaseViewModel
                data = this.Data,                           // inherited from DealBaseViewModel
                validationModel = {},
                baseOrder = parent.BaseOrder,
                fieldWrappers = new AmountFieldsWrapper(),
                setLimitsModel = parent.SetLimitsModel,
                selectedInstrumentWrapper,
                params = _params || {};

            // --------------------------------------------------------------
            function init(customSettings) {
                stateObject.update(eStateObjectTopics.ReadyForUse, false);
                parent.init.call(self, customSettings);     // inherited from DealBaseViewModel            

                newDealValidator.Init(baseOrder);

                setObservables();
                setComputables();
                setSubscribers();

                setLimitsModel.Start(setLimitsModelDependencies);
                setChartProperties();

                data.hasToolsDataUpdated(true);
                data.chartTransactionEnabled(true);
                stateObject.update(eStateObjectTopics.ReadyForUse, true);
                stateObject.update('currentRateDirectionSwitch', settings.currentRateDirectionSwitch);
                stateObject.update('PageName', eDealPage.NewDeal);
            }

            // --------------------------------------------------------------
            function setObservables() {
                data.corporateActionDate = ko.observable();
                data.showShareCorporateActionDealInfo = ko.observable();
                data.hasToolsDataUpdated = stateObject.get('hasToolsDataUpdated');
                data.isFavorite = stateObject.set('isFavorite', ko.observable());

                data.switchIsFavorite = function () {
                    if (permissionsModule.CheckActionAllowed('addFavorite', true))
                        switchIsFavorite(data.selectedInstrument());
                };

                data.isChartFullScrn = stateObject.set('isChartFullScrn', ko.observable(false));
            }

            // --------------------------------------------------------------
            function setComputables() {
                data.DealButtonEnabled = self.createComputed(function () {
                    var isMarketClosed = statesManager.States.IsMarketClosed(),
                        viewModelReady = data.hasInstrument() && data.limitsReady() && data.quotesAvailable(),
                        isActiveQuote = data.isActiveQuote(),
                        isOrderDirSelected = data.isShowBuyBox() || data.isShowSellBox(),
                        isLimitsValid = setLimitsModel.Validate().length <= 0,
                        isSelectedDealAmountValid = general.isFunctionType(data.selectedDealAmount.isValid) ? data.selectedDealAmount.isValid() : false,
                        hasDealMinMaxAmounts = data.dealMinMaxAmounts().length > 0;

                    //evaluate this observable in order to trigger this computed
                    data.selectedDealAmount();

                    return (!data.isProcessing() && hasDealMinMaxAmounts && isSelectedDealAmountValid &&
                        !isMarketClosed && isActiveQuote && isOrderDirSelected && viewModelReady && isLimitsValid);
                });

                data.isVisibleNewDeal = self.createComputed(function () {
                    return params.isShowNewDeal();
                });

                selectedInstrumentWrapper = self.createComputed(function () {
                    return data.selectedInstrument();
                });
            }

            // --------------------------------------------------------------
            function setSubscribers() {
                self.subscribeAndNotify(selectedInstrumentWrapper, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);

                    if (instrument) {
                        setLimitsModel.SetInitial();
                        parent.setLimitTabsFromClientProfile();

                        data.isFavorite(favoriteInstrumentsManager.IsFavoriteInstrument(instrumentId));

                        data.corporateActionDate(instrument.getCorporateActionDate());
                        data.showShareCorporateActionDealInfo(dealLifeCycle.sharesIsCorporateActionDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate()));
                    }
                });

                self.subscribeAndNotify(data.isVisibleNewDeal, function (isVisible) {
                    if (isVisible) {
                        parent.registerToDispatcher();

                        ko.postbox.publish('deal-slip-view', {
                            instrument: data.ccyPair(),
                            instrumentStatus: data.isActiveQuote() ? 'live' : 'disabled',
                            tabName: general.getKeyByValue(eNewDealTool, data.initialToolTab()),
                            limit: 'maximized',
                            tools: data.showTools() ? 'maximized' : 'minimized',
                            id: data.selectedInstrument(),
                            orderDir: data.orderDir()
                        });

                    } else {
                        parent.unRegisterFromDispatcher();
                    }
                });
            }

            // --------------------------------------------------------------
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

                    setLimitsModel.Data.stopLossRate('');
                    setLimitsModel.Data.stopLossAmount('');
                    setLimitsModel.Data.stopLossPercent('');
                    fieldWrappers.Data.stopLossInCustomerCcy('');
                });

                self.subscribeTo(setLimitsModel.Data.curSlActiveTab, function (activeTab) {
                    data.isSlRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                    data.isSlAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                    data.isSlPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                });

                self.subscribeTo(setLimitsModel.Data.stopLossPercent, function (stopLossPercent) {
                    data.displaySlPercentSymbol(!general.isEmptyValue(stopLossPercent) && stopLossPercent !== 'NA');
                });

                self.subscribeTo(fieldWrappers.Data.stopLossInCustomerCcy, function (stopLossInCustomerCcy) {
                    data.displaySlAmountCcySymbol(!general.isEmptyValue(stopLossInCustomerCcy) && stopLossInCustomerCcy !== 'NA');
                });
            }

            function setTakeProfitDependencies() {
                self.subscribeTo(data.enableTPLimit, function (enabled) {
                    if (enabled) {
                        return;
                    }

                    setLimitsModel.Data.takeProfitRate('');
                    setLimitsModel.Data.takeProfitAmount('');
                    setLimitsModel.Data.takeProfitPercent('');
                    fieldWrappers.Data.takeProfitInCustomerCcy('');
                });

                self.subscribeTo(setLimitsModel.Data.curTpActiveTab, function (activeTab) {
                    data.isTpRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                    data.isTpAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                    data.isTpPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitPercent, function (takeProfitPercent) {
                    data.displayTpPercentSymbol(!general.isEmptyValue(takeProfitPercent) && takeProfitPercent !== 'NA');
                });

                self.subscribeTo(fieldWrappers.Data.takeProfitInCustomerCcy, function (takeProfitInCustomerCcy) {
                    data.displayTpAmountCcySymbol(!general.isEmptyValue(takeProfitInCustomerCcy) && takeProfitInCustomerCcy !== 'NA');
                });
            }

            // --------------------------------------------------------------
            function dealButtonHandler() {
                if (!data.DealButtonEnabled()) {
                    return;
                }

                if (general.isDefinedType(baseOrder.ViewProperties)) {
                    if (!data.isActiveQuote()) {
                        baseOrder.ViewProperties.InactiveInstrumentAlert(data.selectedInstrument());

                        return;
                    }
                }

                if (!newDealValidator.Validate(data.selectedInstrument())) {
                    return;
                }

                var limitsErrors = setLimitsModel.Validate();

                if (limitsErrors.length) {
                    return;
                }

                if (!permissionsModule.CheckActionAllowed('newDeal', true, { register: registerParams.traderInstrumentId + data.selectedInstrument() + registerParams.traderOrderDir + (data.orderDir() === 0 ? 'Sell' : 'Buy') }))
                    return false;

                parent.openDeal();
            }

            // --------------------------------------------------------------
            function switchIsFavorite(instrumentId) {
                if (favoriteInstrumentsManager.IsFavoriteInstrument(instrumentId)) {
                    favoriteInstrumentsManager.RemoveFavoriteInstrument(instrumentId);
                    data.isFavorite(false);

                    ko.postbox.publish('favorite-instrument-update', { instrumentId: instrumentId, isRemoveInstrument: true });
                }
                else {
                    favoriteInstrumentsManager.AddFavoriteInstrument(instrumentId);
                    data.isFavorite(true);

                    ko.postbox.publish('favorite-instrument-update', { instrumentId: instrumentId, isAddInstrument: true });
                }
            }

            // --------------------------------------------------------------
            function setChartProperties() {
                stateObject.update('stopLossRateDeal', setLimitsModel.Data.stopLossRate);
                stateObject.update('takeProfitRateDeal', setLimitsModel.Data.takeProfitRate);
                stateObject.update('chart', settings.chart);
                stateObject.update('switchToRate', switchToRate);
            }

            // --------------------------------------------------------------
            function switchToRate() {
                setLimitsModel.SetActiveTab(eSetLimitsTabs.Rate);
            }

            // --------------------------------------------------------------
            function onPriceAlertClick() {
                ViewsManager.SwitchViewVisible(eForms.NewPriceAlert,
                    {
                        instrumentId: data.selectedInstrument(),
                        isActiveQuote: false
                    });
            }

            // --------------------------------------------------------------
            function dispose() {
                data.chartTransactionEnabled(false);
                setLimitsModel.Stop();
                fieldWrappers.dispose();
                fieldWrappers = null;
                stateObject.unset('currentRateDirectionSwitch');

                parent.dispose.call(self);                  // inherited from DealViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                DealButtonHandler: dealButtonHandler,

                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,

                SetLimitsInfo: setLimitsModel.ObservableSetLimitsObject,
                SetLimitsViewProperties: setLimitsModel.ViewProperties,
                FieldWrappers: fieldWrappers,
                OnPriceAlertClick: onPriceAlertClick
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NewDealSlipViewModel(params);

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
