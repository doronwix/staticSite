/* global ePresetsOrder */
var QuotesViewModel = function (ko, ViewModelBase, general, debounce, Dictionary,
    QuotesManager, FavoriteInstrumentsManager,
    InstrumentTranslationsManager, PermissionsModule, delegate,
    AlertsManager, portfolioManager) {
    var self,
        presetViewModel,
        subscriptions = [],
        computedObservables = [],
        viewProperties = {},
        openInDialogDelegate = new delegate(),
        inheritedInstance = general.clone(ViewModelBase);

    //----------------------------------------------------------------

    var init = function (customSettings) {
        self = this;
        presetViewModel = $viewModelsManager.VmQuotesPreset;

        inheritedInstance.setSettings(self, customSettings);

        registerObservableStartUpEvent();
        setDefaultObservables();
    };

    //----------------------------------------------------------------

    var setDefaultObservables = function () {
        viewProperties.selectedPresetId = ko.observable();
        viewProperties.isCashBackIconVisible = ko.observable(general.toNumeric(portfolioManager.Portfolio.pendingBonus) > 0 && portfolioManager.Portfolio.pendingBonusType === ePendingBonusType.cashBack);
        viewProperties.isMarketClosed = $statesManager.States.IsMarketClosed;
        viewProperties.isAmlRestricted = $statesManager.States.IsAmlRestricted;
        viewProperties.alertOfInactiveInstrument = alertOfInactiveInstrument;
    };

    //----------------------------------------------------------------

    var onPresetChanged = function (preset) {
        var uiOrder;

        if (!preset) {
            return;
        }

        viewProperties.selectedPresetId(preset.Id);

        if (preset.Id === ePresetType.PresetCustomized) {
            uiOrder = $instrumentsManager.GetCustomizedUiOrder();
        }
        else {
            uiOrder = $instrumentsManager.GetPresetInstruments(preset.Id);
        }

        if (preset.Order !== ePresetsOrder.None) {
            preset.Clear();
        }

        if (preset.QuotesCollection.Keys.count() < 1) {
            buildQuotesCollection(uiOrder || [], preset).then(function (collection) {
                preset.AddRange(collection);
                preset.TemporaryQuotesCollection.length = 0;
            }).done();
        }
    };

    //----------------------------------------------------------------

    var setSubscribers = function () {
        subscriptions.push(presetViewModel.Data.SelectedPreset.subscribe(onPresetChanged));
    };

    //----------------------------------------------------------------

    var unsetSubscribers = function () {
        if (subscriptions.length > 0) {
            for (var i = 0; i < subscriptions.length; i++) {
                subscriptions[i].dispose();
            }
        }

        subscriptions.length = 0;
    };

    //----------------------------------------------------------------

    var unsetComputedObservables = function () {
        if (computedObservables.length > 0) {
            for (var i = 0; i < computedObservables.length; i++) {
                computedObservables[i].dispose();
            }
        }

        computedObservables.length = 0;
    };

    //----------------------------------------------------------------

    var alertOfInactiveInstrument = function (ccyPair) {
        var body = String.format(Dictionary.GetItem("InstrumentInactiveOnLoad"), ccyPair);
        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, body, '');
        AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
    };

    //----------------------------------------------------------------

    var openNewDealOrNewLimit = function (quoteRow, orderDir, tab) {
        if (window.componentsLoaded()) {
            ko.postbox.publish('instrument-trade', { instrumentName: InstrumentTranslationsManager.Long(quoteRow.id) });

            if ($customer.prop.brokerAllowLimitsOnNoRates && (quoteRow.state() === eQuoteStates.Disabled || viewProperties.isMarketClosed())) {
                openNewLimit(quoteRow.id, orderDir, tab);
            }
            else {
                openNewDeal(quoteRow.id, orderDir, tab);
            }
        }
        else {
            alertOfInactiveInstrument(quoteRow.ccyPair);
        }
    };

    //----------------------------------------------------------------

    var openTransactionSwitcherDialog = function (transactionParameters) {
        openInDialogDelegate.Invoke(eDialog.TransactionSwitcher, {
            title: '',
            customTitle: 'TransactionDropDown',
            width: 700,
            dragStart: function () { ko.postbox.publish('new-deal-dragged', {}); },
            persistent: false,
            dialogClass: 'deal-slip revised-slip'
        }, eViewTypes.vTransactionSwitcher, transactionParameters);
    };

    //----------------------------------------------------------------

    var openNewDeal = function (instrumentId, orderDir, tab) {
        var newDealParameters = {
            'instrumentId': instrumentId,
            'orderDir': orderDir,
            'tab': tab,
            'transactionType': eTransactionSwitcher.NewDeal
        };

        openTransactionSwitcherDialog(newDealParameters);
    };

    //----------------------------------------------------------------

    var openNewLimit = function (instrumentId, orderDir, tab) {
        var newLimitParameters = {
            'instrumentId': instrumentId,
            'orderDir': orderDir,
            'tab': tab,
            'transactionType': eTransactionSwitcher.NewLimit
        };

        openTransactionSwitcherDialog(newLimitParameters);
    };

    //----------------------------------------------------------------

    var openNewPriceAlert = function (instrumentId, orderDir, tab) {
        var newPriceAlertParameters = {
                'instrumentId': instrumentId,
                'orderDir': orderDir,
                'tab': tab,
                'transactionType': eTransactionSwitcher.NewPriceAlert
            };

        openInDialogDelegate.Invoke(eDialog.NewPriceAlert, {
            title: '',
            customTitle: 'TransactionDropDown',
            width: 700,
            dragStart: function () { ko.postbox.publish('new-deal-dragged', {}); },
            persistent: false,
            dialogClass: 'deal-slip revised-slip'
        }, eViewTypes.vNewPriceAlert, newPriceAlertParameters);
    };

    //----------------------------------------------------------------

    var rateDetails = function (quote, orderDir) {
        var args = {
            'instrumentId': !general.isNullOrUndefined(quote) && quote.id,
            'isActiveQuote': !general.isNullOrUndefined(quote) && quote.isActiveQuote(),
            'quoteState': !general.isNullOrUndefined(quote) && quote.state(),
            'orderDir': orderDir === null ? eOrderDir.None : orderDir
        };

        $viewModelsManager.VManager.SwitchViewVisible(eForms.Transaction, args);
    };

    //----------------------------------------------------------------

    var registerObservableStartUpEvent = function () {
        $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vQuotes).state.subscribe(function (state) {
            switch (state) {
                case eViewState.Start:
                    if ($viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vQuotes).previousState() !== eViewState.Update) {
                        start(); // we want the state to be always start but we dont want the start metod to run if we came from update
                    }
                    break;

                case eViewState.Update:
                    update();
                    $viewModelsManager.VManager.ChangeViewState(eViewTypes.vQuotes, eViewState.Start);
                    break;

                case eViewState.Stop:
                    stop();
                    break;
            }
        });
    };

    //----------------------------------------------------------------

    var start = function () {
        setSubscribers();

        var defaultPresetId = viewProperties.selectedPresetId() || $initialDataManager.prop.initialScreen.screenId || ePresetType.PresetCustomized;
        var presetId = $viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vQuotes, "presetToSelect");

        var presetIdToSelect = presetId || defaultPresetId;
        var selectedPreset = presetViewModel.Data.SelectedPreset();

        if (selectedPreset && selectedPreset.Id === presetIdToSelect) {
            onPresetChanged(selectedPreset);
        }
        else {
            presetViewModel.SelectPreset(presetIdToSelect);
        }

        registerToDispatcher();
        onPortofolioChanged();
    };

    //----------------------------------------------------------------

    var stop = function () {
        unRegisterFromDispatcher();

        unsetSubscribers();
        unsetComputedObservables();

        presetViewModel.Reset();
    };

    //----------------------------------------------------------------

    var registerToDispatcher = function () {
        QuotesManager.OnChange.Add(onQuotesChanged);
        $instrumentsManager.OnEnhancedInstrumentsChange.Add(onInstrumentsChanged);
        portfolioManager.OnChange.Add(onPortofolioChanged);
    };

    //----------------------------------------------------------------

    var unRegisterFromDispatcher = function () {
        QuotesManager.OnChange.Remove(onQuotesChanged);
        $instrumentsManager.OnEnhancedInstrumentsChange.Remove(onInstrumentsChanged);
        portfolioManager.OnChange.Remove(onPortofolioChanged);
    };

    //----------------------------------------------------------------

    var update = function () {
        var presetId = $viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vQuotes, "presetToSelect");

        if (typeof presetId === "undefined") {
            return;
        }

        presetViewModel.SelectPreset(presetId);
    };

    //----------------------------------------------------------------

    var addFakeRows = function (collection) {
        var seed = (new Date()).getTime(),
            minRowsToDisplay = inheritedInstance.getSettings(self).minRowsToDisplay,
            fakeRecordsToAdd = Math.max(collection.length, minRowsToDisplay) - collection.length,
            rowCounter = collection.length - 1;

        for (var i = 0; i < fakeRecordsToAdd; i++) {
            var fakeObj = {
                id: String.format("empty{0}", seed++),
                rowId: ++rowCounter,
                isFake: true
            };

            collection.push(fakeObj);
        }

        return collection;
    }

    //----------------------------------------------------------------

    var buildQuotesCollection = function (uiOrderLocal, preset) {
        var i,
            rowCounter = 0,
            maxLength = uiOrderLocal.length,
            collectionToAdd = [],
            instrument,
            quoteRow;

        for (i = 0; i < maxLength; i++) {
            instrument = $instrumentsManager.GetInstrument(uiOrderLocal[i][eQuotesUIOrder.InstrumentID]);

            if (instrument) {
                quoteRow = {
                    isFake: false
                };

                setStaticInfo(++rowCounter, quoteRow, instrument, preset);

                updateQuoteValues(quoteRow);

                collectionToAdd.push(quoteRow);
            }
        }

        // needed to get quotes updates
        preset.TemporaryQuotesCollection = collectionToAdd;

        if (preset.Order !== ePresetsOrder.None) {
            var quotesHasDataPromises = collectionToAdd.map(function (item) {
                if (!item.isFake) {
                    return item.hasData.promise;
                }
                return true;
            });

            return Q.all(quotesHasDataPromises).then(function () {
                return orderByChangeColumn(collectionToAdd, preset.Order);
            }).then(addFakeRows);
        } else {
            return Q(collectionToAdd).then(addFakeRows);
        }
    };

    //----------------------------------------------------------------

    var setStaticInfo = function (rowId, quoteRow, instrument, preset) {
        quoteRow.hasData = Q.defer();
        quoteRow.rowId = rowId;
        quoteRow.instrumentId = instrument.id;

        quoteRow.DecimalDigit = instrument.DecimalDigit;
        quoteRow.PipDigit = instrument.PipDigit;

        quoteRow.id = instrument.id;
        quoteRow.amountGroupId = instrument.amountGroupId;
        quoteRow.factor = instrument.factor;
        quoteRow.isTradable = instrument.isTradable;

        quoteRow.baseSymbolName = instrument.baseSymbolName;
        quoteRow.otherSymbolName = instrument.otherSymbolName;

        quoteRow.baseSymbolId = instrument.baseSymbol;
        quoteRow.otherSymbolId = instrument.otherSymbol;

        quoteRow.signal = instrument.hasSignal;
        quoteRow.alertInactiveQuote = alertInactiveQuote;

        quoteRow.bidPips = ko.observable();
        quoteRow.bid10K = ko.observable();
        quoteRow.bid100K = ko.observable();
        quoteRow.askPips = ko.observable();
        quoteRow.ask10K = ko.observable();
        quoteRow.ask100K = ko.observable();

        quoteRow.state = ko.observable("");
        quoteRow.isActiveQuote = ko.observable("");

        quoteRow.bid = ko.observable("");
        quoteRow.ask = ko.observable("");

        quoteRow.prevBid = ko.observable("");
        quoteRow.prevAsk = ko.observable("");

        quoteRow.open = ko.observable("");
        quoteRow.close = ko.observable("");
        quoteRow.high = ko.observable("");
        quoteRow.low = ko.observable("");
        quoteRow.highLowState = ko.observable("");
        quoteRow.change = ko.observable("");
        quoteRow.changePips = ko.observable("");
        quoteRow.time = ko.observable("");
        quoteRow.orderDir = ko.observable("");
        quoteRow.isSingleInstrument = instrument.isFuture || instrument.isShare || (instrument.instrumentTypeId == eInstrumentType.Commodities && instrument.assetTypeId == eAssetType.Forex);

        quoteRow.isIndiceInstrument = instrument.instrumentTypeId == eInstrumentType.Indices;

        quoteRow.isFavoriteHelper = ko.observable(0).extend({ notify: 'always' });
        quoteRow.isFavorite = ko.pureComputed(function () {
            return this.isFavoriteHelper() > -1 && preset.isSelected() && FavoriteInstrumentsManager.IsFavoriteInstrument(this.id);
        }, quoteRow);

        quoteRow.weightedVolumeFactor = ko.observable(instrument.weightedVolumeFactor);

        quoteRow.onToggleFavoriteClick = debounce(function () {
            if (PermissionsModule.CheckActionAllowed("addFavorite", true)) {
                if (quoteRow.isFavorite()) {
                    FavoriteInstrumentsManager.RemoveFavoriteInstrument(quoteRow.id, notifyQuoteRowIsFavorite);
                    ko.postbox.publish("favorite-instrument-update", { instrumentId: quoteRow.id, isRemoveInstrument: true });
                } else {
                    FavoriteInstrumentsManager.AddFavoriteInstrument(quoteRow.id, notifyQuoteRowIsFavorite);
                    ko.postbox.publish("favorite-instrument-update", { instrumentId: quoteRow.id, isAddInstrument: true });
                }
            }
        });

        var notifyQuoteRowIsFavorite = function (result) {
            var jsonResult = JSON.parse(result);
            if (jsonResult && jsonResult.status === eOperationStatus.Success) {
                quoteRow.isFavoriteHelper(1);
            }
        }

        quoteRow.isCashBackIconVisible = ko.pureComputed(function () {
            return this.weightedVolumeFactor() > 1 && viewProperties.isCashBackIconVisible();
        }, quoteRow);

        quoteRow.isAvailable = ko.pureComputed(function () {
            return (!viewProperties.isMarketClosed() && this.isActiveQuote());
        }, quoteRow);

        quoteRow.isStock = ko.observable(instrument.isStock);

        quoteRow.isUp = ko.pureComputed(function () {
            return this.state() === eQuoteStates.Up;
        }, quoteRow).extend({ notify: "always" });

        quoteRow.isDown = ko.pureComputed(function () {
            return this.state() === eQuoteStates.Down;
        }, quoteRow).extend({ notify: "always" });

        quoteRow.notChanged = ko.pureComputed(function () {
            return this.state() === eQuoteStates.NotChanged;
        }, quoteRow).extend({ notify: "always" });

        quoteRow.formattedChange = ko.pureComputed(function () {
            return Format.toSignedPercent(this.change(), '');
        }, quoteRow);

        quoteRow.onClick = function () {
            rateDetails(quoteRow, eOrderDir.None);
        };

        quoteRow.onBuyClick = function () {
            rateDetails(quoteRow, eOrderDir.Buy);
        };

        quoteRow.onSellClick = function () {
            rateDetails(quoteRow, quoteRow.isStock() ? eOrderDir.None : eOrderDir.Sell);
        };

        quoteRow.choose = function () {
            quoteRow.onChoiceClick();
        };

        // Web
        quoteRow.onChoiceClick = function () {
            openNewDealOrNewLimit(quoteRow, eOrderDir.None);
        };

        // Web
        quoteRow.onAskClick = function () {
            openNewDealOrNewLimit(quoteRow, eOrderDir.Buy);
        };

        // Web
        quoteRow.onBidClick = function () {
            openNewDealOrNewLimit(quoteRow, quoteRow.isStock() ? eOrderDir.None : eOrderDir.Sell);
        };

        quoteRow.onSignalClick = function (quoteRowData) {
            openNewDealOrNewLimit(quoteRowData, eOrderDir.None, quoteRowData.signal ? eNewDealTool.Signals : null);
        };

        quoteRow.hasPriceAlerts = ko.observable(false);

        quoteRow.onPriceAlertClick = function (quoteRowData) {
            openNewPriceAlert(quoteRowData.instrumentId, eOrderDir.None);
        };
    };

    //----------------------------------------------------------------

    var alertInactiveQuote = function (val) {
        var body = String.format("Instrument {0} is currently inactive", val);
        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, body, '');
        AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

        return false;
    };

    //----------------------------------------------------------------

    var onQuotesChanged = function (changedQuotesIds) {
        var preset = presetViewModel.Data.SelectedPreset(),
            quoteId,
            quoteRow;

        if (!preset) {
            return;
        }

        for (var i = 0, ii = changedQuotesIds.length; i < ii; i++) {
            quoteId = changedQuotesIds[i];
            quoteRow = preset.QuotesCollection.Get(quoteId) ||
                preset.TemporaryQuotesCollection.find(function (id, item) { return item.id === id; }.bind(null, quoteId));

            if (quoteRow && !quoteRow.isFake) {
                updateQuoteValues(quoteRow);
            }
        }
    };

    //----------------------------------------------------------------

    var isTopFaller = function (order, change) {
        return order === ePresetsOrder.Ascending && change < 0;
    };

    //----------------------------------------------------------------

    var isTopRiser = function (order, change) {
        return order === ePresetsOrder.Descending && change >= 0;
    };

    //----------------------------------------------------------------

    var sortTopFallers = function (a, b) { return a.change() - b.change(); }

    //----------------------------------------------------------------

    var sortTopRisers = function (a, b) { return b.change() - a.change(); }

    //----------------------------------------------------------------

    var orderByChangeColumn = function (collection, order) {
        collection = collection || [];

        if (!order) {
            return;
        }

        collection = collection.filter(function (quote) {
            return !quote.isFake && (isTopRiser(order, quote.change()) || isTopFaller(order, quote.change()));
        });

        return collection.sort(order === ePresetsOrder.Ascending ? sortTopFallers : sortTopRisers);
    };

    //----------------------------------------------------------------

    var onInstrumentsChanged = debounce(function onInstrumentsChangedHandler() {
        for (var i = 0, length = presetViewModel.Data.Presets().length; i < length; i++) {
            var preset = presetViewModel.Data.Presets()[i];

            if (!preset ||
                preset.QuotesCollection.Keys.count() < 1) {
                continue;
            }

            preset.QuotesCollection.Keys.ForEach(function (key, quoteRow) {
                if (quoteRow.isFake) {
                    return;
                }

                var instrument = $instrumentsManager.GetInstrument(quoteRow.instrumentId);
                quoteRow.weightedVolumeFactor(instrument.weightedVolumeFactor);
            });
        }
    });

    //----------------------------------------------------------------

    var onPortofolioChanged = debounce(function onPortofolioChangedHandler() {
        viewProperties.isCashBackIconVisible(general.toNumeric(portfolioManager.Portfolio.pendingBonus) > 0 && portfolioManager.Portfolio.pendingBonusType === ePendingBonusType.cashBack);
    });

    //----------------------------------------------------------------

    var updateQuoteValues = function (quoteToUpdate) {
        if (!quoteToUpdate) {
            return;
        }

        if (!quoteToUpdate.id || quoteToUpdate.isFake) {
            return;
        }

        var instrumentId = quoteToUpdate.id,
            currentQuote = QuotesManager.Quotes.GetItem(instrumentId);

        if (currentQuote) {
            quoteToUpdate.highLowState(getHighLowState(quoteToUpdate, currentQuote));
            quoteToUpdate.state(currentQuote.state);
            quoteToUpdate.isActiveQuote(currentQuote.isActive());
            quoteToUpdate.prevAsk(quoteToUpdate.ask());
            quoteToUpdate.prevBid(quoteToUpdate.bid());
            quoteToUpdate.bid(currentQuote.bid);
            quoteToUpdate.ask(currentQuote.ask);
            quoteToUpdate.open(currentQuote.open);
            quoteToUpdate.close(currentQuote.close);
            quoteToUpdate.high(currentQuote.highBid);
            quoteToUpdate.low(currentQuote.lowAsk);
            quoteToUpdate.change(currentQuote.change);
            quoteToUpdate.changePips(Format.toRate(currentQuote.changePips, true, instrumentId));
            quoteToUpdate.time(currentQuote.tradeTime);

            quoteToUpdate.hasData.resolve(true);
        }
    };

    function getHighLowState(previousQuote, currentQuote) {
        var state = eHighLowStates.Active;
        var previousState = previousQuote.state();
        var currentState = currentQuote.state;

        if (currentState === eQuoteStates.Disabled && general.objectContainsValue(eQuoteStates, previousState)) {
            state = eHighLowStates.MarketClosed;
        } else if (currentQuote.isActive() && general.objectContainsValue(eQuoteStates, previousState)) {
            state = eHighLowStates.Active;
        } else if ((currentState === eQuoteStates.TimedOut || currentState === eQuoteStates.Locked) && previousState === eQuoteStates.Disabled) {
            state = eHighLowStates.NA;
        }

        return state;
    }

    //----------------------------------------------------------------

    return {
        Init: init,
        Start: start,
        Stop: stop,
        Presets: presetViewModel,
        ViewProperties: viewProperties,
        OpenInDialog: openInDialogDelegate,
        UpdateQuoteValues: updateQuoteValues,
        GetDialogPos: function () {
            return {

                dialogPosition: $viewModelsManager.VmDialog.dialogPosition,
                parentIsCollapsed: $viewModelsManager.VmAccountMarket.IsCollapsed,
                parentTopElement: eRefDomElementsIds.newDealRefParentTopElement,
                topOffset: -3,
                parentLeftElement: '#QuotesTable .ask-column',
                leftOffset: -70,
                RTLoffset: 10
            }
        }
    }
};
