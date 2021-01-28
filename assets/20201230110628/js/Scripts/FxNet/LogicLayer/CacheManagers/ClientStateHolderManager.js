define(
    'cachemanagers/ClientStateHolderManager',
    [
        'require',
        'handlers/general',
        'handlers/Delegate',
        'initdatamanagers/Customer'
    ],
    function ClientStateHolderManager(require) {
        var general = require('handlers/general'),
            delegate = require('handlers/Delegate'),
            customer = require('initdatamanagers/Customer');

        var onChange = new delegate(),
            csHolder = {
                accountBalance: 0,
                equity: 0,
                netExposure: 0,
                margin: 0,
                exposureCoverage: 0,
                totalEquity: 0,
                openPL: 0,
                usedMargin: 0,
                marginUtilizationPercentage: 0,
                availableMargin: 0,
                marginUtilizationStatus: 0,
                maintenanceMargin: 0
            };

        function processData(data) {
            updateData(data);
            onChange.Invoke(csHolder);
        }

        function updateData(data) {
            csHolder.accountBalance = data[eCSHolder.accountBalance];
            csHolder.equity = data[eCSHolder.equity];
            csHolder.netExposure = data[eCSHolder.netExposure];
            csHolder.margin = data[eCSHolder.margin];
            csHolder.exposureCoverage = data[eCSHolder.exposureCoverage];
            csHolder.totalEquity = data[eCSHolder.totalEquity];
            csHolder.openPL = data[eCSHolder.openPL];

            csHolder.usedMargin = data[eCSHolder.usedMargin];

            csHolder.maintenanceMargin = general.formatNumberWithThousandsSeparator(
                (general.toNumeric(csHolder.usedMargin) * customer.prop.maintenanceMarginPercentage / 100).toFixed(2));

            csHolder.marginUtilizationPercentage = data[eCSHolder.marginUtilizationPercentage];
            csHolder.availableMargin = data[eCSHolder.availableMargin];
            csHolder.marginUtilizationStatus = data[eCSHolder.marginUtilizationStatus];
        }

        return {
            CSHolder: csHolder,
            OnChange: onChange,
            ProcessData: processData
        };
    }
);