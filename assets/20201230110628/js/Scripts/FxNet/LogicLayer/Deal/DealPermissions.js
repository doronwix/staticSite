define(
    'FxNet/LogicLayer/Deal/DealPermissions',
    [
        'require',
        'initdatamanagers/Customer',
        'cachemanagers/PortfolioStaticManager',
        'cachemanagers/bonusmanager'
    ],
    function (require) {
        var customer = require('initdatamanagers/Customer'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            bonusManager = require('cachemanagers/bonusmanager');

        function customerDealPermit() {
            return customer.prop.dealPermit;
        }

        function hasSpreadDiscount() {
            return portfolioManager.Portfolio.pendingBonusType === ePendingBonusType.spreadDiscount && bonusManager.bonus().amountBase > 0;
        }

        return {
            CustomerDealPermit: customerDealPermit,
            HasSpreadDiscount: hasSpreadDiscount
        };
    }
);