function TLimit(orderID, data) {
    data = data || [];

    this.orderID = orderID;
    this.instrumentID = data[eLimit.instrumentID];
    this.baseSymbol = data[eLimit.baseSymbol];
    this.otherSymbol = data[eLimit.otherSymbol];
    this.positionNumber = data[eLimit.positionNumber];
    this.accountNumber = data[eLimit.accountNumber];
    this.orderDir = data[eLimit.orderDir];
    this.orderRate = data[eLimit.orderRate];
    this.buySymbolID = data[eLimit.buySymbolID];
    this.buyAmount = data[eLimit.buyAmount];
    this.sellSymbolID = data[eLimit.sellSymbolID];
    this.sellAmount = data[eLimit.sellAmount];
    this.type = data[eLimit.type];
    this.mode = data[eLimit.mode];
    this.expirationDate = data[eLimit.expirationDate];
    this.entryTime = data[eLimit.entryTime];
    this.slRate = data[eLimit.slRate];
    this.tpRate = data[eLimit.tpRate];
    this.otherLimitID = data[eLimit.otherLimitID];
    this.status = "";
}

TLimit.prototype.Update = function(data) {
    this.orderID = data[eLimit.orderID];
    this.instrumentID = data[eLimit.instrumentID];
    this.baseSymbol = data[eLimit.baseSymbol];
    this.otherSymbol = data[eLimit.otherSymbol];
    this.positionNumber = data[eLimit.positionNumber];
    this.accountNumber = data[eLimit.accountNumber];
    this.orderDir = data[eLimit.orderDir];
    this.orderRate = data[eLimit.orderRate];
    this.buySymbolID = data[eLimit.buySymbolID];
    this.buyAmount = data[eLimit.buyAmount];
    this.sellSymbolID = data[eLimit.sellSymbolID];
    this.sellAmount = data[eLimit.sellAmount];
    this.type = data[eLimit.type];
    this.mode = data[eLimit.mode];
    this.expirationDate = data[eLimit.expirationDate];
    this.entryTime = data[eLimit.entryTime];
    this.slRate = data[eLimit.slRate];
    this.tpRate = data[eLimit.tpRate];
    this.otherLimitID = data[eLimit.otherLimitID];
};