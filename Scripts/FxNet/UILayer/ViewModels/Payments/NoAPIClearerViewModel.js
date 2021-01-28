'use strict';
define(
    'viewmodels/Payments/NoAPIClearerViewModel',
    [
        "require",
        "knockout",
        'JSONHelper'
    ],
    function (require) {
        var ko = require("knockout"),
            JSONHelper = require('JSONHelper');

        function NoAPIClearerViewModel() {
            var formObs = { paymentData: ko.observable(), logData: ko.observable() },
                subscribers = [];
            
            subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData,
                function (newValue) {
                    var paymentData = JSONHelper.STR2JSON("NoAPIClearerViewModel:NoAPIClearerViewModel", newValue.paymentData);
                    formObs.paymentData(Dictionary.GetItem(paymentData.paymentInfo, 'payments_concreteNames', ''));
                    formObs.logData(paymentData.logInfo);
                },
                true));
            
            function dispose() {
                subscribers.forEach(function(subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
            }

            return {
                Form: formObs,
                dispose: dispose
            };
        }

        return NoAPIClearerViewModel;
    }
);