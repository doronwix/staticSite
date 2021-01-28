'use strict';
define(
    'viewmodels/Payments/AstropayCardViewModel',
    [
        'require',
        'knockout',
        'jquery',
        'configuration/initconfiguration',
        'viewmodels/Payments/eWalletPaymentFlowNo3rdParty',
        'viewmodels/Payments/EwalletComponentViewModel',
        'modules/CCNumberFormatterModule',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            $ = require('jquery'),
            initConfiguration = require('configuration/initconfiguration'),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlowNo3rdParty'),
            EwalletComponentViewModel = require('viewmodels/Payments/EwalletComponentViewModel'),
            ccNumberFormatterModule = require('modules/CCNumberFormatterModule'),
            dictionary = require('Dictionary');

        function AstropayCardViewModel() {
            function getAllYearsFromNow(numberOfYears) {
                var currentYear = new Date().getFullYear();
                var lastYear = currentYear + numberOfYears;
                var years = [];

                while (currentYear < lastYear) {
                    years.push((currentYear++).toString()) ;
                }

                return years;
            }

            var infoObs = {
                    months: ko.observableArray(),
                    years: ko.observableArray(),
                    isPaymentButtonVisible: ko.observable(true)
                },
                formObs = {
                    cardNumber: ko.observable(),
                    cvv: ko.observable(),
                    expirationMonth: ko.observable(''),
                    expirationYear: ko.observable(''),
                    paymentNote: ko.observable(),
                    expirationDate: ko.pureComputed(function () {
                        if (formObs.expirationMonth()
                            && formObs.expirationMonth.isValid()
                            && formObs.expirationYear()
                            && formObs.expirationYear.isValid()) {
                            return new Date(formObs.expirationYear(), formObs.expirationMonth())
                        }

                        return null;
                    })
                },

                ewalletVM = new EwalletComponentViewModel(paymentFlow, eDepositingActionType.AstropayCard, initConfiguration.AstropayCardConfiguration),

                additionalValidations = {
                    cardNumberValidation: formObs.cardNumber.extend({
                        required: {
                            params: true,
                            onlyIf: ewalletVM.Form.isDepositClicked
                        }
                    }),
                    cvv: formObs.cvv.extend({
                        required: {
                            onlyIf: ewalletVM.Form.isDepositClicked
                        },
                        digit: { value: true, onlyIf: ewalletVM.Form.isDepositClicked }
                    }),
                    expirationMonth: formObs.expirationMonth.extend({
                        required: {
                            value: true,
                            message: dictionary.GetItem('reqMonth'),
                            onlyIf: ewalletVM.Form.isDepositClicked
                        }
                    }),
                    expirationYear: formObs.expirationYear.extend({
                        required: {
                            value: true,
                            message: dictionary.GetItem('reqYear'),
                            onlyIf: ewalletVM.Form.isDepositClicked
                        }
                    }),
                    expirationDate: formObs.expirationDate.extend({
                        required: {
                            value: true,
                            onlyIf: ewalletVM.Form.isDepositClicked
                        }
                    })
                },
                subscribers = [];

            $.extend(ewalletVM.Info, infoObs);
            $.extend(ewalletVM.Form, formObs);

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));

                ewalletVM.init(function specificDataReset() {
                    setMonthsAndYears();
                    resetAmount();
                    formObs.cardNumber('');
                    formObs.cvv('');
                    formObs.expirationMonth('');
                    formObs.expirationYear('');
                }, true);

                ewalletVM.AddAdditionalValidations(additionalValidations);
            }

            function setMonthsAndYears() {
                var monthsArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
                ewalletVM.Info.months(monthsArray);
                ewalletVM.Info.years(getAllYearsFromNow(30));
            }

            function resetAmount() {
                if (ewalletVM.Amount.Data.value()) {
                    ewalletVM.Amount.Data.value('');
                }
            }

            function cardNumberOnKeyPress(context, event) {
                return ccNumberFormatterModule.OnKeyPress(event);
            }

            function cardNumberOnKeyUp(context, event) {
                ccNumberFormatterModule.OnKeyUp(event);
            }

            function deposit() {
                ewalletVM.Deposit(buildRequest());
            }

            function buildRequest() {
                return $.extend({
                    cardNumber: ewalletVM.Form.cardNumber(),
                    cardCvv: ewalletVM.Form.cvv(),
                    cardExpirationMonth: ewalletVM.Form.expirationMonth(),
                    cardExpirationYear: ewalletVM.Form.expirationYear()
                }, ewalletVM.buildRequest());
            }

            function submitIfValid() {
                ko.postbox.publish(ePostboxTopic.PaymentDeposit);
                ko.postbox.publish('trading-event', 'deposit-submit');
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
                OnKeyPress: cardNumberOnKeyPress,
                OnKeyUp: cardNumberOnKeyUp,
                dispose: dispose,
                SubmitIfValid: submitIfValid
            };
        }

        return AstropayCardViewModel;
    }
);