define(
    'viewmodels/OpenDealsViewModelBase',
    [
        'require',
        'handlers/general',
        'initdatamanagers/InstrumentsManager',
    ],
    function OpenDealsVMBaseDef() {
        var general = require('handlers/general'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager')

        function OpenDealsViewModelBase() {
            function getValueDate(deal) {
                var instrument = instrumentsManager.GetInstrument(deal.instrumentID);

                if (instrument.isShare) {
                    var corporateActionDate = instrument.getCorporateActionDate();

                    if (corporateActionDate) {
                        if (deal.valueDate) {
                            return {
                                isValueDateEmpty: false,
                                date: general.str2Date(deal.valueDate, 'd/m/y H:M') < general.str2Date(corporateActionDate, 'd/m/y H:M') ? deal.valueDate : corporateActionDate
                            };
                        }

                        return {
                            isValueDateEmpty: true,
                            date: corporateActionDate
                        };
                    }
                }

                if (deal.valueDate) {
                    return {
                        isValueDateEmpty: false,
                        date: deal.valueDate
                    };
                } else {
                    return {
                        isValueDateEmpty: true,
                        date: null
                    };
                }
            }

            return {
                getValueDate: getValueDate
            };
        }

        return OpenDealsViewModelBase;
    }
);
