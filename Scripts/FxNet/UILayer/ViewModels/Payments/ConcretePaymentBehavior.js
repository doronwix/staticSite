/* globals eConcretePaymentDataState */
define(
    'viewmodels/Payments/ConcretePaymentBehavior',
    [
        'require',
        'knockout',
        'handlers/general',
        'deviceviewmodels/PaymentSelectionBehaviors',
        'StateObject!PaymentType',
        'enums/enums'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            PaymentSelectionBehaviors = require('deviceviewmodels/PaymentSelectionBehaviors'),
            paymentTypeStateObject = require('StateObject!PaymentType');

        paymentTypeStateObject.set(eConcretePaymentDataState.Pending);
        paymentTypeStateObject.set(eConcretePaymentDataState.Success);
        
        function ConcretePaymentBehavior() {
            function getPaymentConfigData(payment) {
                if (!payment.paymentData || !JSONHelper.IsValid(payment.paymentData)) {
                    return {};
                }

                return JSONHelper.STR2JSON("ConcretePaymentBehavior:ConcretePaymentBehavior", payment.paymentData);
            }

            function publishPaymentInfo(configData, payment, paymentImageClass, country, allowedCreditCards) {
                var concretePaymentInfo = {
                    paymentData: configData.paymentData || payment.paymentData,
                    paymentCountry: country,
                    concretePaymentType: payment.id,
                    paymentCurrencies: payment.currencies,
                    paymentType: payment.paymentType,
                    paymentImageClass: paymentImageClass,
                    originalPaymentName: payment.originalPaymentName || payment.name,
                    subtitleContentKey: payment.subtitleContentKey,
                    allowedCreditCards: allowedCreditCards,
                    isCcBinFromEea: payment.isCcBinFromEea
                };

                ko.postbox.publish(ePostboxTopic.ConcretePaymentData, concretePaymentInfo);

                paymentTypeStateObject.update(eConcretePaymentDataState.Pending, concretePaymentInfo);
                paymentTypeStateObject.update(eConcretePaymentDataState.Success, concretePaymentInfo);
            }

            function showPaymentView(payment, country, paymentImageClass, allowedCreditCards) {
                if (general.isNullOrUndefined(payment) || general.isNullOrUndefined(payment.paymentType)) {
                    return;
                }

                var configData = getPaymentConfigData(payment);

                if (general.isNullOrUndefined(configData)) {
                    configData = {};
                }

                var viewType = configData.viewType;

                PaymentSelectionBehaviors.ShowSelectedBehavior(payment.paymentType, viewType);
                PaymentSelectionBehaviors.CheckMissingCustomerInformation();

                publishPaymentInfo(configData, payment, paymentImageClass, country, allowedCreditCards);
            }

            return {
                showPaymentView: showPaymentView
            };
        }

        return ConcretePaymentBehavior;
    }
);