define(
    'cachemanagers/dealsmanager',
    [
        'require',
        'handlers/HashTable',
        'handlers/Delegate',
        'handlers/Deal'
    ],
    function DealsManagerDef(require) {
        var hashtable = require('handlers/HashTable'),
            delegate = require('handlers/Delegate'),
            Deal = require('handlers/Deal');

        function DealsManager() {
            var deals = new hashtable(),
                onDealsChange = new delegate(),
                onDealsRemoved = new delegate(),
                onDealsPLChange = new delegate();

            function processDeals(data, isReinitialized) {
                var items = { newItems: [], editedItems: [], removedItems: [] };
                var i, length, id, deal;

                if (isReinitialized) {
                    deals.ForEach(function iterator(dealId) {
                        var isInData = false,
                            newData = [];

                        for (var idx = 0, len = data.length; idx < len; idx++) {
                            if (data[idx][eDeal.orderID] == dealId) {
                                isInData = true;
                                break;
                            }
                        }

                        if (!isInData) {
                            newData[eDeal.status] = eStatus.Removed;
                            newData[eDeal.orderID] = dealId;

                            data.push(newData);
                        }
                    });
                }

                for (i = 0, length = data.length; i < length; i++) {
                    id = data[i][eDeal.orderID];
                    deal = deals.GetItem(id);

                    switch (data[i][eDeal.status]) {
                        case eStatus.New:
                        case eStatus.Edited:
                            if (deal) {
                                deal.Update(data[i]);
                                items.editedItems.push(id);
                            }
                            else {
                                deal = new Deal(data[i]);
                                deals.SetItem(id, deal);
                                items.newItems.push(id);
                            }
                            break;

                        case eStatus.Removed:
                            if (deal) {
                                deals.RemoveItem(id);
                                items.removedItems.push(id);
                            }
                            break;
                    }
                }

                onDealsChange.Invoke(items);

                if (items.removedItems.length) {
                    onDealsRemoved.Invoke(items.removedItems);
                }
            }

            function processDealsPL(plData) {
                var dealsIDs = [],
                    dealsObj = {},
                    i, length,
                    id,
                    deal;

                for (i = 0, length = plData.length; i < length; i++) {
                    id = plData[i][eDealPL.dealID];
                    deal = deals.GetItem(id);

                    if (deal) {
                        deal.UpdatePL(plData[i]);
                        dealsIDs.push(deal.orderID);
                        dealsObj[deal.orderID] = deal;
                    }
                }

                onDealsPLChange.Invoke({ dealsIDs: dealsIDs, dealsObj: dealsObj });
            }

            return {
                Deals: deals,
                OnDealsChange: onDealsChange,
                OnDealsRemoved: onDealsRemoved,
                OnDealsPLChange: onDealsPLChange,
                ProcessDeals: processDeals,
                ProcessDealsPL: processDealsPL
            };
        }

        return new DealsManager();
    }
);
