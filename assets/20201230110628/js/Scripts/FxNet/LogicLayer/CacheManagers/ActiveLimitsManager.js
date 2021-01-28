define(
    'cachemanagers/activelimitsmanager',
    [
        'handlers/Delegate',
        'handlers/HashTable',
        'handlers/limit'
    ],
    function ActiveLimitsManager(delegate, hashtable, tlimit) {
        var onChange = new delegate(),
            onPriceAlert = new delegate(),
            limits = new hashtable();

        function processData(data, isReinitialized) {
            var items = { newLimits: [], editedLimits: [], removedLimits: [] };
            var i, length, id, limit;

            if (isReinitialized) {
                limits.ForEach(function iterator(orderId) {
                    var isInData = false,
                        newData = [];

                    for (i = 0, length = data.length; i < length; i++) {
                        if (data[i][eLimit.orderID] == orderId) {
                            isInData = true;
                            break;
                        }
                    }

                    if (!isInData) {
                        newData[eLimit.status] = eStatus.Removed;
                        newData[eLimit.orderID] = orderId;

                        data.push(newData);
                    }
                });
            }

            for (i = 0, length = data.length; i < length; i++) {
                id = data[i][eLimit.orderID];
                limit = limits.GetItem(id);

                switch (data[i][eLimit.status]) {
                    case eStatus.New:
                    case eStatus.Edited:
                        if (limit) {
                            limit.Update(data[i]);
                            items.editedLimits.push(id);
                        }
                        else {
                            limit = new tlimit(id, data[i]);
                            limits.SetItem(id, limit);
                            items.newLimits.push(id);
                        }
                        break;

                    case eStatus.Removed:
                        if (limit) {
                            limits.RemoveItem(id);
                            items.removedLimits.push(id);
                        }
                        break;
                }
            }

            onPriceAlert.Invoke(limits.Container);
            onChange.Invoke(items);
        }

        var getPriceAlerts = function () {
            return limits.Filter(function (orderId, limit) {
                return limit.mode === eLimitMode.PriceAlert;
            });
        };

        var hasPriceAlerts = function (instrumentId) {
            return limits
                .Find(function (orderId, limit) {
                    return limit.instrumentID === instrumentId && limit.mode === eLimitMode.PriceAlert;
                })
                .hasItems();
        };

        return {
            limits: limits,
            GetPriceAlerts: getPriceAlerts,
            HasPriceAlerts: hasPriceAlerts,

            OnChange: onChange,
            ProcessData: processData,
            OnPriceAlert: onPriceAlert,
        };
    }
);
