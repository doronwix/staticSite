function Instrument(instrumentInfo, hasWeightedVolumeFactor, isOvernightOnForex) {
    this.id = instrumentInfo[eInstruments.id];
    this.ccyPair = instrumentInfo[eInstruments.ccyPair];
    this.amountGroupId = instrumentInfo[eInstruments.amountGroupId];
    this.factor = instrumentInfo[eInstruments.factor];
    this.isTradable = instrumentInfo[eInstruments.tradable] == 1;
    this.hasSignal = instrumentInfo[eInstruments.hasSignals] == 1;
    this.signalName = instrumentInfo[eInstruments.signalName];
    this.dealMinMaxAmounts = [];
    this.defaultDealSize = instrumentInfo[eInstruments.defaultDealSize];
    this.maxDeal = instrumentInfo[eInstruments.maxDeal];
    this.SLMinDistance = instrumentInfo[eInstruments.SLMinDistance];
    this.TPMinDistance = instrumentInfo[eInstruments.TPMinDistance];

    this.DecimalDigit = instrumentInfo[eInstruments.DecimalDigit];
    this.PipDigit = instrumentInfo[eInstruments.PipDigit];
    this.SpecialFontStart = instrumentInfo[eInstruments.SpecialFontStart];
    this.SpecialFontLength = instrumentInfo[eInstruments.SpecialFontLength];

    this.instrumentTypeId = instrumentInfo[eInstruments.instrumentTypeId];
    this.assetTypeId = instrumentInfo[eInstruments.assetTypeId];
    this.expirationDate = instrumentInfo[eInstruments.expirationDate] === '' ? null : instrumentInfo[eInstruments.expirationDate];
    //--------- future -----------------------------

    this.isFuture = this.assetTypeId === eAssetType.Future;
    this.isShare = this.assetTypeId === eAssetType.Share;
    this.isForex = this.assetTypeId === eAssetType.Forex;
    this.isStock = this.instrumentTypeId === eInstrumentType.Stocks;

    this.futureValueDate = null;

    //-------- symbols -----------------------------

    this.baseSymbol = instrumentInfo[eInstruments.baseSymbolId];
    this.otherSymbol = instrumentInfo[eInstruments.otherSymbolId];
    this.baseSymbolName = instrumentInfo[eInstruments.ccyPair].toString().split(/\//g)[0];
    this.otherSymbolName = instrumentInfo[eInstruments.ccyPair].toString().split(/\//g)[1];

    this.exchangeInstrumentName = instrumentInfo[eInstruments.exchangeInstrumentName];
    this.exchange = instrumentInfo[eInstruments.exchange];
    this.contractMonthAndYear = instrumentInfo[eInstruments.contractMonthAndYear];
    this.instrumentEnglishName = instrumentInfo[eInstruments.instrumentEnglishName];
    this.weightedVolumeFactor = hasWeightedVolumeFactor ? parseFloat(instrumentInfo[eInstruments.weightedVolumeFactor]) : 1;
    this.eventDate = instrumentInfo[eInstruments.eventDate];
    this.eventAmount = instrumentInfo[eInstruments.eventAmount];
    this.marketPriceTolerance = instrumentInfo[eInstruments.marketPriceTolerance];

    this.isOvernightOnForex = isOvernightOnForex;
}

define("handlers/Instrument", function(){ return Instrument });