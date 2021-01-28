define(
    'deviceviewmodels/OpenedDealRowViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        'helpers/KoComponentViewModel',
        'initdatamanagers/Customer',
        'initdatamanagers/InstrumentsManager',
        'cachemanagers/dealsmanager',
        'cachemanagers/QuotesManager',
        'viewmodels/QuotesSubscriber',
        'handlers/AmountConverter',
        'viewmodels/dialogs/DialogViewModel',
        'managers/PrintExportManager',
        'StateObject!OpenedDeals'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dictionary = require('Dictionary'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            customer = require('initdatamanagers/Customer'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dealsManager = require('cachemanagers/dealsmanager'),
            quotesManager = require('cachemanagers/QuotesManager'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            AmountConverter = require('handlers/AmountConverter'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            printExportManager = require('managers/PrintExportManager'),
            stateObject = require('StateObject!OpenedDeals');


        var OpenedDealRowViewModel = general.extendClass(KoComponentViewModel, function OpenedDealRowViewModelClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data,
                subscribers = [],
                quotesVM = new QuotesSubscriber(),
                selection = stateObject.get('selection'),
                availableSelection = stateObject.get('availableSelection'),
                _deal = dealsManager.Deals.Container[params.orderID];

            function init(settings) {
                parent.init.call(self, settings);
    
                setRowData();
                registerToDispatcher();
                setSubscribers();
            }

            function setRowData() {
                data.orderID = _deal.orderID;
                data.positionNumber = _deal.positionNumber;
                data.instrumentID = _deal.instrumentID;
                data.orderDir = _deal.orderDir;
                data.exeTime = _deal.exeTime;
                data.dealAmount = _deal.orderDir == eOrderDir.Sell ? _deal.sellAmount : _deal.buyAmount;
                data.dealType = _deal.dealType;

                data.buyAmount = _deal.buyAmount;
                data.buySymbolID = _deal.buySymbolID;
                data.sellAmount = _deal.sellAmount;
                data.sellSymbolID = _deal.sellSymbolID;

                data.orderRate = _deal.orderRate;

                data.typeSL = dictionary.GetItem("limtype1_short");
                data.typeTP = dictionary.GetItem("limtype2_short");
                data.isStock = instrumentsManager.IsInstrumentStock(_deal.instrumentID);
                data.valueDate = getValueDate(_deal);
                if (!data.valueDate.isValueDateEmpty && general.isFunctionType(params.UpdateVdColumnVisibility)) {
                    params.UpdateVdColumnVisibility(true);
                }

                setObservables();
                setComputables();

                updateQuoteValue();
            }

            function setObservables() {
                data.isChecked = ko.observable(selection.indexOf(data.orderID) !== -1);
                data.quoteIsActive = ko.observable(false);
                // data.OnCloseDealEnable = ko.observable(true);
                // data.ThisDealSwipe = ko.observable(true);
                data.hasAdditionalPL = ko.observable(Number(_deal.additionalPL) !== 0);

                data.slRate = ko.observable(_deal.slRate == 0 ? cEmptyRate : _deal.slRate);
                data.tpRate = ko.observable(_deal.tpRate == 0 ? cEmptyRate : _deal.tpRate);

                data.prevSpotRate = ko.observable(_deal.spotRate);
                data.spotRate = ko.observable(_deal.spotRate);
                data.fwPips = ko.observable(_deal.fwPips);
                data.prevClosingRate = ko.observable(_deal.closingRate);
                data.closingRate = ko.observable(_deal.closingRate);

                data.plSign = ko.observable(Math.floor(general.toNumeric(_deal.pl)).sign());

                data.pl = ko.observable(Number.toStr(_deal.pl));
                data.commission = ko.observable(Number.toStr(_deal.commission));
                data.spreadDiscount = ko.observable(Number.toStr(_deal.spreadDiscount));
                data.spreadDiscountConverted = ko.observable( Number.toStr(_deal.spreadDiscount));

                data.lastUpdate = ko.observable(quotesVM.GetQuote(_deal.instrumentID).dataTime());
            }
  
            function setComputables() {
                data.closeDealRate = ko.computed(function () {
                    return data.closingRate() ?
                        data.closingRate().substring(0, data.closingRate().length - 2) : '0.';
                });
            
                data.closeDealRatePips = ko.computed(function () {
                    return data.closingRate() ?
                        data.closingRate().substring(data.closingRate().length - 2, data.closingRate().length) : '00';
                });

                data.grosspl = ko.computed(function () {
                    if (params.QuoteForAccountCcyToUsdCcy() &&
                        customer.prop.selectedCcyId() !== customer.prop.baseCcyId()) {
                        var spreadDiscount = AmountConverter.Convert(
                                general.toNumeric(data.spreadDiscount()),
                                params.QuoteForAccountCcyToUsdCcy()
                            );

                        data.spreadDiscountConverted(!general.isStringType(spreadDiscount) ?
                            Number.toStr(spreadDiscount.toFixed(2)) : spreadDiscount);
                    }

                    var discount = general.toNumeric(data.spreadDiscountConverted()) === 0 ?
                        general.toNumeric(data.commission()) : -general.toNumeric(data.spreadDiscountConverted());

                    var grossPl = general.toNumeric(data.pl()) + discount;
        
                    return grossPl.toFixed(2);
                });

                data.adj = ko.computed(function () {
                    if (customer.prop.dealPermit == eDealPermit.Islamic) {
                        return false;
                    }

                    if (_deal.valueDate.length === 0) {
                        return true;
                    }

                    return _deal.positionNumber != _deal.orderID;
                });
            }

            function registerToDispatcher() {
                dealsManager.OnDealsChange.Add(onDealsChange);
                dealsManager.OnDealsPLChange.Add(onDealsPLChange);
                quotesManager.OnChange.Add(updateQuoteValue);
            }

            function setSubscribers() {
                self.subscribeTo(data.isChecked, function (checked) {
                    if (!data.quoteIsActive()) {
                        return;
                    }
                    if (checked) {
                        if (selection.indexOf(data.orderID) === -1) {
                            selection.push(data.orderID);
                        }
                    } else {
                        selection.remove(data.orderID);
                    }
                });

                self.subscribeTo(selection, function (selectionArr) {
                    data.isChecked(selectionArr.indexOf(data.orderID) !== -1);
                });
            }

            function onDealsChange(items) {
                if (!general.isNullOrUndefined(items) &&
                    (items.editedItems.indexOf(data.orderID) !== -1)) {
                    updateData(dealsManager.Deals.Container[data.orderID]);
                }
            }

            function onDealsPLChange(changes) {
                var deal = changes.dealsObj[data.orderID];

                if (deal) {
                    updateData(deal);
                }
            }

            function updateData(deal) {
                data.prevSpotRate(data.spotRate());
                data.spotRate(deal.spotRate);
                data.fwPips(deal.fwPips);
                data.prevClosingRate(data.closingRate());
                data.closingRate(deal.closingRate);
                data.pl(deal.pl);
                data.plSign(Math.floor(general.toNumeric(deal.pl)).sign());
                data.lastUpdate(quotesVM.GetQuote(deal.instrumentID).dataTime());
                data.commission(deal.commission);
                data.slRate(deal.slRate == 0 ? cEmptyRate : deal.slRate);
                data.tpRate(deal.tpRate == 0 ? cEmptyRate : deal.tpRate);
                data.hasAdditionalPL(Number(_deal.additionalPL) !== 0);
            }

            function updateQuoteValue() {
                var quote = quotesManager.Quotes.GetItem(data.instrumentID),
                    deal = dealsManager.Deals.Container[data.orderID];

                if (quote && deal) {
                    data.quoteIsActive(quote.isActive());
                    if ((availableSelection.indexOf(data.orderID) === -1) && quote.isActive()) {
                        availableSelection.push(data.orderID);
                    }

                    if (!quote.isActive() && availableSelection.indexOf(data.orderID) !== -1) {
                        availableSelection.remove(data.orderID);
                    }
                }
            }

            function getValueDate(deal) {
                var instrument = instrumentsManager.GetInstrument(deal.instrumentID);
                
                if (instrument.isShare ){
                    var corporateActionDate = instrument.getCorporateActionDate();
                    if (corporateActionDate)
                        if (deal.valueDate)
                            return {
                                isValueDateEmpty: false,
                                date: general.str2Date(deal.valueDate, 'd/m/y H:M') < general.str2Date(corporateActionDate, 'd/m/y H:M') ? deal.valueDate : corporateActionDate };
                        else
                            return {
                                isValueDateEmpty: true,
                                date: corporateActionDate };
                }
            
                if (deal.valueDate) {
                    return {
                        isValueDateEmpty: false,
                        date: deal.valueDate
                    };
                } else {
                    return {
                        isValueDateEmpty: true,
                        date: null
                    };
                }
            }

            function closeDeal() {
                if (!data.quoteIsActive() ||
                    $statesManager.States.IsMarketClosed() ||
                    !window.componentsLoaded() ||
                    printExportManager.IsWorkingNow()) {
                    return;
                }
                var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
                    dialogClass = 'deal-slip' + (revisedSlip ? ' revised-slip' : ' closeDeal'),
                    dialogTitle = !revisedSlip ? (Dictionary.GetItem('CloseDealRequest', 'dialogsTitles', ' ') + ':') : '';

                DialogViewModel.open(eDialog.CloseDeal,
                    {
                        title: dialogTitle,
                        customTitle: 'CloseDealPosNum',
                        width: 555,
                        persistent: false,
                        dialogClass: dialogClass
                    },
                    eViewTypes.vCloseDeal,
                    {
                        orderId: data.orderID,
                        isStartNavigator: false
                    }
                );
            }

            function getSlTpDialogTitle(limitType, revisedDealSlip) {
                if (revisedDealSlip) {
                    return  '';
                }

                var contentKey = limitType === eLimitType.StopLoss ?
                    (!general.isNumber(data.slRate()) || data.slRate() == 0 ? 'AddStopLossTitle' : 'UpdateRemoveStopLossTitle') :
                    (!general.isNumber(data.tpRate()) || data.tpRate() == 0 ? 'AddTakeProfitTitle' : 'UpdateRemoveTakeProfitTitle');
                
                return dictionary.GetItem(contentKey, 'dialogsTitles');
            }

            function openSlTpDialog(limitType) {
                var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
                    dialogClass = 'deal-slip' + (revisedSlip ? ' revised-slip' : ' editLimits'),
                    dialogTitle = getSlTpDialogTitle(limitType, revisedSlip);

                DialogViewModel.open(eDialog.EditClosingLimit,
                    {
                        title: dialogTitle,
                        customTitle: 'EditClosingLimitHeader',
                        width: 700,
                        persistent: false,
                        dialogClass: dialogClass
                    }, eViewTypes.vEditClosingLimit,
                    {
                        orderId: data.orderID,
                        limitType: limitType,
                        isStartNavigator: false
                    });
            }

            function dispose() {
                subscribers.forEach(function (subscriber) {
                    subscriber.dispose();
                });

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                CloseDeal: closeDeal,
                openSlTpDialog: openSlTpDialog
            };
        });

        var createViewModel = function (params) {
            var viewModel = new OpenedDealRowViewModel(params);

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);