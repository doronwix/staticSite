/*
 * require
 * Enum.js for kycStatus
 * $viewModelsManager for $viewModelsManager.VManager.SwitchViewVisible
 */
define(
    'alerts/QuestionnaireValidationAlert',
    [
        "require",
        'devicealerts/Alert',
        "Dictionary",
        "dataaccess/dalKycClientQuestionnaire",
        'generalmanagers/StatesManager',
        "initdatamanagers/Customer"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert');
        var Dictionary = require("Dictionary");
        var dal = require('dataaccess/dalKycClientQuestionnaire');
        var statesManager = require('generalmanagers/StatesManager');
        var customer = require("initdatamanagers/Customer");

        var QuestionnaireValidationAlert = function () {
            // inheritance with Constructor function
            var self = AlertBase.call(this),
                alertsContents = {
                    title: "lblImportent",
                    messages: ["KYC_Failed_p1", "KYC_Failed_p2", "KYC_Failed_p3", "KYC_Failed_p4"],
                    buttons: ["btnIAmAware", "btnIAmExit"]
                };
            var popUpManager = window.PopUpManager;
            // public virtual: different implementation on desktop version where go to trading view is close current 
            // external window.
            self.goToTradingView = function () {
                require(['devicemanagers/ViewModelsManager'], function (viewModelsManager) {
                    return viewModelsManager.VManager.SwitchViewVisible(customer.prop.startUpForm);
                });
            };

            self.goToDepositView = function () {
                require(['devicemanagers/ViewModelsManager'], function (viewModelsManager) {
                    return viewModelsManager.VManager.RedirectToForm(eForms.Deposit);
                });
            };

            self.defer = Q.defer();

            self.alertName = "ClientQuestionnaire";
            self.visible(false);

            // implement alert interface
            self.Init = function () { };

            // implement alert interface
            self.redirectAfterResponseAlert = function () {
                // trading bonus or not deposit required - send to main
                if (customer.prop.customerType === eCustomerType.TradingBonus || Dictionary.GetItem('preDepositRequired') !== "1") {
                    self.goToTradingView();
                    return;
                } else {
                    self.goToDepositView();
                    return;
                }
            };

            // public this manager main entry point
            self.popAlert = function () {
                var buttonProperties = self.buttonProperties,
                    translatedMessages = [],
                    i,
                    len,
                    failedAwareCallback = function () {
                        if (!window.require) {
                            throw new Error("KYC: logic error: compliance dal must be called after require is loaded");
                        }

                        self.visible(false);
                        dal.postCustomerFailedAware(function (responseObj) {
                            if (!responseObj || (responseObj.status === 1 && responseObj.result === true)) {
                                statesManager.States.KycStatus(eKYCStatus.FailedAware);
                                self.defer.resolve();
                            }
                        });

                    };

                // create buttons

                self.buttons.removeAll();

                // 1. im aware button
                self.buttons.push(buttonProperties(
                    Dictionary.GetItem(alertsContents.buttons[0]),
                    function () {
                        failedAwareCallback();
                        $statesManager.States.KycStatus(eKYCStatus.FailedAware);
                    })
                );

                // 2. cancel button
                self.buttons.push(buttonProperties(
                    Dictionary.GetItem(alertsContents.buttons[1]),
                    function () {

                        if (Dictionary.GetItem('preDepositRequired', 'application_configuration') !== "1") {
                            self.visible(false);
                        } else {
                            self.visible(false);
                            popUpManager.ClosePopup();
                        }
                        self.defer.resolve();
                    })
                );


                for (i = 0, len = alertsContents.messages.length; i < len; i++) {
                    translatedMessages.push(Dictionary.GetItem(alertsContents.messages[i]));
                }

                // parameters : alertType, title, body, messages, properties, withoutLineBrakes
                AlertsManager.UpdateAlert(
                    AlertTypes.ClientQuestionnaire,
                    Dictionary.GetItem(alertsContents.title),
                    undefined, // eslint-disable-line
                    translatedMessages
                );


                // show the alert
                AlertsManager.PopAlert(AlertTypes.ClientQuestionnaire);

                return self.defer.promise;
            };

            // implement alert base interface
            self.GetAlert = self;

            return self;
        };

        return QuestionnaireValidationAlert;
    }
);
