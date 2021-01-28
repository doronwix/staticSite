"use strict";
define(
    "deviceviewmodels/RisingSunAPMViewModel",
    [
        "require",
        "knockout",
        'configuration/initconfiguration',
        'viewmodels/Payments/eWalletPaymentFlow',
        'viewmodels/Payments/EwalletComponentViewModel',
        "Dictionary",
        'LoadDictionaryContent!payments_concreteView',
        'managers/PopupInNewWindowManager',
        'managers/PopupInAlertManager'
    ],
    function (require) {
        var ko = require("knockout"),
            dictionary = require("Dictionary"),
            initConfiguration = require('configuration/initconfiguration'),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlow'),
            popupInNewWindowManager = require('managers/PopupInNewWindowManager'),
            popupInAlertManager = require('managers/PopupInAlertManager'),
            EwalletComponentViewModel = require('viewmodels/Payments/EwalletComponentViewModel');

        function RisingSunAPMViewModel() {
            var settings = Object.assign(
                initConfiguration.RisingSunAPMConfiguration,
                {
                    title: dictionary.GetItem("eConcretePayment_660", "payments_concreteView")
                });
            var ewalletVM = new EwalletComponentViewModel(paymentFlow, eDepositingActionType.RisingSunAPM, settings),
                subscribers = [];

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, ewalletVM.Deposit));
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData,
                    function (newValue) {
                        if (newValue) {
                            settings.title = (newValue.paymentData === "ALIPAY"
                                ? dictionary.GetItem("eConcretePayment_319", "payments_concreteView")
                                : dictionary.GetItem("eConcretePayment_660", "payments_concreteView"));
                            if (newValue.paymentData === 'CUP') {
                                settings = Object.assign(settings, {
                                    prepare3rdPartyView: popupInNewWindowManager
                                });
                            } else {
                                settings = Object.assign(settings, {
                                    prepare3rdPartyView: popupInAlertManager
                                });
                            }
                        }
                    },
                    true));
                ewalletVM.init(null, true);
            }

            function deposit() {
                ko.postbox.publish(ePostboxTopic.PaymentDeposit);
                ko.postbox.publish("trading-event", "deposit-submit");
            }

            function dispose() {
                subscribers.forEach(function (subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
                ewalletVM.Info.isPaymentButtonVisible(false);
                ewalletVM.dispose();
            }

            init();

            return {
                Form: ewalletVM.Form,
                Info: ewalletVM.Info,
                Amount: ewalletVM.Amount,
                Deposit: deposit,
                dispose: dispose
            };
        }

        return RisingSunAPMViewModel;
    }
);