define(
    'viewmodels/Limits/EditLimitBaseViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'configuration/initconfiguration',
        'Dictionary',
        'dataaccess/dalorder',
        'deviceviewmodels/BaseOrder',
        'viewmodels/limits/SetLimitsViewModel',
        'viewmodels/limits/RateFieldModel',
        'devicemanagers/ViewModelsManager',
        'cachemanagers/activelimitsmanager',
        'managers/instrumentTranslationsManager',
        'initdatamanagers/InstrumentsManager',
        'cachemanagers/QuotesManager',
        'viewmodels/limits/ExpirationDateModel',
        'managers/CustomerProfileManager',
        'initdatamanagers/Customer',
        'initdatamanagers/SymbolsManager',
        'devicemanagers/AlertsManager',
        'StateObject!Transaction',
        'managers/viewsmanager',
        'modules/BuilderForInBetweenQuote',
        'FxNet/LogicLayer/Deal/DealAmountLabel',
        'viewmodels/Limits/AmountFieldsWrapper',
        'cachemanagers/ClientStateFlagsManager',
        'calculators/LimitRangeCalculator',
        'FxNet/LogicLayer/Deal/DealLifeCycle',
        'handlers/limit'
    ],
    function EditLimitBaseDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            settings = require('configuration/initconfiguration').EditLimitSettingsConfiguration,
            dalOrders = require('dataaccess/dalorder'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            SetLimitsViewModel = require('viewmodels/limits/SetLimitsViewModel'),
            ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            ActiveLimitsManager = require('cachemanagers/activelimitsmanager'),
            InstrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            ExpirationDateModel = require('viewmodels/limits/ExpirationDateModel'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            Customer = require('initdatamanagers/Customer'),
            SymbolsManager = require('initdatamanagers/SymbolsManager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            stateObject = require('StateObject!Transaction'),
            viewsManager = require('managers/viewsmanager'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            DealAmountLabel = require('FxNet/LogicLayer/Deal/DealAmountLabel'),
            AmountFieldsWrapper = require('viewmodels/Limits/AmountFieldsWrapper'),
            ClientStateFlagsManager = require('cachemanagers/ClientStateFlagsManager'),
            RateFieldModel = require('viewmodels/limits/RateFieldModel'),
            LimitRangesCalculator = require('calculators/LimitRangeCalculator'),
            dealLifeCycle = require('FxNet/LogicLayer/Deal/DealLifeCycle'),
            tlimit = require('handlers/limit');

        var EditLimitBaseViewModel = general.extendClass(KoComponentViewModel, function EditLimitBaseClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                orderId = null,
                activeQuote = null,
                selectedLimit = null,
                validationModel = {},
                baseOrder = new BaseOrder(),
                fieldWrappers = new AmountFieldsWrapper(),
                expirationDateModel = new ExpirationDateModel(),
                setLimitsViewModel = new SetLimitsViewModel(),
                limitLevelField = new RateFieldModel();

            function init(customSettings) {
                parent.init.call(self, customSettings); // inherited from KoComponentViewModel	

                baseOrder.Init({}, data);
                expirationDateModel.Init();

                setProperties();
                setObservables();
                setComputables();
                setSubscribers();

                setStaticInfo();

                registerToDispatcher();
                updateRateValue();
                setLimitsViewModel.Init(data, self.getSettings().setlimitsConfiguration);
                fieldWrappers.init(setLimitsViewModel, data);

                setActiveSLOrTP();
                setChartProperties();
                stateObject.update('currentRateDirectionSwitch', viewsManager.GetViewArgs(eViewTypes.vEditLimit).currentRateDirectionSwitch);
            }

            function setProperties() {
                data.PageName = ViewModelsManager.VManager.GetViewArgs(eViewTypes.vEditLimit).pageName;
            }

            function setObservables() {
                data.ccyPair = stateObject.set('ccyPair', ko.observable(''));
                data.orderID = ko.observable("");
                data.entryTime = ko.observable("");
                data.instrumentID = ko.observable(0);
                data.dealAmountLabel = ko.observable("");
                data.selectedDealAmount = stateObject.set('selectedDealAmount', ko.observable('').extend({ dirty: false }));
                data.buySymbol = ko.observable("");
                data.sellSymbol = ko.observable("");
                data.orderDir = stateObject.set('orderDir', ko.observable(''));
                data.isNonForex = ko.observable(true);
                data.bid = stateObject.set('bid', ko.observable(''));
                data.ask = stateObject.set('ask', ko.observable(''));
                data.spotRateLabel = ko.observable("");
                data.isActiveQuote = stateObject.set('isActiveQuote', ko.observable(false));
                data.openLimit = ko.observable("").extend({ dirty: false, rate: true });
                data.openLimitLowerRange = new LimitRangesCalculator.LimitRange(ko);
                data.openLimitHigherRange = new LimitRangesCalculator.LimitRange(ko);
                data.lowerRangeNear = ko.observable("").extend({ dirty: false });
                data.higherRangeNear = ko.observable("").extend({ dirty: false });
                data.decimalDigit = ko.observable(0);
                data.limitCalc = ko.observable("").extend({ dirty: false });
                data.onSaveLimitEnable = ko.observable("");
                data.setLimitsIsDirty = ko.observable(false);
                data.templateToUse = ko.observable("");
                data.isShowEditableRate = ko.observable("");
                data.ready = ko.observable(false);
                data.hasInstrument = ko.observable(false);
                data.customerSymbolId = ko.observable(Customer.prop.baseCcyId());
                data.onRemoveLimitEnable = ko.observable(true);
                data.isProcessing = ko.observable(false);
                data.limitType = ko.observable(eLimitType.None);
                data.baseSymbolId = ko.observable("");
                data.otherSymbolId = ko.observable("");
                data.lowerRangeNearLabel = ko.observable("");
                data.higherRangeNearLabel = ko.observable("");
                data.expirationDate = ko.observable("");
                data.isStock = ko.observable(false);

                data.selectedInstrument = stateObject.set('selectedInstrument', ko.observable(''));
                data.profileKeyForDefaultTab = ko.observable(settings.profileKeyForDefaultTab);
                data.initialToolTab = stateObject.set('initialToolTab', ko.observable(''));
                data.customerSymbolName = stateObject.set('customerSymbolName', ko.observable(''));
                data.changePips = ko.observable("");

                data.quoteForOtherCcyToAccountCcy = stateObject.get("quoteForOtherCcyToAccountCcy");

                if (data.quoteForOtherCcyToAccountCcy) {
                    data.quoteForOtherCcyToAccountCcy('');
                } else {
                    data.quoteForOtherCcyToAccountCcy = stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
                }

                data.quoteForAccountCcyToOtherCcy = ko.observable("");
                data.amountSymbol = stateObject.set('amountSymbol', ko.observable(''));
                data.bidPips = ko.observable("");
                data.askPips = ko.observable("");
                data.isFuture = stateObject.set('isFuture', ko.observable(''));
                data.isShare = stateObject.set('isShare', ko.observable(''));
                data.open = stateObject.set('open', ko.observable(''));
                data.close = stateObject.set('close', ko.observable(''));
                data.change = stateObject.set('change', ko.observable(''));
                data.formattedChange = stateObject.set("formattedChange", ko.observable(""));
                data.tradeTime = stateObject.set('tradeTime', ko.observable(''));
                data.highBid = stateObject.set('highBid', ko.observable(''));
                data.lowAsk = stateObject.set('lowAsk', ko.observable(''));
                data.isForex = ko.observable("");
                data.prevBid = ko.observable("");
                data.prevAsk = ko.observable("");

                data.enableSLLimit = ko.observable(false);
                data.enableTPLimit = ko.observable(false);

                data.enableLimitLevel = ko.observable(false);
                data.showLimits = ko.observable(false).extend({ notify: "always" });
                data.limitsReady = ko.observable(false);
                data.isSlRateActiveTab = ko.observable(false);
                data.displaySlPercentSymbol = ko.observable(false);
                data.displayTpPercentSymbol = ko.observable(false);
                data.isSlAmountActiveTab = ko.observable(false);
                data.isSlPercentActiveTab = ko.observable(false);
                data.isTpRateActiveTab = ko.observable(false);
                data.isTpAmountActiveTab = ko.observable(false);
                data.isTpPercentActiveTab = ko.observable(false);
                data.displaySlAmountCcySymbol = ko.observable(false);
                data.displayTpAmountCcySymbol = ko.observable(false);

                data.slRate = ko.observable("").extend({ dirty: false });
                data.tpRate = ko.observable("").extend({ dirty: false });

                data.customerSymbolName(Customer.prop.baseCcyName());
                data.initialToolTab(CustomerProfileManager.ProfileCustomer()[settings.profileKeyForDefaultTab] || eNewDealTool.Chart);
                data.addSlTpType = ko.observable(eLimitType.None);

                data.corporateActionDate = ko.observable();
                data.showShareCorporateActionDealInfo = ko.observable();
                data.chartTransactionEnabled = stateObject.set('chartTransactionEnabled', ko.observable(false));
            }

            function setComputables() {
                data.isShowBuyBox = self.createComputed(function () {
                    return data.orderDir() === eOrderDir.Buy;
                });

                data.isShowSellBox = self.createComputed(function () {
                    return data.orderDir() === eOrderDir.Sell;
                });

                data.setLimitsIsDirty = self.createComputed(function () {
                    var limitsReady = data.limitsReady();

                    if (!limitsReady) {
                        return false;
                    }

                    var slOriginalRate = general.toNumeric(data.slRate.originalValue()),
                        stopLossRate = general.toNumeric(setLimitsViewModel.Data.stopLossRate() || "0"),
                        slChanged = slOriginalRate !== stopLossRate,

                        tpOriginalRate = general.toNumeric(data.tpRate.originalValue()),
                        takeProfitRate = general.toNumeric(setLimitsViewModel.Data.takeProfitRate() || "0"),
                        tpChanged = tpOriginalRate !== takeProfitRate;

                    if (slChanged || tpChanged) {
                        return true;
                    }

                    return false;
                });

                data.baseSymbolName = self.createComputed(function () {
                    return data.orderDir() == eOrderDir.Buy ? data.buySymbol() : data.sellSymbol();
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
                    if (data.lowerRangeNear() != data.higherRangeNear()) {
                        data.openLimit.rules.removeAll();

                        var limitRange = {};

                        if (data.orderDir() === eOrderDir.Buy) {

                            limitRange.minfar = general.toNumeric(Format.toRate(data.openLimitHigherRange.far(), true, data.instrumentID()));
                            limitRange.minnear = general.toNumeric(Format.toRate(data.openLimitHigherRange.near(), true, data.instrumentID()));
                            limitRange.maxnear = general.toNumeric(Format.toRate(data.openLimitLowerRange.near(), true, data.instrumentID()));
                            limitRange.maxfar = general.toNumeric(Format.toRate(data.openLimitLowerRange.far(), true, data.instrumentID()));

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

                            limitRange.minfar = general.toNumeric(Format.toRate(data.openLimitLowerRange.far(), true, data.instrumentID()));
                            limitRange.minnear = general.toNumeric(Format.toRate(data.openLimitLowerRange.near(), true, data.instrumentID()));
                            limitRange.maxnear = general.toNumeric(Format.toRate(data.openLimitHigherRange.near(), true, data.instrumentID()));
                            limitRange.maxfar = general.toNumeric(Format.toRate(data.openLimitHigherRange.far(), true, data.instrumentID()));

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

                data.EditLimitReady = self.createComputed(function () {
                    var isActiveQuote = data.isActiveQuote(),
                        isDirtyOpenLimit = data.openLimit.isDirty(),
                        isDirtyLimitsModel = !!data.setLimitsIsDirty(),
                        isDirtyExpirationDateTime = expirationDateModel.Data.isExpirationDateDirty(),
                        isLimitLevelValid = data.openLimit ? data.openLimit.isValid() : false,
                        // In web case we don't need to disbale update button if we have errors on SL/TP limits
                        hasLimitsErrors = settings.showValidationTooltips ? false : setLimitsViewModel.Validate().length > 0,
                        isDirty = (isDirtyOpenLimit || isDirtyLimitsModel || isDirtyExpirationDateTime),

                        isGuiContextAvailable = data.onSaveLimitEnable(),
                        isExpirationDateTimeValid = expirationDateModel.IsValid(),
                        isBrokerAllowLimitsOnNoRates = Customer.prop.brokerAllowLimitsOnNoRates,

                        result = ((isBrokerAllowLimitsOnNoRates || isActiveQuote) && isGuiContextAvailable && isExpirationDateTimeValid && isDirty && isLimitLevelValid && !hasLimitsErrors);

                    return result;
                }).extend({ notify: 'always' });
            }

            function setSubscribers() {
                self.subscribeTo(data.ValidationRules, function () {
                    data.openLimit.extend(data.ValidationRules());
                });

                self.subscribeTo(data.openLimit, function (openLimitValue) {
                    var rate = general.toNumeric(openLimitValue);

                    if (general.isNullOrUndefined(data.openLimitLowerRange) || general.isNullOrUndefined(data.openLimitHigherRange)) {
                        return;
                    }

                    if (general.InRange(rate, data.openLimitLowerRange) || general.InRange(rate, data.openLimitHigherRange)) {
                        data.limitCalc(rate);
                    }
                });
            }

            function setActiveSLOrTP() {
                var limitType = ViewModelsManager.VManager.GetViewArgs(eViewTypes.vEditLimit).limitType;

                var profileCustomer = CustomerProfileManager.ProfileCustomer();
                data.showLimits(profileCustomer.editLimitIfDoneExpanded === 1);

                selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);
                if (selectedLimit) {
                    if (limitType) {
                        data.showLimits(true);
                        data.addSlTpType(limitType);
                    }

                    if (limitType === eLimitType.StopLoss) {
                        data.enableSLLimit(true);
                    }

                    if (limitType === eLimitType.TakeProfit) {
                        data.enableTPLimit(true);
                    }
 
                    if (!general.isNullOrUndefined(selectedLimit.slRate) && selectedLimit.slRate != 0) {
                        data.enableSLLimit(true);
                    }

                    if (!general.isNullOrUndefined(selectedLimit.tpRate) && selectedLimit.tpRate != 0) {
                        data.enableTPLimit(true);
                    }
                }
            }

            function setRateLabel(rate, instrumentId) {
                var rateLabel = {
                    First: 0,
                    Middle: 0,
                    Last: 0
                };

                var splitSpotRate = Format.tenthOfPipSplitRate(rate, instrumentId);

                rateLabel.First = splitSpotRate.button.first;
                rateLabel.Middle = splitSpotRate.button.middle;
                rateLabel.Last = splitSpotRate.button.last;

                return rateLabel;
            }

            function setStaticInfo() {
                orderId = ViewModelsManager.VManager.GetViewArgs(eViewTypes.vEditLimit).orderId;

                data.onSaveLimitEnable(true);
                data.onRemoveLimitEnable(true);

                selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);

                if (selectedLimit) {
                    data.orderID(orderId);
                    data.entryTime(selectedLimit.entryTime);
                    data.limitType(selectedLimit.type);
                    data.instrumentID(selectedLimit.instrumentID);
                    data.ccyPair(InstrumentTranslationsManager.Long(selectedLimit.instrumentID));
                    data.selectedDealAmount(selectedLimit.orderDir == eOrderDir.Sell ? selectedLimit.sellAmount : selectedLimit.buyAmount);
                    data.buySymbol(SymbolsManager.GetTranslatedSymbolById(selectedLimit.buySymbolID));
                    data.sellSymbol(SymbolsManager.GetTranslatedSymbolById(selectedLimit.sellSymbolID));
                    data.orderDir(selectedLimit.orderDir);
                    data.limitCalc(selectedLimit.orderRate);
                    data.selectedInstrument(selectedLimit.instrumentID);
                    data.templateToUse(eTemplateNames.editLimitNavigator);
                    data.isShowEditableRate(false);
                    data.openLimit(selectedLimit.orderRate);
                    data.expirationDate(selectedLimit.expirationDate);

                    data.slRate(selectedLimit.slRate);
                    data.slRate.markClean();

                    data.tpRate(selectedLimit.tpRate);
                    data.tpRate.markClean();

                    var instrument = InstrumentsManager.GetInstrument(selectedLimit.instrumentID);
                    if (instrument) {
                        var result = DealAmountLabel.Translate(instrument),
                            corporateActionDate = instrument.getCorporateActionDate();
                        data.dealAmountLabel(result.label);

                        data.isNonForex(instrument.instrumentTypeId !== eInstrumentType.Currencies);
                        data.decimalDigit(instrument.DecimalDigit);
                        limitLevelField.precision(instrument.DecimalDigit);
                        data.amountSymbol(instrument.otherSymbol);
                        data.isFuture(instrument.isFuture);
                        data.isForex(instrument.isForex);
                        data.isShare(instrument.isShare);
                        data.enableSLLimit(false);
                        data.enableTPLimit(false);
                        data.baseSymbolId(instrument.baseSymbol);
                        data.otherSymbolId(instrument.otherSymbol);

                        populateInBetweenQuotes(instrument);

                        expirationDateModel.UpdateSelectedWithToday(selectedLimit.instrumentID);
                        data.hasInstrument(true);
                        data.isStock(instrument.isStock);

                        data.corporateActionDate(corporateActionDate);
                        data.showShareCorporateActionDealInfo(
                            dealLifeCycle.sharesIsCorporateActionDateSignificant_BeforeDeal(
                                Customer.prop.dealPermit,
                                instrument.assetTypeId,
                                corporateActionDate
                            )
                        );
                    }

                    if (!general.isEmpty(selectedLimit.expirationDate) && settings.showExpirationCalendar) {
                        expirationDateModel.SetOrder(selectedLimit.orderID);
                    }
                }

                data.openLimit.markClean();

                if (activeQuote) {
                    updateDistances();
                }
            }

            function populateInBetweenQuotes(instrument) {
                BuilderForInBetweenQuote.GetInBetweenQuote(instrument.otherSymbol, Customer.prop.baseCcyId())
                    .then(function (response) {
                        data.quoteForOtherCcyToAccountCcy(response);
                    }).done();

                BuilderForInBetweenQuote.GetInBetweenQuote(Customer.prop.baseCcyId(), instrument.otherSymbol)
                    .then(function (response) {
                        data.quoteForAccountCcyToOtherCcy(response);
                    }).done();
            }

            function updateDistances() {
                selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);
                var instrument = InstrumentsManager.GetInstrument(selectedLimit.instrumentID),
                    orderDir = data.orderDir();

                LimitRangesCalculator.CalculateOpeningRanges(data.bid(), data.ask(), orderDir, data.openLimitLowerRange, data.openLimitHigherRange, instrument, ClientStateFlagsManager.CSFlags.limitMultiplier);
                var openLimitLowerRange = orderDir === eOrderDir.Sell ? data.openLimitLowerRange.near() : data.openLimitHigherRange.near();
                data.lowerRangeNear(Format.toRate(openLimitLowerRange, true, data.instrumentID()));

                var openLimitHigherRange = orderDir === eOrderDir.Sell ? data.openLimitHigherRange.near() : data.openLimitLowerRange.near();
                data.higherRangeNear(Format.toRate(openLimitHigherRange, true, data.instrumentID()));

                data.lowerRangeNearLabel(setRateLabel(data.lowerRangeNear(), data.instrumentID()));
                data.higherRangeNearLabel(setRateLabel(data.higherRangeNear(), data.instrumentID()));

                var min1 = orderDir === eOrderDir.Sell ? data.openLimitLowerRange.far() : data.openLimitHigherRange.far();
                var max1 = Math.min(data.openLimitHigherRange.near(), data.openLimitLowerRange.near());

                var min2 = Math.max(data.openLimitHigherRange.near(), data.openLimitLowerRange.near());
                var max2 = orderDir === eOrderDir.Sell ? data.openLimitHigherRange.far() : data.openLimitLowerRange.far();

                limitLevelField.pipDigit(instrument.PipDigit);
                limitLevelField.precision(instrument.DecimalDigit);

                limitLevelField.min1(min1);
                limitLevelField.max1(max1);

                limitLevelField.min2(min2);
                limitLevelField.max2(max2);
            }

            function updateRateValue() {
                selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);
                if (selectedLimit) {

                    activeQuote = QuotesManager.Quotes.GetItem(selectedLimit.instrumentID);

                    if (activeQuote) {
                        data.isActiveQuote(activeQuote.isActive());
                        data.prevBid(data.bid());
                        data.prevAsk(data.ask());
                        data.bid(activeQuote.bid);
                        data.ask(activeQuote.ask);
                        data.changePips(activeQuote.changePips);
                        data.open(activeQuote.open);
                        data.close(activeQuote.close);
                        data.change(Format.toPercent(activeQuote.change));
                        data.formattedChange(Format.toSignedPercent(activeQuote.change, ''));
                        data.tradeTime(activeQuote.tradeTime);
                        data.highBid(activeQuote.highBid);
                        data.lowAsk(activeQuote.lowAsk);
                        var spotRate = selectedLimit.orderDir == eOrderDir.Buy ? activeQuote.ask : activeQuote.bid;
                        data.spotRateLabel(setRateLabel(spotRate, selectedLimit.instrumentID));

                        updateDistances();
                    }
                }
            }

            function setLimitTabsFromClientProfile() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();

                if (profileCustomer.defaultEditSlLimitTab) {
                    setLimitsViewModel.SetSlActiveTab(profileCustomer.defaultEditSlLimitTab);
                } else {
                    setLimitsViewModel.SetSlActiveTab(eSetLimitsTabs.Amount);
                }

                if (profileCustomer.defaultEditTpLimitTab) {
                    setLimitsViewModel.SetTpActiveTab(profileCustomer.defaultEditTpLimitTab);
                } else {
                    setLimitsViewModel.SetTpActiveTab(eSetLimitsTabs.Amount);
                }
            }

            function saveDefaultLimitTab() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();
                profileCustomer.defaultEditSlLimitTab = setLimitsViewModel.Data.curSlActiveTab();
                profileCustomer.defaultEditTpLimitTab = setLimitsViewModel.Data.curTpActiveTab();
                CustomerProfileManager.ProfileCustomer(profileCustomer);
            }

            function onLimitsChange(updatedItems) {
                if (updatedItems.newLimits && updatedItems.newLimits.length > 0) {

                    orderId = updatedItems.newLimits[0];

                    var limit = ActiveLimitsManager.limits.GetItem(orderId);
                    if (limit) {
                        data.openLimit(limit.orderRate);
                        data.openLimit.markClean();
                    }
                }
            }

            function registerToDispatcher() {
                QuotesManager.OnChange.Add(updateRateValue);
                ActiveLimitsManager.OnChange.Add(onLimitsChange);
            }

            function unRegisterFromDispatcher() {
                QuotesManager.OnChange.Remove(updateRateValue);
                ActiveLimitsManager.OnChange.Remove(onLimitsChange);
            }

            function unsetValidationModel() {
                if (validationModel.Limits &&
                    validationModel.Limits.isValid &&
                    general.isFunctionType(validationModel.Limits.isValid.dispose)) {
                    validationModel.Limits.isValid.dispose();
                }

                validationModel.Limits = null;
            }

            function validate() {
                selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);

                if (!selectedLimit) {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, String.format("{0}", Dictionary.GetItem("OrderError7")), null, { redirectToView: eForms.Limits });
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                    return false;
                }

                return true;
            }

            function onRemoveLimit() {
                if (!data.onRemoveLimitEnable()) {
                    return;
                }

                if (validate()) {
                    selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);

                    if (baseOrder.LimitValidate(selectedLimit.instrumentID, setLimitsViewModel.Validate()) && baseOrder.LimitValidateQuote(selectedLimit.instrumentID)) {
                        var limit = new tlimit(selectedLimit.orderID);
                        fillLimitData(limit);

                        data.isProcessing(true);
                        data.onRemoveLimitEnable(false);

                        dalOrders.DeleteLimit(limit, onRemoveLimitReturn);
                    }
                }
            }

            function onRemoveLimitReturn(result, callerId, requestData) {
                data.onRemoveLimitEnable(true);
                data.isProcessing(false);

                var instrument = InstrumentsManager.GetInstrument(data.instrumentID());

                if (instrument) {
                    baseOrder.OnActionReturn(result, callerId, instrument, { redirectToView: eForms.Limits, requestData: requestData });
                }
            }

            function fillLimitData(limit) {
                limit.positionNumber = 0;
                limit.instrumentID = data.instrumentID();
                limit.amount = data.selectedDealAmount();
                limit.orderDir = data.orderDir();
                limit.limitRate = data.openLimit();
                limit.ifDoneSLRate = setLimitsViewModel.ObservableSetLimitsObject.stopLossRate() == "" ? 0 : setLimitsViewModel.ObservableSetLimitsObject.stopLossRate();
                limit.ifDoneTPRate = setLimitsViewModel.ObservableSetLimitsObject.takeProfitRate() == "" ? 0 : setLimitsViewModel.ObservableSetLimitsObject.takeProfitRate();
                limit.expirationDate = getExpirationDate();
                limit.mode = eLimitMode.OpenDeal;
                limit.type = eLimitType.None;
            }

            function getExpirationDate() {
                var expirationDate = null;

                if (!expirationDateModel.Data.expirationDateSelector.IsGoodTillCancelChecked()) {
                    expirationDate = expirationDateModel.Data.expirationDate();
                    var selectedHoursValue = expirationDateModel.Data.selectedHoursValue();

                    if (general.isObjectType(selectedHoursValue) && general.isEmptyType(selectedHoursValue)) {
                        expirationDate += "  " + selectedHoursValue.value;
                    } else if (general.isStringType(selectedHoursValue) && !general.isEmptyType(selectedHoursValue)) {
                        expirationDate += "  " + selectedHoursValue;
                    } else {
                        expirationDate += "  00:00";
                    }
                }

                return expirationDate;
            }

            function editLimitInternal() {
                if (!data.EditLimitReady()) {
                    return;
                }

                var limitsErrors = setLimitsViewModel.Validate();

                if (limitsErrors.length) {
                    if (settings.showValidationTooltips) {
                        // expand set limits section if there are errors
                        ko.postbox.publish('deal-slip-show-validation-tooltips');
                        data.showLimits(true);
                    }

                    return;
                }

                onSaveLimit();
            }

            var editLimit = debounce(editLimitInternal);

            function onSaveLimit() {
                if (validate()) {
                    selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);

                    if (baseOrder.LimitValidate(selectedLimit.instrumentID, setLimitsViewModel.Validate()) && baseOrder.LimitValidateQuote(selectedLimit.instrumentID)) {
                        var limit = new tlimit(selectedLimit.orderID);
                        fillLimitData(limit);

                        if (invalidEnableSlTpLimit(limit)) {
                            return enabledSltpValidationError();
                        }

                        limit.removedIfDoneSLRate = (0 == parseFloat(limit.ifDoneSLRate) && 0 < parseFloat(selectedLimit.slRate));
                        limit.removedIfDoneTPRate = (0 == parseFloat(limit.ifDoneTPRate) && 0 < parseFloat(selectedLimit.tpRate));

                        data.onSaveLimitEnable(false);
                        data.isProcessing(true);

                        dalOrders.EditLimit(limit, onSaveLimitReturn);
                    }
                }
            }

            function onSaveLimitReturn(result, callerId, requestData) {
                data.onSaveLimitEnable(true);

                selectedLimit = ActiveLimitsManager.limits.GetItem(orderId);

                if (selectedLimit) {
                    var instrument = InstrumentsManager.GetInstrument(selectedLimit.instrumentID);

                    if (instrument) {

                        if (baseOrder.ResultStatusSuccess(result)) {
                            saveDefaultLimitTab();
                        }

                        data.isProcessing(false);
                        data.isShowEditableRate(false);
                        setLimitsViewModel.MarkClean();
                        baseOrder.OnActionReturn(result, callerId, instrument, { redirectToView: eForms.Limits, requestData: requestData });
                    }
                }
            }

            function invalidEnableSlTpLimit(limit) {
                return data.enableSLLimit() && limit.ifDoneSLRate === 0 || data.enableTPLimit() && limit.ifDoneTPRate === 0;
            }

            function ignoreSltpValidationError() {
                data.enableSLLimit(false);
                data.enableTPLimit(false);
                onSaveLimit();
            }

            function enabledSltpValidationError() {
                AlertsManager.UpdateAlert(
                    AlertTypes.GeneralOkAlert,
                    Dictionary.GetItem('pleaseNoteTitle'),
                    Dictionary.GetItem('sltpValidationMsg', 'deals_EditLimit'),
                    null,
                    { okButtonCallback: ignoreSltpValidationError }
                );
                AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
            }

            function switchToRate() {
                setLimitsViewModel.SetActiveTab(eSetLimitsTabs.Rate);
            }

            function setChartProperties() {
                stateObject.update('stopLossRate', setLimitsViewModel.Data.stopLossRate);
                stateObject.update('takeProfitRate', setLimitsViewModel.Data.takeProfitRate);
                stateObject.update('openLimit', data.openLimit);
                stateObject.update('chart', viewsManager.GetViewArgs(eViewTypes.vEditLimit).chart);
                stateObject.update('switchToRate', switchToRate);
            }

            function dispose() {
                setLimitsViewModel.Stop();
                unRegisterFromDispatcher();
                unsetValidationModel();
                fieldWrappers.dispose();
                fieldWrappers = null;
                stateObject.unset('cachedOvernightFinancing');
                stateObject.unset('currentRateDirectionSwitch');
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                EditLimit: editLimit,
                ExpirationDate: expirationDateModel,
                SetLimitsInfo: setLimitsViewModel.ObservableSetLimitsObject,
                SetLimitsViewProperties: setLimitsViewModel.ViewProperties,
                TPField: setLimitsViewModel.TPField,
                SLField: setLimitsViewModel.SLField,
                FieldWrappers: fieldWrappers,
                DeleteLimit: onRemoveLimit,
                LimitLevelField: limitLevelField,
                ValidationModel: validationModel,
                SetLimitsViewModel: setLimitsViewModel,
                setLimitTabsFromClientProfile: setLimitTabsFromClientProfile,
                FillLimitData: fillLimitData
            };
        });

        return EditLimitBaseViewModel;
    }
);