define(
    'cachemanagers/NetExposureManager',
    [
        'require',
        'handlers/Delegate',
        'handlers/HashTable'
    ],
    function NetExposureManager(require) {
        var delegate = require('handlers/Delegate'),
            hashTable = require('handlers/HashTable');

        var exposures = new hashTable(),
            onChange = new delegate();

        function Exposure() {
            this.symbolId = '';
            this.amount = '';
            this.accountSymbolAmount = '';
            this.status = '';
        }

        function processData(data) {
            var items = [],
                i,
                len = data.length,
                item;

            if (len > 0) {
                for (i = 0; i < len; i++) {
                    item = exposures.GetItem(data[i][eExposure.symbolID]);

                    if (!item) {
                        item = new Exposure();
                        exposures.SetItem(data[i][eExposure.symbolID], item);
                    }

                    items.push(item);
                    updateExposure(item, data[i]);
                }

                onChange.Invoke(items);
            }
        }

        function updateExposure(exposure, data) {
            exposure.symbolId = data[eExposure.symbolID];
            exposure.amount = data[eExposure.amount];
            exposure.accountSymbolAmount = data[eExposure.accountSymbolAmount];
            exposure.status = data[eExposure.status];
        }

        return {
            Exposures: exposures,
            OnChange: onChange,
            ProcessData: processData
        };
    }
);
