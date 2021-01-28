define(
    'FxNet/LogicLayer/Deal/DealLifeCycle',
    [
        'require',
        'handlers/general',
        'cachemanagers/CacheManager'
    ],
    function DealLifeCycle(require) {
        var CacheManager = require('cachemanagers/CacheManager'),
            general = require('handlers/general');

        var getIslamicValueDateBeforeDeal = function(assetTypeId, dealPermit) {
            var isDealOnIslamicAccount = (assetTypeId === eAssetType.Share || assetTypeId === eAssetType.Future) && dealPermit === eDealPermit.Islamic,
                serverTime,
                valueDate;

            if (isDealOnIslamicAccount) {
                serverTime = new Date(CacheManager.ServerTime().getTime());
                valueDate = serverTime.toLaterDate().skipWeekendDays();
                return valueDate;
            }
            return null;
        };

        var sharesIsCorporateActionDateSignificant_BeforeDeal = function(dealPermit, assetTypeId, corporateActionDate) {
            return assetTypeId === eAssetType.Share &&
            ((dealPermit !== eDealPermit.Islamic && !!corporateActionDate) ||
            (dealPermit === eDealPermit.Islamic && !!corporateActionDate &&
                general.str2Date(corporateActionDate, "d/m/Y H:M") < getIslamicValueDateBeforeDeal(assetTypeId, dealPermit)));
        };

        var sharesIsDividendDateSignificant_BeforeDeal = function(dealPermit, assetTypeId, corporateActionDate, dividendDate) {
            return assetTypeId === eAssetType.Share &&
            ((dealPermit !== eDealPermit.Islamic && !corporateActionDate && !!dividendDate) ||
            (dealPermit === eDealPermit.Islamic && !corporateActionDate && !!dividendDate &&
                general.str2Date(dividendDate, "d/m/Y H:M") < getIslamicValueDateBeforeDeal(assetTypeId, dealPermit)));
        };

        var futuresIsRolloverDateSignificant_BeforeDeal = function(dealPermit, assetTypeId, rolloverDate) {
            return assetTypeId === eAssetType.Future &&
            ((dealPermit !== eDealPermit.Islamic && !!rolloverDate) ||
            (dealPermit === eDealPermit.Islamic && !!rolloverDate && general.str2Date(rolloverDate, "d/m/Y H:M") < getIslamicValueDateBeforeDeal(assetTypeId, dealPermit)));
        };

        var futuresIsRolloverDateSignificant_AfterDeal = function (assetTypeId, instrumentRolloverDate, valueDate) {
            if (assetTypeId === eAssetType.Future && !!instrumentRolloverDate) 
                return (!valueDate || general.str2Date(instrumentRolloverDate, 'd,m,y,H,M,S') < general.str2Date(valueDate, 'd,m,y,H,M,S'));
            return false;
        };

        var sharesIsCorporateActionDateSignificant_AfterDeal = function (assetTypeId, instrumentCorporateActionDate, valueDate) {
            if (assetTypeId === eAssetType.Share && !!instrumentCorporateActionDate) 
                return (!valueDate ||
                    general.str2Date(instrumentCorporateActionDate, 'd,m,y,H,M,S') < general.str2Date(valueDate, 'd,m,y,H,M,S'));
            return false;
        };

        var sharesIsDividendDateSignificant_AfterDeal = function (assetTypeId, instrumentDividendDate, instrumentCorporateActionDate, valueDate) {
            if (assetTypeId === eAssetType.Share && !!instrumentDividendDate && !instrumentCorporateActionDate) {
                return (!valueDate ||
                    general.str2Date(instrumentDividendDate, 'd,m,y,H,M,S') < general.str2Date(valueDate, 'd,m,y,H,M,S'));
            }
            return false;
        };

        return {
            getIslamicValueDateBeforeDeal: getIslamicValueDateBeforeDeal,
            sharesIsCorporateActionDateSignificant_BeforeDeal: sharesIsCorporateActionDateSignificant_BeforeDeal,
            sharesIsDividendDateSignificant_BeforeDeal: sharesIsDividendDateSignificant_BeforeDeal,
            futuresIsRolloverDateSignificant_BeforeDeal: futuresIsRolloverDateSignificant_BeforeDeal,
            futuresIsRolloverDateSignificant_AfterDeal: futuresIsRolloverDateSignificant_AfterDeal,
            sharesIsCorporateActionDateSignificant_AfterDeal: sharesIsCorporateActionDateSignificant_AfterDeal,
            sharesIsDividendDateSignificant_AfterDeal: sharesIsDividendDateSignificant_AfterDeal
        };
    }
);
