var TrackingData = function () {
    var properties = null;
    var session = {
        NumberOfDeals : 0,
        NumberOfDeposits: 0
    }

    var init = function () {
        properties = window.TrackingCommonData()(StorageFactory(StorageFactory.eStorageType.session));
    };

    var getProperties = function () {
        if (properties === null) {
            init();
        }

        return properties;
    };

    var incrementDealsNumber = function () {

        if (!properties.hasOwnProperty('NumberOfDeals')) {
            properties.NumberOfDeals = 0;
        }

        properties.NumberOfDeals = Number(properties.NumberOfDeals) + session.NumberOfDeals;
        session.NumberOfDeals += 1;
    };

    var incrementDepositsNumber = function () {
        if (!properties.hasOwnProperty('NumberOfDeposits')) {
            properties.NumberOfDeposits = 0;
        }

        properties.NumberOfDeposits = Number(properties.NumberOfDeposits) + session.NumberOfDeposits;
        session.NumberOfDeposits += 1;
    };


    return {
        init: init,
        getProperties: getProperties,
        incrementDealsNumber: incrementDealsNumber,
        incrementDepositsNumber: incrementDepositsNumber
  
    };
};

