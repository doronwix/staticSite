
define(
    'viewmodels/relatedPositionViewModel',
    [
        'knockout',
        'handlers/general',
        'cachemanagers/dealsmanager',
        'viewmodels/QuotesSubscriber',
        'helpers/ObservableHashTable'
    ],
    function (ko, general, DealsManager, quotesSubscriber, observableHashTable) {
        var observableOpenDealsCollection = new observableHashTable(ko, general, 'orderID', { enabled: true, sortProperty: 'positionNumber', asc: false }),
            REBUILD_COLLECTION_SIZE = 2,
            positionNumber;

        var init = function () {
            registerObservableStartUpEvent();
        };

        var registerObservableStartUpEvent = function () {
            $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vRelatedPosition).state.subscribe(function (state) {
                switch (state) {
                    case eViewState.Start:
                        start();
                        break;

                    case eViewState.Stop:
                        stop();
                        break;
                }
            });
        };

        var start = function () {
            positionNumber = $viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vRelatedPosition, 'posNum');

            registerToDispatcher();
            populateObservableCollection();
            quotesSubscriber.Start();
        };

        var stop = function () {
            unRegisterFromDispatcher();
            observableOpenDealsCollection.Clear();
            quotesSubscriber.Stop();
        };

        var registerToDispatcher = function () {
            DealsManager.OnDealsChange.Add(onDealsChange);
            DealsManager.OnDealsPLChange.Add(onDealsPLChange);
        };

        var unRegisterFromDispatcher = function () {
            DealsManager.OnDealsPLChange.Remove(onDealsPLChange);
            DealsManager.OnDealsChange.Remove(onDealsChange);
        };

        var populateObservableCollection = function () {
            var deal = DealsManager.Deals.GetItem(positionNumber);

            if (deal) {
                var row = toObservableRow(deal);
                observableOpenDealsCollection.Add(row);
            }
        };

        var onDealsChange = function (items) {
            if (items) {
                if (items.removedItems.length > REBUILD_COLLECTION_SIZE) {
                    stop();
                    start();
                } else {
                    removeItems(items.removedItems);
                    updateItems(items.editedItems);
                    addNewItems(items.newItems);
                }
            }
        };

        var onDealsPLChange = function (changes) {
            var updatedItems = changes.dealsIDs;
            for (var i = 0, ii = updatedItems.length; i < ii; i++) {
                var observable = observableOpenDealsCollection.Get(updatedItems[i]);
                if (observable) {
                    var deal = DealsManager.Deals.GetItem(updatedItems[i]);
                    if (deal) {
                        var delta = {
                            prevSpotRate: observable.spotRate(),
                            spotRate: deal.spotRate,
                            fwPips: deal.fwPips,
                            closingRate: deal.closingRate,
                            pl: deal.pl
                        };

                        observableOpenDealsCollection.Update(updatedItems[i], delta);
                    }
                }
            }
        };

        var removeItems = function (removedItems) {
            for (var i = 0; i < removedItems.length; i++) {
                observableOpenDealsCollection.Remove(removedItems[i]);
            }
        };

        var updateItems = function (updatedItems) {
            for (var i = 0, ii = updatedItems.length; i < ii; i++) {
                var deal = toObservableRow(DealsManager.Deals.GetItem(updatedItems[i]));
                if (deal) {
                    observableOpenDealsCollection.Update(deal.orderID, deal);
                }
            }
        };

        var addNewItems = function (newItems) {
            for (var i = 0, ii = newItems.length; i < ii; i++) {
                var deal = toObservableRow(DealsManager.Deals.GetItem(newItems[i]));
                if (deal) {
                    observableOpenDealsCollection.Add(deal);
                }
            }
        };

        var toObservableRow = function (deal) {
            return {
                positionNumber: deal.positionNumber,
                orderID: deal.orderID,
                exeTime: deal.exeTime,

                buyAmount: deal.buyAmount,
                buySymbolID: deal.buySymbolID,

                sellAmount: deal.sellAmount,
                sellSymbolID: deal.sellSymbolID,

                orderRate: deal.orderRate,
                valueDate: deal.valueDate,

                spotRate: ko.observable(deal.spotRate),
                fwPips: ko.observable(deal.fwPips),
                closingRate: ko.observable(deal.closingRate),

                pl: ko.observable(deal.pl),
                plSign: ko.observable(deal.pl.sign()),

                slRate: ko.observable(deal.slRate == 0 ? cEmptyRate : deal.slRate),
                tpRate: ko.observable(deal.tpRate == 0 ? cEmptyRate : deal.tpRate),

                prevSpotRate: ko.observable(deal.spotRate)
            };
        };

        return {
            Init: init,
            Start: start,
            Stop: stop,
            OpenDeals: observableOpenDealsCollection.Values
        };
    }
);
