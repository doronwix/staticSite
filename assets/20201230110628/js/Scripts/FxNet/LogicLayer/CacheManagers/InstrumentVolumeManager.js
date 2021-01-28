define(
    'cachemanagers/InstrumentVolumeManager',
    [
        'require',
        'handlers/general',
        'handlers/Delegate',
        'handlers/HashTable'
    ],
    function InstrumentVolumeManager(require) {
        var general = require('handlers/general'),
            delegate = require('handlers/Delegate'),
            hashTable = require('handlers/HashTable');

        function InstrumentVolume() {
            this.InstrumentID = 0;
            this.BaseSymbolNetExposure = 0;
            this.OtherSymbolNetExposure = 0;
            this.AccountSymbolAmount = 0;
            this.RequiredMarginPercentage = 0;
            this.UsedMargin = 0;
            this.MarginUtilizationPercentage = 0;
            this.AvailableMargin = 0;
            this.MarginUtilizationStatus = eMarginUtilizationStatus.NA;
            this.Status = eStatus.Removed;
            this.LastUpdate = '';
            this.BaseSymbolAmount = 0;
            this.OtherSymbolAmount = 0;
        }

        var instrumentVolumes = new hashTable();
        var onChange = new delegate();

        function update(item, delta) {
            for (var prop in eInstrumentVolume) {
                if (eInstrumentVolume.hasOwnProperty(prop)) {
                    if (general.isDefinedType(item[prop])) {
                        item[prop] = delta[eInstrumentVolume[prop]];
                    }
                }
            }
        }

        function create(data) {
            var newItem = new InstrumentVolume();

            update(newItem, data);

            return newItem;
        }

        function processData(data) {
            var items = { newItems: [], editedItems: [], removedItems: [] }

            for (var i = 0, length = data.length; i < length; i++) {
                var id = data[i][eInstrumentVolume.InstrumentID];

                switch (data[i][eInstrumentVolume.Status]) {
                    case eStatus.New:
                    case eStatus.Edited:
                        if (instrumentVolumes.GetItem(id)) {
                            update(instrumentVolumes.GetItem(id), data[i]);
                            items.editedItems.push(id);
                        }
                        else {
                            instrumentVolumes.SetItem(id, create(data[i]));
                            items.newItems.push(id);
                        }
                        break;

                    case eStatus.Removed:
                        if (instrumentVolumes.GetItem(id)) {
                            instrumentVolumes.RemoveItem(id);
                            items.removedItems.push(id);
                        }
                        break;
                }
            }

            onChange.Invoke(items);
        }

        return {
            InstrumentVolumes: instrumentVolumes,
            OnChange: onChange,
            ProcessData: processData
        };
    }
);