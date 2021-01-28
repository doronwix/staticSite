"use strict";
define(
    "deviceviewmodels/MobileRegularWireTransferViewModel",
    [
        "require",
        "knockout",
        'viewmodels/Payments/RegularWireTransferViewModel'
    ],
    function (require) {
        var ko = require("knockout"),
            RegularWireTransferViewModel = require('viewmodels/Payments/RegularWireTransferViewModel');

        function MobileRegularWireTransferViewModel() {

            var parentVM = new RegularWireTransferViewModel(),
                subscribers = [],
                info = {
                    isAmountInputFocused: ko.observable(false),
                    isPaymentButtonVisible: ko.observable(true)
                };

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
            }

            function deposit() {
                parentVM.Deposit();
            }

            function submitIfValid() {
                ko.postbox.publish(ePostboxTopic.PaymentDeposit);
                ko.postbox.publish("trading-event", "deposit-submit");
            }

            function dispose() {
                subscribers.forEach(function (subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
                parentVM.dispose();
            }

            init();

            return {
                Form: parentVM.Form,
                Info: info,
                Amount: parentVM.Amount,
                dispose: dispose,
                SubmitIfValid: submitIfValid
            };
        }

        return MobileRegularWireTransferViewModel;
    }
);