define(
    'FxNet/LogicLayer/Deal/NewDealValidator',
    [
        'require',
        'Dictionary',
        'initdatamanagers/InstrumentsManager',
        'enums/alertenums',
        'devicemanagers/AlertsManager',
        'cachemanagers/QuotesManager',
        'devicemanagers/StatesManager',
    ],
    function NewDealValidator(require) {
        var dictionary = require('Dictionary'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            alertTypes = require('enums/alertenums'),
            alertsManager = require('devicemanagers/AlertsManager'),
            quotesManager = require('cachemanagers/QuotesManager'),
            statesManager = require('devicemanagers/StatesManager');
            
        var _baseOrder;

        var init = function(baseOrder) {
            _baseOrder = baseOrder;
        };

        var validate = function(instrumentId, dependentValidationErr) {
            var instrument = instrumentsManager.GetInstrument(instrumentId),
                tradingPermission = _baseOrder.CheckTradingAgreement(instrument),
                alertBody;

            if (statesManager.States.fxDenied() == true) {
                _baseOrder.ValidateOnlineTradingUser();
                return false;
            }

            if (tradingPermission !== eTradingAgreement.NotNeeded) {
                alertBody = String.format(dictionary.GetItem("rcFuturesRedirect"), instrument.ccyPair);
                alertsManager.UpdateAlert(alertTypes.ServerResponseAlert, null, alertBody, '');
                alertsManager.PopAlert(alertTypes.ServerResponseAlert);

                return false;
            }

            //-------------------------------------------

            var quote = quotesManager.Quotes.GetItem(instrument.id);

            if (quote && !quote.isActive()) {
                alertBody = String.format(dictionary.GetItem("InstrumentInactive"), instrument.ccyPair);
                alertsManager.UpdateAlert(alertTypes.ServerResponseAlert, null, alertBody, '');
                alertsManager.PopAlert(alertTypes.ServerResponseAlert);

                return false;
            }

            //------------------------------------------------

            var clErr = dependentValidationErr || "";

            if (clErr.length > 0) {
                alertBody = clErr;
                alertsManager.UpdateAlert(alertTypes.ServerResponseAlert, null, alertBody, '');
                alertsManager.PopAlert(alertTypes.ServerResponseAlert);

                return false;
            }

            return true;
        };

        return {
            Init: init,
            Validate: validate
        };
    }
);
