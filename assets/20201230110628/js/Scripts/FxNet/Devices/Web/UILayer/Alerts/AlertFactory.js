define(
    'devicealerts/AlertFactory',
    [
        'require',
        'handlers/general',
        'devicealerts/ExitAlert',
        'devicealerts/BonusAlert',
        'devicealerts/ServerResponseAlert',
        'devicealerts/CloseDealConfirmationAlert',
        'devicealerts/MaxIdleTimeAlertWrapper',
        'devicealerts/DoubleLoginAlertWrapper',
        'devicealerts/MinEquityAlertWrapper',
        'devicealerts/GeneralOkCancelAlert',
        'devicealerts/GeneralOkAlert',
        'devicealerts/serverevents/ClientStateAlertExposureAlert',
        'devicealerts/serverevents/ClientStateAlertExposureCoverageAlert',
        'devicealerts/serverevents/ClientStateAlertSystemMode',
        'devicealerts/serverevents/ClientStateAlertApplicationClosing',
        'devicealerts/serverevents/ClientStateAlertApplicationShutDown',
        'devicealerts/serverevents/PortfolioAlertIsReal',
        'devicealerts/serverevents/PortfolioAlertIsDemo',
        'devicealerts/serverevents/PortfolioAlertIsActive',
        'devicealerts/serverevents/PortfolioAlertKycStatus',
        'alerts/QuestionnaireValidationAlert',
        'devicealerts/CddQuestionnaireAlert',
        'devicealerts/SignalsDisclaimerAlert',
        'devicealerts/SimpleClientAlert',
        'alerts/KnowledgeQuestionnaireAlert',
        'devicealerts/GeneralCancelableAlert',
        'alerts/DealsClosedServerResponseAlert',
        'alerts/DealAddServerResponseAlert',
        'alerts/LimitsServerResponseAlert',
        'alerts/RemoveCreditCardConfirmationAlert',
        'alerts/MultipleDealsClosedConfirmation',
        'devicealerts/DepositSuccessAlert',
        'devicealerts/ContactUsCTAAlert',
        'alerts/TradingConfirmationRetryAlert',
        'alerts/PriceAlertServerResponseAlert',
        'alerts/PriceAlertClosedServerResponseAlert',
        'devicealerts/RequestAccessAlert',
        'alerts/SessionEndedAlert'
    ],
    function AlertFactoryDef(require) {
        var general = require('handlers/general'),
            ExitAlert = require('devicealerts/ExitAlert'),
            BonusAlert = require('devicealerts/BonusAlert'),
            ServerResponseAlert = require('devicealerts/ServerResponseAlert'),
            CloseDealConfirmaionAlert = require('devicealerts/CloseDealConfirmationAlert'),
            MaxIdleTimeAlertWrapper = require('devicealerts/MaxIdleTimeAlertWrapper'),
            DoubleLoginAlertWrapper = require('devicealerts/DoubleLoginAlertWrapper'),
            MinEquityAlertWrapper = require('devicealerts/MinEquityAlertWrapper'),
            GeneralOkCancelAlert = require('devicealerts/GeneralOkCancelAlert'),
            GeneralOkAlert = require('devicealerts/GeneralOkAlert'),
            ClientStateAlertExposureAlert = require('devicealerts/serverevents/ClientStateAlertExposureAlert'),
            ClientStateAlertExposureCoverageAlert = require('devicealerts/serverevents/ClientStateAlertExposureCoverageAlert'),
            ClientStateAlertSystemMode = require('devicealerts/serverevents/ClientStateAlertSystemMode'),
            ClientStateAlertApplicationClosing = require('devicealerts/serverevents/ClientStateAlertApplicationClosing'),
            ClientStateAlertApplicationShutDown = require('devicealerts/serverevents/ClientStateAlertApplicationShutDown'),
            PortfolioAlertIsReal = require('devicealerts/serverevents/PortfolioAlertIsReal'),
            PortfolioAlertIsDemo = require('devicealerts/serverevents/PortfolioAlertIsDemo'),
            PortfolioAlertIsActive = require('devicealerts/serverevents/PortfolioAlertIsActive'),
            PortfolioAlertKycStatus = require('devicealerts/serverevents/PortfolioAlertKycStatus'),
            QuestionnaireValidationAlert = require('alerts/QuestionnaireValidationAlert'),
            CddQuestionnaireAlert = require('devicealerts/CddQuestionnaireAlert'),
            SignalsDisclaimerAlert = require('devicealerts/SignalsDisclaimerAlert'),
            SimpleClientAlert = require('devicealerts/SimpleClientAlert'),
            KnowledgeQuestionnaireAlert = require('alerts/KnowledgeQuestionnaireAlert'),
            GeneralCancelableAlert = require('devicealerts/GeneralCancelableAlert'),
            DealsClosedServerResponseAlert = require('alerts/DealsClosedServerResponseAlert'),
            DealAddServerResponseAlert = require('alerts/DealAddServerResponseAlert'),
            LimitsServerResponseAlert = require('alerts/LimitsServerResponseAlert'),
            PriceAlertServerResponseAlert = require('alerts/PriceAlertServerResponseAlert'),
            RemoveCreditCardConfirmationAlert = require('alerts/RemoveCreditCardConfirmationAlert'),
            MultipleDealsClosedConfirmation = require('alerts/MultipleDealsClosedConfirmation'),
            DepositSuccessAlert = require('devicealerts/DepositSuccessAlert'),
            ContactUsCTAAlert = require('devicealerts/ContactUsCTAAlert'),
            TradingConfirmationRetryAlert = require('alerts/TradingConfirmationRetryAlert'),
            PriceAlertClosedServerResponseAlert = require('alerts/PriceAlertClosedServerResponseAlert'),
            RequestAccessAlert = require('devicealerts/RequestAccessAlert'),
            SessionEndedAlert = require('alerts/SessionEndedAlert');

        function AlertFactory() {
            //-------------- Alert Properties ----------------
            var createAlert = function (alertType) {
                var alert;

                switch (alertType) {
                    case AlertTypes.ExitAlert:
                        alert = new ExitAlert();
                        break;

                    case AlertTypes.BonusAlert:
                        alert = new BonusAlert();
                        break;

                    case AlertTypes.ServerResponseAlert:
                        alert = new ServerResponseAlert();
                        break;

                    case AlertTypes.SimpleClientAlert:
                        alert = new SimpleClientAlert();
                        break;

                    case AlertTypes.CloseDealAlert:
                        alert = new CloseDealConfirmaionAlert();
                        break;

                    case AlertTypes.MaxIdleTimeAlert:
                        alert = new MaxIdleTimeAlertWrapper();
                        break;

                    case AlertTypes.DoubleLoginAlert:
                        alert = new DoubleLoginAlertWrapper();
                        break;

                    case AlertTypes.MinEquityAlert:
                        alert = new MinEquityAlertWrapper();
                        break;

                    case AlertTypes.GeneralOkCancelAlert:
                        alert = new GeneralOkCancelAlert();
                        break;

                    case AlertTypes.GeneralOkAlert:
                    case AlertTypes.DepositConfirmationEmailSentAlert:
                    case AlertTypes.DepositQuestionnaireAlert:
                        alert = new GeneralOkAlert();
                        break;

                    //-------------------Post logins Client State Alerts      
                    case PostClientStatesLoginsAlerts.ExposureAlert:
                        alert = new ClientStateAlertExposureAlert();
                        break;

                    case PostClientStatesLoginsAlerts.ExposureCoverageAlert:
                        alert = new ClientStateAlertExposureCoverageAlert();
                        break;

                    case PostClientStatesLoginsAlerts.SystemMode:
                        alert = new ClientStateAlertSystemMode();
                        break;

                    case PostClientStatesLoginsAlerts.SystemModeApplicationClosing:
                        alert = new ClientStateAlertApplicationClosing();
                        break;

                    case PostClientStatesLoginsAlerts.SystemModeApplicationShutDown:
                        alert = new ClientStateAlertApplicationShutDown();
                        break;

                    case PostPortfoliosLoginsAlerts.IsActive:
                        alert = new PortfolioAlertIsActive();
                        break;

                    case PostPortfoliosLoginsAlerts.IsDemo:
                        alert = new PortfolioAlertIsDemo();
                        break;

                    case PostPortfoliosLoginsAlerts.IsReal:
                        alert = new PortfolioAlertIsReal();
                        break;

                    //-------------------Post logins Client State Alerts  

                    case PostPortfoliosLoginsAlerts.KycStatus:
                        alert = new PortfolioAlertKycStatus();
                        break;

                    //-----------------------------------------
                    case AlertTypes.ClientQuestionnaire:
                        alert = new QuestionnaireValidationAlert();
                        break;

                    //-----------------------------------------
                    case AlertTypes.ClientKnowledgeQuestionnaire:
                        alert = new KnowledgeQuestionnaireAlert();
                        break;

                    //-----------------------------------------
                    case AlertTypes.CddClientQuestionnaire:
                        alert = new CddQuestionnaireAlert();
                        break;

                    case AlertTypes.SignalsDisclaimerAlert:
                        alert = new SignalsDisclaimerAlert();
                        break;

                    case AlertTypes.GeneralCancelableAlert:
                        alert = new GeneralCancelableAlert();
                        break;

                    case AlertTypes.DealsClosedServerResponseAlert:
                        alert = new DealsClosedServerResponseAlert();
                        break;

                    case AlertTypes.DealAddServerResponseAlert:
                        alert = new DealAddServerResponseAlert();
                        break;

                    case AlertTypes.LimitsServerResponseAlert:
                        alert = new LimitsServerResponseAlert();
                        break;

                    case AlertTypes.RemoveCreditCardConfirmationAlert:
                        alert = new RemoveCreditCardConfirmationAlert();
                        break;

                    case AlertTypes.MultipleDealsClosedConfirmation:
                        alert = new MultipleDealsClosedConfirmation();
                        break;

                    case AlertTypes.DepositSuccessAlert:
                        alert = new DepositSuccessAlert();
                        break;

                    case AlertTypes.ContactUsCTAAlert:
                        alert = new ContactUsCTAAlert();
                        break;

                    case AlertTypes.TradingConfirmationRetryAlert:
                        alert = new TradingConfirmationRetryAlert();
                        break;

                    case AlertTypes.MultiplePriceAlertsClosedConfirmation:
                        alert = new MultipleDealsClosedConfirmation();
                        break;

                    case AlertTypes.PriceAlertClosedServerResponseAlert:
                        alert = new PriceAlertClosedServerResponseAlert();
                        break;

                    case AlertTypes.PriceAlertServerResponseAlert:
                        alert = new PriceAlertServerResponseAlert();
                        break;

                    case AlertTypes.RequestAccessVideoLessonsAlert:
                        alert = new RequestAccessAlert();
                        break;

                    case AlertTypes.RequestAccessTutorialsAlert:
                        alert = new RequestAccessAlert();
                        break;

                    case AlertTypes.SessionEndedAlert:
                        alert = new SessionEndedAlert();
                        break;

                    case AlertTypes.CreditCardNotApprovedAlert:
                        alert = new GeneralOkCancelAlert();
                        break;
                }

                if (alert) {
                    alert.Init();
                    alert = alert.GetAlert;
                }

                return alert;
            };

            var setAlertProperties = function (alert, alertType, title, body, messages, properties, withoutLineBrakes) {
                alert.messages.removeAll();

                if (title) {
                    alert.title(title);
                }
                if (title === null) {
                    alert.setDefaultTitle();
                }

                if (body) {
                    try {
                        if (general.isArrayType(body)) {
                            for (var i = 0; i < body.length; i++) {
                                body[i] = applyLineBreaks(body[i], withoutLineBrakes);

                            }
                        }
                        else {
                            // is string
                            body = applyLineBreaks(body, withoutLineBrakes);
                        }
                    }
                    catch (e) {
                        // empty
                    }

                    alert.body(body);
                }

                if (messages) {
                    while (messages.length > 0) {
                        var msg = messages.shift();
                        msg = applyLineBreaks(msg, withoutLineBrakes);

                        alert.messages.push(msg);
                    }
                }

                if (properties) {
                    alert.properties = properties;
                }
                else {
                    alert.properties = {};
                }

                return alert;
            };

            var applyLineBreaks = function (str, withoutLineBrakesReplacer) {
                if (withoutLineBrakesReplacer) {
                    return str;
                }

                return str.replace(/\\r\\n|\\n|\\r/gm, '<br />').replace(/(\r\n|\n|\r)/gm, '<br />'); // removes all 3 types of line breaks;
            };

            return {
                CreateAlert: createAlert,
                UpdateAlert: setAlertProperties
            };
        }

        return AlertFactory;
    }
);
