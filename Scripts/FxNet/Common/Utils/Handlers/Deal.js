function TDeal(data, plData) {
    data = data || [];
    plData = plData || [];

    this.instrumentID = data[eDeal.instrumentID];
    this.orderID = data[eDeal.orderID];
    this.baseSymbol = data[eDeal.baseSymbol];
    this.otherSymbol = data[eDeal.otherSymbol];
    this.positionNumber = data[eDeal.positionNumber];
    this.accountNumber = data[eDeal.accountNumber];
    this.orderDir = data[eDeal.orderDir];
    this.orderRate = data[eDeal.orderRate];
    this.orderRateNumeric = parseFloat((this.orderRate || '').replace(',', ''));
    this.buySymbolID = data[eDeal.buySymbolID];
    this.buyAmount = data[eDeal.buyAmount];
    this.sellSymbolID = data[eDeal.sellSymbolID];
    this.sellAmount = data[eDeal.sellAmount];
    this.valueDate = data[eDeal.valueDate];
    this.dealType = data[eDeal.dealType];
    this.exeTime = data[eDeal.exeTime];
    this.slRate = data[eDeal.slRate];
    this.slID = data[eDeal.slID];
    this.tpRate = data[eDeal.tpRate];
    this.tpID = data[eDeal.tpID];
    this.additionalPL = data[eDeal.additionalPL] || 0;
    this.spreadDiscount = data[eDeal.spreadDiscount] || 0;

    this.spotRate = plData[eDealPL.spotRate] || 0;
    this.fwPips = plData[eDealPL.fwPips] || 0;
    this.closingRate = plData[eDealPL.closingRate] || 0;
    this.pl = plData[eDealPL.pl] || 0;
    this.plNumeric = parseFloat((this.pl || '').replace(',', ''));
    this.lastUpdate = plData[eDealPL.lastUpdate];
    this.commission = plData[eDealPL.commission] || 0;

}

TDeal.prototype.Update = function(data) {
    this.instrumentID = data[eDeal.instrumentID];
    this.baseSymbol = data[eDeal.baseSymbol];
    this.otherSymbol = data[eDeal.otherSymbol];
    this.orderID = data[eDeal.orderID];
    this.positionNumber = data[eDeal.positionNumber];
    this.accountNumber = data[eDeal.accountNumber];
    this.orderDir = data[eDeal.orderDir];
    this.orderRate = data[eDeal.orderRate];
    this.buySymbolID = data[eDeal.buySymbolID];
    this.buyAmount = data[eDeal.buyAmount];
    this.sellSymbolID = data[eDeal.sellSymbolID];
    this.sellAmount = data[eDeal.sellAmount];
    this.valueDate = data[eDeal.valueDate];
    this.dealType = data[eDeal.dealType];
    this.exeTime = data[eDeal.exeTime];
    this.slRate = data[eDeal.slRate];
    this.slID = data[eDeal.slID];
    this.tpRate = data[eDeal.tpRate];
    this.tpID = data[eDeal.tpID];
    this.additionalPL = data[eDeal.additionalPL];
    this.spreadDiscount = data[eDeal.spreadDiscount] || 0;
};

TDeal.prototype.UpdatePL = function(plData) {
    this.spotRate = plData[eDealPL.spotRate];
    this.fwPips = plData[eDealPL.fwPips];
    this.closingRate = plData[eDealPL.closingRate];
    this.pl = plData[eDealPL.pl];
    this.lastUpdate = plData[eDealPL.lastUpdate];
    this.commission = plData[eDealPL.commission]; 
    this.plNumeric = parseFloat((this.pl || '').replace(',', ''));
};


define("handlers/Deal", function () { return TDeal });