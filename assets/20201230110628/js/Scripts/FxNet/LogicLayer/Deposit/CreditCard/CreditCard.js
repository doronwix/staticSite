var TCreditCard = function (data) {
    var typeID,
        orderID,
        name,
        ccyList,
        ccyUIOrder,
        D3SecureStatus,
        depositingActionType;

    function init(initialData) {
        typeID = initialData[eCreditCard.CardTypeID];
        orderID = initialData[eCreditCard.OrderID];
        name = initialData[eCreditCard.Name];
        D3SecureStatus = initialData[eCreditCard.D3SecureStatus];
        ccyList = GetCurrencies(initialData[eCreditCard.Currencies]);
        ccyUIOrder = ccyList.Sort("orderID");
        depositingActionType = initialData[eCreditCard.DepositingActionType];
    }

    function GetCurrencies(currenciesData) {
        var currencies = new THashTable();

        for (var i = 0, ii = currenciesData.length; i < ii; i++) {

            currencies.SetItem(currenciesData[i][eDepositCurrency.CurrencyID], new TDepositCurrency(currenciesData[i]));
        }

        return currencies;
    }

    init(data);

    return {

        typeID: typeID,
        orderID: orderID,
        name: name,
        D3SecureStatus: D3SecureStatus,
        ccyList: ccyList,
        ccyUIOrder: ccyUIOrder,
        depositingActionType: depositingActionType
    }
};
