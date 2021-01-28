define(
    'initdatamanagers/InstrumentsManager',
    [
        'require',
        'Q',
        'handlers/general',
        'handlers/Delegate',
        'handlers/HashTable',
        'handlers/Instrument',
        'initdatamanagers/DealsAmountsManager',
        'managers/profileinstruments',
        'modules/systeminfo',
        'enums/DataMembersPositions'
    ],
    function InstrumentsManagerDef(require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            delegate = require('handlers/Delegate'),
            hashTable = require('handlers/HashTable'),
            Instrument = require('handlers/Instrument'),
            DealsAmountsManager = require('initdatamanagers/DealsAmountsManager'),
            ProfileInstruments = require('managers/profileinstruments'),
            systemInfo = require('modules/systeminfo');

        //----------------------------------------------------------------------
        // Instrument - extend
        //----------------------------------------------------------------------

        Instrument.prototype.isOvernightFinancing = function () {
            // temporary logic, it suppose to be dependent on the spread group value (is zero 
            return this.isFuture || this.isShare || (this.isForex && this.isOvernightOnForex);
        };

        Instrument.prototype.getCorporateActionDate = function () {
            // the corporate action date is equal to expiration date
            if (this.isShare)
                return this.expirationDate;
            else
                return null;
        };

        Instrument.prototype.getInstrumentDividendDate = function () {
            if (this.isShare)
                return this.eventDate;
            else
                return null;
        };

        Instrument.prototype.getInstrumentDividendAmount = function () {
            if (this.isShare)
                return this.eventAmount;
            else
                return null;
        };

        Instrument.prototype.getInstrumentRolloverDate = function () {
            if (this.isFuture)
                return this.eventDate;
            else
                return null;
        };

        Instrument.prototype.roundRateToPip = function (rate, orderDir, limitType) {
            var sign = general.addSign(orderDir, limitType),
                value = Format.roundToPip(rate, this.PipDigit, this.DecimalDigit, sign);

            if (value === false) {
                return '';
            }

            return value;
        };

        //----------------------------------------------------------------------
        // InstrumentsManager
        //----------------------------------------------------------------------
        function InstrumentsManager() {
            var instrumentIDs = [],
                // todo consider union with presetInstruments see set customised preset method
                customizedUiOrder = [],
                quotesUiOrder = [],
                instrumentList = new hashTable(),
                presetInstruments = {},
                enhancedInstruments = [],
                onUiOrderChanged = new delegate(),
                onFavoritesPresetChanged = new delegate(),
                onEnhancedInstrumentsChange = new delegate(),
                customerType,
                hasWeightedVolumeFactor,
                profileInstrumentList,
                isOvernightOnForex;

            //---------------------------------------------------------

            function init(config) {
                customerType = config.customerType;
                profileInstrumentList = config.initialProfileInstrument.list;
                hasWeightedVolumeFactor = config.hasWeightedVolumeFactor;
                isOvernightOnForex = config.isOvernightOnForex;

                setCustomizedUiOrder(config.customUiOrder);
                setInitialPresets(config.customUiOrder, config.initialUiOrder, config.initialScreenId);

                buildCollection();
            }

            //---------------------------------------------------------
            function clear() {
                instrumentIDs.length = 0;
                customizedUiOrder.length = 0;
                quotesUiOrder.length = 0;
                instrumentList.Clear();
                presetInstruments = {};
                enhancedInstruments.length = 0;
                onUiOrderChanged.Flush();
                onFavoritesPresetChanged.Flush();
                onEnhancedInstrumentsChange.Flush();

                customerType = null;
                hasWeightedVolumeFactor = null;
                isOvernightOnForex = null;
            }

            //---------------------------------------------------------
            function setInitialPresets(customUiOrder, initialUiOrder, initialScreenId) {
                var initialPresets = {};

                initialPresets[ePresetType.PresetCustomized] = customUiOrder;
                initialPresets[initialScreenId] = initialUiOrder;

                setPresetIntruments(initialPresets);
            }

            //---------------------------------------------------------
            function setPresetIntruments(fullPresetInstruments) {
                var tmpPreset;

                for (var presetId in fullPresetInstruments) {
                    if (!fullPresetInstruments.hasOwnProperty(presetId)) {
                        continue;
                    }

                    tmpPreset = fullPresetInstruments[presetId].map(function (instrument) {
                        var presetItem = [];

                        presetItem[eQuotesUIOrder.InstrumentID] = instrument[eQuotesUIOrder.InstrumentID];
                        presetItem[eQuotesUIOrder.DealAmount] = instrument[eQuotesUIOrder.DealAmount].toLocaleString();

                        return presetItem;
                    });

                    if (general.equals(presetInstruments[presetId], tmpPreset) === false) {
                        presetInstruments[presetId] = tmpPreset;
                    }
                }
            }

            //---------------------------------------------------------

            function clearInstrumentDealMinMaxAmounts(updatedMinDealAmounts) {
                var instruments = systemInfo.get('instruments') || [];

                for (var i = 0, length = instruments.length; i < length; i++) {
                    var instrument = new Instrument(instruments[i], hasWeightedVolumeFactor, isOvernightOnForex);

                    instrument.dealMinMaxAmounts = [];
                    instrumentList.OverrideItem(instrument.id, instrument);
                }

                DealsAmountsManager.UpdateMinDealAmounts(updatedMinDealAmounts);
            }

            //---------------------------------------------------------

            function getUpdatedInstrumentWithDealMinMaxAmounts(instrumentId) {
                var instrument = instrumentList.GetItem(instrumentId);

                if (instrument.dealMinMaxAmounts.length > 0) {
                    return Q({ dealMinMaxAmounts: instrument.dealMinMaxAmounts, defaultDealSize: instrument.defaultDealSize });
                }

                return DealsAmountsManager.MinDealAmountsPromise.then(function () {
                    setInstrumentDealMinMaxAmounts(instrument);
                    instrument = instrumentList.GetItem(instrumentId);

                    return { dealMinMaxAmounts: instrument.dealMinMaxAmounts, defaultDealSize: instrument.defaultDealSize };
                });
            }

            //---------------------------------------------------------
            function setInstrumentDealMinMaxAmounts(instrument) {
                var defaultDealSize,
                    filteredInstrumentFromProfile,
                    length,
                    i;

                var quotesUIOrder = getCustomizedUiOrder();
                instrument.dealMinMaxAmounts = DealsAmountsManager.GetDealMinMaxAmounts(instrument.id, instrument.maxDeal);

                if (profileInstrumentList) {
                    for (i = 0, length = profileInstrumentList.length; i < length; i++) {
                        if (profileInstrumentList[i].instrument == instrument.id) {
                            filteredInstrumentFromProfile = profileInstrumentList[i];

                            break;
                        }
                    }
                }

                if (filteredInstrumentFromProfile) {
                    defaultDealSize = filteredInstrumentFromProfile.defaultAmount;
                } else {
                    defaultDealSize = instrument.defaultDealSize;
                    // Find the default deal size if it has been defined on UIQuotesSettings
                    for (i = 0, length = quotesUIOrder.length; i < length; i++) {
                        if (quotesUIOrder[i][eQuotesUIOrder.InstrumentID] == instrument.id) {
                            defaultDealSize = quotesUIOrder[i][eQuotesUIOrder.DealAmount];
                            break;
                        }
                    }

                    if (customerType === eCustomerType.TradingBonus) {
                        defaultDealSize = instrument.dealMinMaxAmounts[0];
                    }
                }

                // Find the nearest amount from the list
                if (defaultDealSize) {

                    var isDefaultDealSizeOnTheInterval = general.toNumeric(instrument.dealMinMaxAmounts[0]) <= general.toNumeric(defaultDealSize) && general.toNumeric(defaultDealSize) <= general.toNumeric(instrument.dealMinMaxAmounts[1]);

                    if (isDefaultDealSizeOnTheInterval) {
                        instrument.defaultDealSize = general.toNumeric(defaultDealSize);
                    } else {
                        //happens when defaultDealSize is less than instrument.dealMinMaxAmounts[0]
                        instrument.defaultDealSize = instrument.dealMinMaxAmounts[0];
                    }
                } else {
                    instrument.defaultDealSize = instrument.dealMinMaxAmounts[0];
                }

                instrumentList.OverrideItem(instrument.id, instrument);
            }

            //---------------------------------------------------------
            function setInstrumentDealAmount(instrumentId, dealAmount) {
                var instrument = instrumentList.GetItem(instrumentId);

                if (instrument) {
                    instrument.defaultDealSize = dealAmount;
                    instrumentList.SetItem(instrumentId, instrument);
                }

                ProfileInstruments.UpdateInstrumentAmount(instrumentId, dealAmount);
            }

            //---------------------------------------------------------
            function getInstrumentBySignalName(signalName) {
                var returnInstrument;

                instrumentList.ForEach(function (i, instrument) {
                    if (instrument.signalName.trim().toLowerCase() == signalName.trim().toLowerCase()) {
                        returnInstrument = instrument;
                    }
                });

                return returnInstrument;
            }

            //---------------------------------------------------------
            function buildCollection() {
                var instruments = systemInfo.get('instruments') || [];

                for (var i = 0, length = instruments.length; i < length; i++) {
                    var instrument = new Instrument(instruments[i], hasWeightedVolumeFactor, isOvernightOnForex);

                    if (instrument.isTradable) {
                        instrumentIDs.push(instrument.id);
                    }

                    instrumentList.OverrideItem(instrument.id, instrument);
                }

                buildEnhancedInstrumentList();
            }

            //---------------------------------------------------------
            function buildEnhancedInstrumentList() {
                instrumentList.ForEach(function (i, instrument) {
                    if (!general.isDefinedType(instrument['id']) || instrument.weightedVolumeFactor <= 1) {
                        return;
                    }

                    enhancedInstruments.push({
                        id: instrument.id,
                        weightedVolumeFactor: instrument.weightedVolumeFactor
                    });
                });
            }

            //---------------------------------------------------------
            function updateInstruments(instrumentsFromServer) {
                var enhancedInstrumentListBackup = enhancedInstruments.splice(0);

                systemInfo.save('instruments', instrumentsFromServer || []);

                instrumentIDs.length = 0;
                instrumentList.Clear();

                buildCollection();

                if (!general.equals(enhancedInstruments, enhancedInstrumentListBackup)) {
                    onEnhancedInstrumentsChange.Invoke();
                }
            }

            //---------------------------------------------------------
            function getInstrument(instrumentId) {
                return instrumentList.GetItem(instrumentId);
            }

            function isInstrumentStock(instrumentId) {
                var instrument = getInstrument(instrumentId);

                if (!general.isNullOrUndefined(instrument)) {
                    return instrument.isStock;
                }

                return false;
            }

            //---------------------------------------------------------
            function getInstrumentPropUsedForConversion(fromSymbolId, toSymbolId) {
                var instrumentProp = null;

                instrumentList.ForEach(function (i, instrument) {
                    if (instrument.baseSymbol == fromSymbolId && instrument.otherSymbol == toSymbolId) {
                        instrumentProp = { id: instrument.id, factor: instrument.factor, isOppositeInstrumentFound: false };
                    }

                    if (instrument.otherSymbol == fromSymbolId && instrument.baseSymbol == toSymbolId) {
                        instrumentProp = { id: instrument.id, factor: instrument.factor, isOppositeInstrumentFound: true };
                    }
                });

                return instrumentProp;
            }

            //---------------------------------------------------------
            function getEnhancedInstruments() {
                return enhancedInstruments;
            }

            //---------------------------------------------------------
            function getInstrumentName(instrumentId) {
                var instrument = getInstrument(instrumentId);

                if (instrument) {
                    return instrument.ccyPair;
                }

                return instrumentId;
            }

            //---------------------------------------------------------
            function getInstrumentAttribute(instrumentId, attrName) {
                var instrument = getInstrument(instrumentId);

                if (instrument) {
                    return instrument[attrName];
                }

                return '';
            }

            //---------------------------------------------------------
            function getInstrumentIds() {
                return instrumentIDs;
            }

            //---------------------------------------------------------
            function getCustomizedUiOrder() {
                return customizedUiOrder;
            }

            //---------------------------------------------------------
            function getQuotesUiOrder() {
                return quotesUiOrder;
            }

            //---------------------------------------------------------
            function getFavoriteInstruments(top) {
                top = top || customizedUiOrder.length;

                if (top > customizedUiOrder.length) {
                    top = customizedUiOrder.length;
                }

                return getInstrumentsFromPreset(customizedUiOrder, ePresetType.PresetCustomized, top);
            }

            //---------------------------------------------------------
            function getMainMostPopularPresetIds() {
                return [
                    ePresetType.PresetMostPopular,
                    ePresetType.PresetMostPopularWithoutFutures,
                    ePresetType.PresetMostPopularCurrencies,
                    ePresetType.PresetMostPopularWithoutShares,
                    ePresetType.PresetMostPopularWithoutFuturesWithoutShares
                ];
            }

            //---------------------------------------------------------
            function getMainMostPopularPresetId() {
                var mainMostPopularPresetIds = getMainMostPopularPresetIds();

                var mostPopularPresetId = general.objectFirst(mainMostPopularPresetIds, function hasInstruments(presetId) {
                    var preset = presetInstruments[presetId];

                    return preset && preset.length > 0;
                });

                return mostPopularPresetId;
            }

            //---------------------------------------------------------
            function getMainMostPopularInstruments() {
                var mostPopularPresetId = getMainMostPopularPresetId();

                return getInstrumentsFromPreset(presetInstruments[mostPopularPresetId], mostPopularPresetId);
            }

            //---------------------------------------------------------
            function getInstrumentsFromPreset(preset, presetId, count) {
                var instruments = [],
                    instrumentId,
                    instrument;

                if (general.isNullOrUndefined(preset)) {
                    return instruments;
                }

                var length = count || preset.length;

                for (var i = 0; i < length; i++) {
                    instrumentId = preset[i][eQuotesUIOrder.InstrumentID];
                    instrument = getInstrument(instrumentId);

                    if (instrument) {
                        instrument.presetId = presetId;
                        instruments.push(instrument);
                    }
                }

                return instruments;
            }

            //---------------------------------------------------------
            function setQuotesUiOrder(uiOrder, skipRegister, listName) {
                uiOrder = uiOrder || [];
                listName = listName || eRegistrationListName.QuotesTable;
                quotesUiOrder = uiOrder.slice(0);

                if (!skipRegister) {
                    onUiOrderChanged.Invoke(listName, quotesUiOrder);
                }
            }

            //---------------------------------------------------------
            function setCustomizedUiOrder(uiOrder, skipUpdate) {
                uiOrder = uiOrder || [];
                customizedUiOrder = uiOrder.slice(0);

                // todo union this ds in server if not breaking logic on editing custom
                if (general.equals(presetInstruments[ePresetType.PresetCustomized], customizedUiOrder) === false && !skipUpdate) {
                    presetInstruments[ePresetType.PresetCustomized] = customizedUiOrder;
                    onFavoritesPresetChanged.Invoke();
                }
            }

            //---------------------------------------------------------
            function getPresetInstruments(presetId) {
                if (typeof presetId !== 'undefined') {
                    return presetInstruments[presetId];
                }

                return presetInstruments;
            }

            //---------------------------------------------------------
            function getUserDefaultInstrument() {
                var instrumentId = 3631;
                var profileInstrumentId = ProfileInstruments.GetSelected();

                if (profileInstrumentId && getInstrument(profileInstrumentId)) {
                    instrumentId = profileInstrumentId;
                }

                return instrumentId;
            }

            //---------------------------------------------------------
            function foreachIntrument(handler) {
                return instrumentList.ForEach(handler);
            }

            //---------------------------------------------------------
            function hasIntrumentId(instrumentId) {
                return instrumentList.HasItem(instrumentId);
            }

            //---------------------------------------------------------
            function getPresetsForInstrument(instrumentId) {
                var presetsList = [];

                for (var presetId in presetInstruments) {
                    if (!presetInstruments.hasOwnProperty(presetId)) {
                        continue;
                    }

                    var instruments = presetInstruments[presetId];

                    for (var idxInstrument = 0; idxInstrument < instruments.length; idxInstrument++) {
                        if (instruments[idxInstrument][0] === instrumentId) {
                            presetsList.push(presetId);
                            break;
                        }
                    }
                }

                return presetsList;
            }

            //---------------------------------------------------------
            function getInstrumentFirstChar(instrumentId) {
                var instrument = getInstrument(instrumentId);

                return instrument ? instrument.instrumentEnglishName.substring(0, 1) : '***';
            }

            return {
                Init: init,
                Clear: clear,
                SetPresetIntruments: setPresetIntruments,
                GetInstrumentIds: getInstrumentIds,
                GetCustomizedUiOrder: getCustomizedUiOrder,
                SetCustomizedUiOrder: setCustomizedUiOrder,
                GetQuotesUIOrder: getQuotesUiOrder,
                SetQuotesUIOrder: setQuotesUiOrder,
                ForeachInstrument: foreachIntrument,
                GetEnhancedInstruments: getEnhancedInstruments,
                GetInstrument: getInstrument,
                HasInstrumentId: hasIntrumentId,
                GetInstrumentPropUsedForConversion: getInstrumentPropUsedForConversion,
                GetInstrumentName: getInstrumentName,
                GetInstrumentAttribute: getInstrumentAttribute,
                GetFavoriteInstruments: getFavoriteInstruments,
                GetMainMostPopularInstruments: getMainMostPopularInstruments,
                SetInstrumentDealAmount: setInstrumentDealAmount,
                GetUpdatedInstrumentWithDealMinMaxAmounts: getUpdatedInstrumentWithDealMinMaxAmounts,
                ResetInstrumentsDealAmounts: clearInstrumentDealMinMaxAmounts,
                GetPresetInstruments: getPresetInstruments,
                GetInstrumentBySignalName: getInstrumentBySignalName,
                GetUserDefaultInstrumentId: getUserDefaultInstrument,
                UpdateInstruments: updateInstruments,
                OnUiOrderChanged: onUiOrderChanged,
                OnEnhancedInstrumentsChange: onEnhancedInstrumentsChange,
                OnFavoritesPresetChanged: onFavoritesPresetChanged,
                GetPresetsForInstrument: getPresetsForInstrument,
                GetInstrumentFirstChar: getInstrumentFirstChar,
                IsInstrumentStock: isInstrumentStock,
                GetMainMostPopularPresetId: getMainMostPopularPresetId
            };
        }

        var module = window.$instrumentsManager = new InstrumentsManager();

        return module;
    }
);
