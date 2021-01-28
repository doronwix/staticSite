/* global eStartSpinFrom */
define(
    'viewmodels/Limits/LimitBaseViewModel',
    [
        'require',
        'Dictionary',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'configuration/initconfiguration',
        'viewmodels/limits/ExpirationDateModel',
        'managers/viewsmanager',
        'FxNet/LogicLayer/Deal/DealAmountLabel',
        'initdatamanagers/SymbolsManager',
        'cachemanagers/QuotesManager',
        'deviceviewmodels/BaseOrder',
        'viewmodels/limits/SetLimitsViewModel',
        'viewmodels/limits/RateFieldModel',
        'initdatamanagers/Customer',
        'managers/CustomerProfileManager',
        'initdatamanagers/InstrumentsManager',
        'generalmanagers/RegistrationManager',
        'modules/BuilderForInBetweenQuote',
        'StateObject!Transaction',
        'cachemanagers/ClientStateFlagsManager',
        'calculators/LimitRangeCalculator',
        'calculators/LimitValuesCalculator'
    ],
    function LimitBaseDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            settings = require('configuration/initconfiguration').NewLimitConfiguration,
            ExpirationDateModel = require('viewmodels/limits/ExpirationDateModel'),
            ViewsManager = require('managers/viewsmanager'),
            DealAmountLabel = require('FxNet/LogicLayer/Deal/DealAmountLabel'),
            SymbolsManager = require('initdatamanagers/SymbolsManager'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            SetLimitsViewModel = require('viewmodels/limits/SetLimitsViewModel'),
            RateFieldModel = require('viewmodels/limits/RateFieldModel'),
            Customer = require('initdatamanagers/Customer'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            RegistrationManager = require('generalmanagers/RegistrationManager'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            stateObject = require('StateObject!Transaction'),
            ClientStateFlagsManager = require("cachemanagers/ClientStateFlagsManager"),
            LimitRangesCalculator = require('calculators/LimitRangeCalculator');

        var LimitBaseViewModel = general.extendClass(KoComponentViewModel, function LimitBaseClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                baseOrder = new BaseOrder(),
                expirationDateModel = new ExpirationDateModel(),
                setLimitsModel = new SetLimitsViewModel(),
                limitLevelField = new RateFieldModel();

            function init(customSettings) {
                parent.init.call(self, customSettings); // inherited from KoComponentViewModel			

                baseOrder.Init({}, data);
                expirationDateModel.Init();

                setObservables();
                setComputables();
                setSubscribers();

                var setlimitsConfiguration = self.getSettings().setlimitsConfiguration;
                setLimitsModel.Init(data, setlimitsConfiguration);

                setPropertiesFromViewArgs();
            }

            function setObservables() {
                data.ready = ko.observable(false);

                data.customerSymbolName = stateObject.set("customerSymbolName", ko.observable(Customer.prop.baseCcyName()));
                data.customerSymbolId = stateObject.set("customerSymbolId", ko.observable(Customer.prop.baseCcyId()));
                data.orderDir = stateObject.set("orderDir", ko.observable(eOrderDir.None).extend({ dirty: false }));
                data.selectedInstrument = stateObject.set("selectedInstrument", ko.observable());
                data.selectedDealAmount = stateObject.set("selectedDealAmount", ko.observable());
                data.selectedDealAmount.extend({ notify: 'always' });
                data.selectedDealAmount.extend({ amountValidation: [] });
                data.amountSymbol = stateObject.set("amountSymbol", ko.observable(""));
                data.quoteForOtherCcyToAccountCcy = stateObject.get("quoteForOtherCcyToAccountCcy");
                data.quoteForBaseCcyToAccountCcy = stateObject.get("quoteForBaseCcyToAccountCcy");
                data.quoteForUsdCcyToAccountCcy = stateObject.get("quoteForUsdCcyToAccountCcy");
                data.bid = stateObject.set("bid", ko.observable(""));
                data.ask = stateObject.set("ask", ko.observable(""));

                data.initialToolTab = stateObject.set("initialToolTab", ko.observable(""));
                data.showTools = stateObject.set("showTools", ko.observable(CustomerProfileManager.ProfileCustomer().tools === 1));

                data.bidPips = stateObject.set("bidPips", ko.observable(""));
                data.askPips = stateObject.set("askPips", ko.observable(""));
                data.changePips = stateObject.set("changePips", ko.observable(""));
                data.tradeTime = stateObject.set("tradeTime", ko.observable(""));
                data.highBid = stateObject.set("highBid", ko.observable(""));
                data.lowAsk = stateObject.set("lowAsk", ko.observable(""));
                data.open = stateObject.set("open", ko.observable(""));
                data.close = stateObject.set("close", ko.observable(""));
                data.change = stateObject.set("change", ko.observable(""));
                data.formattedChange = stateObject.set("formattedChange", ko.observable(""));

                data.isForex = stateObject.set("isForex", ko.observable(false));
                data.isFuture = stateObject.set("isFuture", ko.observable(false));
                data.isShare = stateObject.set("isShare", ko.observable(false));
                data.isStock = stateObject.set("isStock", ko.observable(false));
                data.isNonForex = ko.observable(true);

                data.hasInstrument = ko.observable(false);
                data.ccyPair = stateObject.set("ccyPair", ko.observable(''));

                data.activeQuote = null;
                data.isActiveQuote = stateObject.set("isActiveQuote", ko.observable(false));
                data.activeQuoteState = ko.observable();
                data.PageName = eDealPage.NewLimitViewModel;

                data.dealMinMaxAmounts = ko.observableArray([]);
                data.dealAmountLabel = ko.observable("");
                data.openLimit = stateObject.set("openLimit", ko.observable("").extend({ dirty: false, rate: true }));
                data.limitCalc = ko.observable("").extend({ dirty: false });
                data.enableSLLimit = ko.observable(false);
                data.enableTPLimit = ko.observable(false);
                data.limitsReady = ko.observable(false);
                data.enableLimitLevel = ko.observable(false);

                data.lowerRangeNear = ko.observable("").extend({ dirty: false });
                data.higherRangeNear = ko.observable("").extend({ dirty: false });
                data.openLimitLowerRange = new LimitRangesCalculator.LimitRange(ko);
                data.openLimitHigherRange = new LimitRangesCalculator.LimitRange(ko);
                data.decimalDigit = ko.observable(0);

                data.bidLabel = {
                    First: ko.observable(""),
                    Middle: ko.observable(""),
                    Last: ko.observable("")
                };

                data.askLabel = {
                    First: ko.observable(""),
                    Middle: ko.observable(""),
                    Last: ko.observable("")
                };

                data.quotesAvailable = ko.observable(false);

                data.baseSymbol = ko.observable("");
                data.baseSymbolName = ko.observable("");

                data.profileKeyForDefaultTab = ko.observable(settings.profileKeyForDefaultTab);

                data.isSlRateActiveTab = ko.observable(false);
                data.isSlAmountActiveTab = ko.observable(false);
                data.isSlPercentActiveTab = ko.observable(false);
                data.isTpRateActiveTab = ko.observable(false);
                data.isTpAmountActiveTab = ko.observable(false);
                data.isTpPercentActiveTab = ko.observable(false);
                data.displaySlPercentSymbol = ko.observable(false);
                data.displayTpPercentSymbol = ko.observable(false);
                data.displaySlAmountCcySymbol = ko.observable(false);
                data.displayTpAmountCcySymbol = ko.observable(false);
                data.isProcessing = ko.observable(false);

                data.quoteForAccountCcyToOtherCcy = ko.observable("");

                // Functions
                data.buyBtnClick = function () {
                    data.enableLimitLevel(true);
                    setOrderDir(eOrderDir.Buy);
                };

                data.sellBtnClick = function () {
                    data.enableLimitLevel(true);
                    setOrderDir(eOrderDir.Sell);
                };

                data.chartTransactionEnabled = stateObject.set('chartTransactionEnabled', ko.observable(false));
            }

            function setComputables() {
                data.isShowBuyBox = self.createComputed(function () {
                    return data.orderDir() === eOrderDir.Buy;
                });

                data.isShowSellBox = self.createComputed(function () {
                    return data.orderDir() === eOrderDir.Sell;
                });

                data.ViewModelReady = self.createComputed(function () {
                    if (data.ready()) {
                        return true;
                    }

                    var hasInstrument = data.hasInstrument(),
                        hasLimits = data.limitsReady();

                    var isReady = hasInstrument && hasLimits;
                    data.ready(isReady);

                    return isReady;
                });

                data.ValidationRules = self.createComputed(function () {
                    // range near
                    if (data.lowerRangeNear() != data.higherRangeNear()) {
                        data.openLimit.rules.removeAll();

                        var limitRange = {}; //needed intervar : [minfar minnear] [maxnear maxfar]

                        if (data.orderDir() === eOrderDir.Sell) {

                            limitRange.minfar = general.toNumeric(Format.toRate(data.openLimitLowerRange.far(), true, data.selectedInstrument()));
                            limitRange.minnear = general.toNumeric(Format.toRate(data.openLimitLowerRange.near(), true, data.selectedInstrument()));
                            limitRange.maxnear = general.toNumeric(Format.toRate(data.openLimitHigherRange.near(), true, data.selectedInstrument()));
                            limitRange.maxfar = general.toNumeric(Format.toRate(data.openLimitHigherRange.far(), true, data.selectedInstrument()));

                            return {
                                required: true,
                                rangeInterval: limitRange,
                                rate: {
                                    message: Dictionary.GetItem("limitLevelInvalid"),
                                    params: true
                                },
                                toNumericLength: {
                                    ranges: [{
                                        from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: data.decimalDigit()
                                    }]
                                }
                            };
                        } else {
                            limitRange.minfar = general.toNumeric(Format.toRate(data.openLimitHigherRange.far(), true, data.selectedInstrument()));
                            limitRange.minnear = general.toNumeric(Format.toRate(data.openLimitHigherRange.near(), true, data.selectedInstrument()));
                            limitRange.maxnear = general.toNumeric(Format.toRate(data.openLimitLowerRange.near(), true, data.selectedInstrument()));
                            limitRange.maxfar = general.toNumeric(Format.toRate(data.openLimitLowerRange.far(), true, data.selectedInstrument()));

                            return {
                                required: true,
                                rangeInterval: limitRange,
                                rate: {
                                    message: Dictionary.GetItem("limitLevelInvalid"),
                                    params: true
                                },
                                toNumericLength: {
                                    ranges: [{
                                        from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: data.decimalDigit()
                                    }]
                                }
                            };
                        }
                    } else {
                        return data.openLimit.rules;
                    }

                }).extend({ notify: 'always' });

                data.isUp = ko.pureComputed(function () {
                    return data.activeQuoteState() === eQuoteStates.Up;
                });

                data.isDown = ko.pureComputed(function () {
                    return data.activeQuoteState() === eQuoteStates.Down;
                });
            }

            function setSubscribers() {
                self.subscribeAndNotify(data.ask, function (rate) {
                    var splitRate = Format.tenthOfPipSplitRate(rate, data.selectedInstrument());

                    data.askLabel.First(splitRate.button.first);
                    data.askLabel.Middle(splitRate.button.middle);
                    data.askLabel.Last(splitRate.button.last);
                });

                self.subscribeAndNotify(data.bid, function (rate) {
                    var splitRate = Format.tenthOfPipSplitRate(rate, data.selectedInstrument());

                    data.bidLabel.First(splitRate.button.first);
                    data.bidLabel.Middle(splitRate.button.middle);
                    data.bidLabel.Last(splitRate.button.last);
                });

                self.subscribeChanged(data.selectedInstrument, function (instrumentId, prevInstrumentId) {
                    if (prevInstrumentId && instrumentId !== prevInstrumentId) {
                        data.selectedDealAmount("");

                        if (!(stateObject.containsKey('skipReset') && stateObject.get("skipReset"))) {
                            data.orderDir(eOrderDir.None);
                        }
                    }
                });

                self.subscribeTo(data.selectedInstrument, function (instrumentId) {
                    var instrument = InstrumentsManager.GetInstrument(instrumentId),
                        roundMinMaxAmounts = function (amount) {
                            return [Math.ceil(amount[0]), Math.floor(amount[1])]
                        },
                        roundDefaultSize = function (defaultSize, minMaxAmounts) {
                            var up = Math.ceil(defaultSize);
                            return up < minMaxAmounts[1] ? up : Math.floor(defaultSize);
                        };

                    if (instrument) {
                        data.quotesAvailable(false);
                        data.dealMinMaxAmounts([]);

                        //order matters because of valueAllowUnset param from select in View  
                        InstrumentsManager.GetUpdatedInstrumentWithDealMinMaxAmounts(instrumentId).then(function (response) {
                            var dealMinMaxAmounts = instrument.isStock && response.dealMinMaxAmounts && response.dealMinMaxAmounts.length > 1 ?
                                roundMinMaxAmounts(response.dealMinMaxAmounts) : response.dealMinMaxAmounts,
                                defaultSize = instrument.isStock && dealMinMaxAmounts && dealMinMaxAmounts.length > 1 ?
                                    roundDefaultSize(response.defaultDealSize, dealMinMaxAmounts) : response.defaultDealSize;
                            data.dealMinMaxAmounts(dealMinMaxAmounts);
                            data.selectedDealAmount.extend({ amountValidation: dealMinMaxAmounts });
                            data.selectedDealAmount(data.selectedDealAmount() || defaultSize);
                        }).done();

                        data.ccyPair(instrument.ccyPair);
                        data.amountSymbol(instrument.otherSymbol);
                        data.baseSymbol(instrument.baseSymbol);
                        data.baseSymbolName(SymbolsManager.GetTranslatedSymbolById(instrument.baseSymbol));
                        data.isForex(instrument.isForex);
                        data.isShare(instrument.isShare);
                        data.isFuture(instrument.isFuture);
                        data.isStock(instrument.isStock);
                        data.isNonForex(instrument.instrumentTypeId !== eInstrumentType.Currencies);
                        data.decimalDigit(instrument.DecimalDigit);
                        limitLevelField.precision(instrument.DecimalDigit);

                        if (!(stateObject.containsKey('skipReset') && stateObject.get("skipReset"))) {
                            data.enableSLLimit(false);
                            data.enableTPLimit(false);
                            data.enableLimitLevel(false);

                            data.openLimit("");
                            data.openLimit.markClean();
                            data.openLimit.isModified(false);
                        }

                        var result = DealAmountLabel.Translate(instrument);
                        data.dealAmountLabel(result.label);

                        registerInstruments(instrumentId);
                        updateQuoteValues();

                        expirationDateModel.UpdateSelectedWithToday(instrumentId);

                        BuilderForInBetweenQuote.GetInBetweenQuote(Customer.prop.baseCcyId(), instrument.otherSymbol)
                            .then(function (response) {
                                data.quoteForAccountCcyToOtherCcy(response);
                            }).done();

                        data.hasInstrument(true);

                        updateTransactionViewArgs(instrumentId);
                    } else {
                        data.hasInstrument(false);
                    }
                });

                self.subscribeTo(data.openLimit, function (value) {
                    data.limitCalc(value);
                });

                self.subscribeTo(data.ValidationRules, function (value) {
                    data.openLimit.extend(value);
                });
            }

            /**
             * Get Transaction Switcher view args, 
             * if the view is not visible then return false
             * @returns {Object|False} 
             */
            function getTransactionViewArgs() {
                var transactionView = ViewsManager.GetActiveFormViewProperties(eViewTypes.vTransactionSwitcher);
                var priceAlertView = ViewsManager.GetActiveFormViewProperties(eViewTypes.vNewPriceAlert);

                if (transactionView && transactionView.visible()) {
                    return transactionView.args || {};
                } else if (priceAlertView && priceAlertView.visible()) {
                    return priceAlertView.args || {};
                }

                return false;
            }

            function updateTransactionViewArgs(instrumentId) {
                var args = getTransactionViewArgs();

                if (!general.isNullOrUndefined(args) && args !== false) {
                    args.instrumentId = instrumentId;
                    var transactionView = ViewsManager.GetActiveFormViewProperties(eViewTypes.vTransactionSwitcher);
                    var priceAlertView = ViewsManager.GetActiveFormViewProperties(eViewTypes.vNewPriceAlert);
                    if (transactionView && transactionView.visible()) {
                        ViewsManager.ChangeViewState(eViewTypes.vTransactionSwitcher, eViewState.Update, args);
                    } else if (priceAlertView && priceAlertView.visible()) {
                        ViewsManager.ChangeViewState(eViewTypes.vNewPriceAlert, eViewState.Update, args);
                    }

                }
            }

            function setPropertiesFromViewArgs() {
                var args = getTransactionViewArgs() || {},
                    toolTab = args.tab,
                    prevInstrumentId = data.selectedInstrument(),
                    instrumentId = args.instrumentId
                        || data.selectedInstrument()
                        || InstrumentsManager.GetUserDefaultInstrumentId();

                data.selectedInstrument(instrumentId);

                if (prevInstrumentId === instrumentId) {
                    data.selectedInstrument.notifySubscribers(instrumentId);
                }

                if (general.isInt(args.orderDir)) {
                    setOrderDir(args.orderDir);
                }

                if (args.selectedDealAmount) {
                    data.selectedDealAmount(args.selectedDealAmount);
                }

                data.initialToolTab((general.isDefinedType(toolTab) && general.isDefinedType(eNewDealTool[toolTab])) ? eNewDealTool[toolTab] : CustomerProfileManager.ProfileCustomer()[settings.profileKeyForDefaultTab] || eNewDealTool.Chart);
            }

            function setLimitTabsFromClientProfile() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();

                if (profileCustomer.defaultSlOrderTab) {
                    setLimitsModel.SetSlActiveTab(profileCustomer.defaultSlOrderTab);
                } else {
                    setLimitsModel.SetSlActiveTab(eSetLimitsTabs.Amount);
                }

                if (profileCustomer.defaultTpOrderTab) {
                    setLimitsModel.SetTpActiveTab(profileCustomer.defaultTpOrderTab);
                } else {
                    setLimitsModel.SetTpActiveTab(eSetLimitsTabs.Amount);
                }
            }

            function setOrderDir(orderDir) {
                if (orderDir != eOrderDir.Buy && orderDir != eOrderDir.Sell && orderDir != eOrderDir.None) {
                    orderDir = eOrderDir.None;
                }

                data.orderDir(orderDir);

                if (data.activeQuote) {
                    self.updateDistances();
                }
            }

            function updateQuoteValues() {
                data.activeQuote = QuotesManager.Quotes.GetItem(data.selectedInstrument());

                if (data.activeQuote) {
                    data.isActiveQuote(data.activeQuote.isActive());
                    data.bid(data.activeQuote.bid);
                    data.ask(data.activeQuote.ask);
                    data.open(data.activeQuote.open);
                    data.close(data.activeQuote.close);
                    data.change(Format.toPercent(data.activeQuote.change));
                    data.formattedChange(Format.toSignedPercent(data.activeQuote.change, ''));
                    data.changePips(data.activeQuote.changePips);
                    data.highBid(data.activeQuote.highBid);
                    data.lowAsk(data.activeQuote.lowAsk);
                    data.tradeTime(data.activeQuote.tradeTime);
                    data.quotesAvailable(true);
                    data.activeQuoteState(data.activeQuote.state);
                    self.updateDistances();
                }
            }

            function registerInstruments(instrumentId) {
                RegistrationManager.Update(eRegistrationListName.SingleQuote, instrumentId);
            }

            function registerToDispatcher() {
                QuotesManager.OnChange.Add(updateQuoteValues);
            }

            function unRegisterFromDispatcher() {
                QuotesManager.OnChange.Remove(updateQuoteValues);
            }
            // overridable
            self.updateDistances = function () {
                var orderDir = data.orderDir() === eOrderDir.None ? eOrderDir.Buy : data.orderDir(),
                    instrument = InstrumentsManager.GetInstrument(data.selectedInstrument());

                if (!instrument) {
                    return;
                }

                LimitRangesCalculator.CalculateOpeningRanges(data.bid(), data.ask(), orderDir, data.openLimitLowerRange, data.openLimitHigherRange, instrument, ClientStateFlagsManager.CSFlags.limitMultiplier);
                var openLimitLowerRange = orderDir === eOrderDir.Sell ? data.openLimitLowerRange.near() : data.openLimitHigherRange.near();
                data.lowerRangeNear(Format.toRate(openLimitLowerRange, true, data.selectedInstrument()));

                var openLimitHigherRange = orderDir === eOrderDir.Sell ? data.openLimitHigherRange.near() : data.openLimitLowerRange.near();
                data.higherRangeNear(Format.toRate(openLimitHigherRange, true, data.selectedInstrument()));

                var min1 = data.orderDir() === eOrderDir.Sell ? data.openLimitLowerRange.far() : data.openLimitHigherRange.far();
                var max1 = Math.min(data.openLimitHigherRange.near(), data.openLimitLowerRange.near());

                var min2 = Math.max(data.openLimitHigherRange.near(), data.openLimitLowerRange.near());
                var max2 = data.orderDir() === eOrderDir.Sell ? data.openLimitHigherRange.far() : data.openLimitLowerRange.far();

                limitLevelField.pipDigit(instrument.PipDigit);
                limitLevelField.precision(instrument.DecimalDigit);

                limitLevelField.min1(min1);
                limitLevelField.max1(max1);

                limitLevelField.min2(min2);
                limitLevelField.max2(max2);
            }

            function onOpenLimit(result, callerId, instrumentid, requestData) {
                data.hasInstrument(true);
                data.isProcessing(false);

                var instrument = InstrumentsManager.GetInstrument(instrumentid),
                    redirectToView = self.getSettings().onSuccessRedirectTo;

                if (instrument) {
                    if (baseOrder.ResultStatusSuccess(result)) {
                        InstrumentsManager.SetInstrumentDealAmount(instrumentid, requestData.amount);
                        ko.postbox.publish('new-limit-success', { instrument: data.ccyPair() });
                        saveDefaultLimitTab();
                        resetDealValues();
                    }

                    if (redirectToView) {
                        baseOrder.OnActionReturn(result, callerId, instrument, { redirectToView: redirectToView, requestData: requestData });
                    } else {
                        baseOrder.RaiseErrorEvent(result, 'new-limit-error-details', {});
                        baseOrder.OnActionReturn(result, callerId, instrument, { requestData: requestData });
                    }
                }
            }

            function resetDealValues() {
                data.openLimit(String.empty);
                setOrderDir(eOrderDir.None);

                setLimitsModel.Data.stopLossRate(String.empty);
                setLimitsModel.Data.takeProfitRate(String.empty);

                data.enableSLLimit(false);
                data.enableTPLimit(false);
            }

            function fillData(newLimit) {
                newLimit.positionNumber = 0;
                newLimit.instrumentID = data.selectedInstrument();
                newLimit.amount = data.selectedDealAmount();
                newLimit.orderDir = data.orderDir();
                newLimit.limitRate = data.openLimit();
                newLimit.ifDoneSLRate = 0;
                newLimit.ifDoneTPRate = 0;

                if (data.enableSLLimit()) {
                    newLimit.ifDoneSLRate = setLimitsModel.Data.stopLossRate() === "" ? 0 : setLimitsModel.Data.stopLossRate();
                }

                if (data.enableTPLimit()) {
                    newLimit.ifDoneTPRate = setLimitsModel.Data.takeProfitRate() === "" ? 0 : setLimitsModel.Data.takeProfitRate();
                }

                if (expirationDateModel.Data.expirationDateSelector.IsGoodTillCancelChecked()) {
                    newLimit.expirationDate = null;
                } else {
                    newLimit.expirationDate = expirationDateModel.Data.expirationDate();
                    var selectedHoursValue = expirationDateModel.Data.selectedHoursValue();

                    if (general.isObjectType(selectedHoursValue) && general.isEmptyType(selectedHoursValue)) {
                        newLimit.expirationDate += "  " + selectedHoursValue.value;
                    } else if (general.isStringType(selectedHoursValue) && !general.isEmptyType(selectedHoursValue)) {
                        newLimit.expirationDate += "  " + selectedHoursValue;
                    } else {
                        newLimit.expirationDate += "  00:00";
                    }
                }

                newLimit.mode = eLimitMode.OpenDeal;
                newLimit.type = eLimitType.None;
            }

            function saveDefaultLimitTab() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();
                profileCustomer.defaultSlOrderTab = setLimitsModel.Data.curSlActiveTab();
                profileCustomer.defaultTpOrderTab = setLimitsModel.Data.curTpActiveTab();
                CustomerProfileManager.ProfileCustomer(profileCustomer);
            }

            function dispose() {
                unRegisterFromDispatcher();

                data.selectedDealAmount.extend({ amountValidation: false });
                stateObject.unset('cachedOvernightFinancing');

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                SetLimitsModel: setLimitsModel,
                ExpirationDate: expirationDateModel,
                LimitLevelField: limitLevelField,
                fillData: fillData,
                onOpenLimit: onOpenLimit,
                unRegisterFromDispatcher: unRegisterFromDispatcher,
                registerToDispatcher: registerToDispatcher,
                setLimitTabsFromClientProfile: setLimitTabsFromClientProfile
            };
        });

        return LimitBaseViewModel;
    }
);
