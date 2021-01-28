define(
    'devicealerts/AlertFactory',
    [
        'require',
        'handlers/general',
        'devicealerts/ExitAlert',
        'devicealerts/BonusAlert',
        'devicealerts/CloseDealConfirmationAlert',
        'devicealerts/ClosePositionsConfirmation',
        'devicealerts/ServerResponseAlert',
        'devicealerts/SimpleClientAlert',
        'devicealerts/MaxIdleTimeAlertWrapper',
        'devicealerts/DoubleLoginAlertWrapper',
        'devicealerts/ExposureCoverageAlert',
        'devicealerts/MinEquityAlertWrapper',
        'devicealerts/GeneralOkCancelAlert',
        'devicealerts/GeneralOkAlert',
        'devicealerts/serverevents/ClientStateAlertExposureAlert',
        'devicealerts/serverevents/ClientStateAlertExposureCoverageAlert',
        'devicealerts/serverevents/ClientStateAlertSystemMode',
        'devicealerts/serverevents/ClientStateAlertApplicationClosing',
        'devicealerts/serverevents/PortfolioAlertAmlStatus',
        'devicealerts/serverevents/PortfolioAlertIsActive',
        'devicealerts/serverevents/PortfolioAlertIsDemo',
        'devicealerts/serverevents/PortfolioAlertIsReal',
        'devicealerts/serverevents/PortfolioAlertKycStatus',
        'devicealerts/serverevents/PortfolioAlertCddStatus',
        'alerts/QuestionnaireValidationAlert',
        'devicealerts/CddQuestionnaireAlert',
        'devicealerts/FingerprintLoginActivatedAlert',
        'devicealerts/ScanFingerprintLoginOptionConfirmationAlert',
        'devicealerts/AddFingerprintLoginOptionConfirmationAlert',
        'devicealerts/RemoveFingerprintLoginOptionConfirmationAlert',
        'alerts/MultipleDealsClosedConfirmation',
        'alerts/RemoveCreditCardConfirmationAlert',
        'alerts/LimitsServerResponseAlert',
        'alerts/DealAddServerResponseAlert',
        'alerts/DealsClosedServerResponseAlert',
        'devicealerts/GeneralCancelableAlert',
        'devicealerts/PopupClientQuestionnaireAlert',
        'alerts/KnowledgeQuestionnaireAlert',
        'devicealerts/DeviceNotSupportFingerprintAlert',
        'devicealerts/DepositSuccessAlert',
        'devicealerts/HelpAlert',
        'devicealerts/DepositConfirmationEmailSentAlert',
        'alerts/PriceAlertServerResponseAlert',
        'alerts/PriceAlertClosedServerResponseAlert',
        'devicealerts/IframeAlert',
        'alerts/SessionEndedAlert',
        'devicealerts/DepositConfirmationSignatureAlert'
    ],
    function AlertFactoryDef(require) {
        var ExitAlert = require('devicealerts/ExitAlert'),
            BonusAlert = require('devicealerts/BonusAlert'),
            CloseDealConfirmaionAlert = require('devicealerts/CloseDealConfirmationAlert'),
            ClosePositionsConfirmation = require('devicealerts/ClosePositionsConfirmation'),
            ServerResponseAlert = require('devicealerts/ServerResponseAlert'),
            SimpleClientAlert = require('devicealerts/SimpleClientAlert'),
            MaxIdleTimeAlertWrapper = require('devicealerts/MaxIdleTimeAlertWrapper'),
            DoubleLoginAlertWrapper = require('devicealerts/DoubleLoginAlertWrapper'),
            ExposureCoverageAlert = require('devicealerts/ExposureCoverageAlert'),
            MinEquityAlertWrapper = require('devicealerts/MinEquityAlertWrapper'),
            GeneralOkCancelAlert = require('devicealerts/GeneralOkCancelAlert'),
            GeneralOkAlert = require('devicealerts/GeneralOkAlert'),
            ClientStateAlertExposureAlert = require('devicealerts/serverevents/ClientStateAlertExposureAlert'),
            ClientStateAlertExposureCoverageAlert = require('devicealerts/serverevents/ClientStateAlertExposureCoverageAlert'),
            ClientStateAlertSystemMode = require('devicealerts/serverevents/ClientStateAlertSystemMode'),
            ClientStateAlertApplicationClosing = require('devicealerts/serverevents/ClientStateAlertApplicationClosing'),
            PortfolioAlertAmlStatus = require('devicealerts/serverevents/PortfolioAlertAmlStatus'),
            PortfolioAlertIsActive = require('devicealerts/serverevents/PortfolioAlertIsActive'),
            PortfolioAlertIsDemo = require('devicealerts/serverevents/PortfolioAlertIsDemo'),
            PortfolioAlertIsReal = require('devicealerts/serverevents/PortfolioAlertIsReal'),
            PortfolioAlertKycStatus = require('devicealerts/serverevents/PortfolioAlertKycStatus'),
            PortfolioAlertCddStatus = require('devicealerts/serverevents/PortfolioAlertCddStatus'),
            QuestionnaireValidationAlert = require('alerts/QuestionnaireValidationAlert'),
            CddQuestionnaireAlert = require('devicealerts/CddQuestionnaireAlert'),
            FingerprintLoginActivatedAlert = require('devicealerts/FingerprintLoginActivatedAlert'),
            ScanFingerprintLoginOptionConfirmationAlert = require('devicealerts/ScanFingerprintLoginOptionConfirmationAlert'),
            AddFingerprintLoginOptionConfirmationAlert = require('devicealerts/AddFingerprintLoginOptionConfirmationAlert'),
            RemoveFingerprintLoginOptionConfirmationAlert = require('devicealerts/RemoveFingerprintLoginOptionConfirmationAlert'),
            MultipleDealsClosedConfirmation = require('alerts/MultipleDealsClosedConfirmation'),
            RemoveCreditCardConfirmationAlert = require('alerts/RemoveCreditCardConfirmationAlert'),
            LimitsServerResponseAlert = require('alerts/LimitsServerResponseAlert'),
            PriceAlertServerResponseAlert = require('alerts/PriceAlertServerResponseAlert'),
            DealAddServerResponseAlert = require('alerts/DealAddServerResponseAlert'),
            DealsClosedServerResponseAlert = require('alerts/DealsClosedServerResponseAlert'),
            GeneralCancelableAlert = require('devicealerts/GeneralCancelableAlert'),
            PopupClientQuestionnaireAlert = require('devicealerts/PopupClientQuestionnaireAlert'),
            KnowledgeQuestionnaireAlert = require('alerts/KnowledgeQuestionnaireAlert'),
            DeviceNotSupportFingerprintAlert = require('devicealerts/DeviceNotSupportFingerprintAlert'),
            DepositSuccessAlert = require('devicealerts/DepositSuccessAlert'),
            HelpAlert = require('devicealerts/HelpAlert'),
            IframeAlert = require('devicealerts/IframeAlert'),
            DepositConfirmationEmailSentAlert = require('devicealerts/DepositConfirmationEmailSentAlert'),
            PriceAlertClosedServerResponseAlert = require('alerts/PriceAlertClosedServerResponseAlert'),
            SessionEndedAlert = require('alerts/SessionEndedAlert'),
            DepositConfirmationSignatureAlert = require('devicealerts/DepositConfirmationSignatureAlert');

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

                    case AlertTypes.CloseDealAlert:
                        alert = new CloseDealConfirmaionAlert();
                        break;

                    case AlertTypes.ClosePositionsConfirmation:
                        alert = new ClosePositionsConfirmation();
                        break;

                    case AlertTypes.ServerResponseAlert:
                        alert = new ServerResponseAlert();
                        break;

                    case AlertTypes.SimpleClientAlert:
                        alert = new SimpleClientAlert();
                        break;

                    case AlertTypes.MaxIdleTimeAlert:
                        alert = new MaxIdleTimeAlertWrapper();
                        break;

                    case AlertTypes.DoubleLoginAlert:
                        alert = new DoubleLoginAlertWrapper();
                        break;

                    case AlertTypes.ExposureCoverageAlert:
                        alert = new ExposureCoverageAlert();
                        break;

                    case AlertTypes.MinEquityAlert:
                        alert = new MinEquityAlertWrapper();
                        break;

                    case AlertTypes.GeneralOkCancelAlert:
                    case AlertTypes.DepositQuestionnaireAlert:
                        alert = new GeneralOkCancelAlert();
                        break;

                    case AlertTypes.GeneralOkAlert:
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

                    //-------------------Post logins Client State Alerts   
                    case PostPortfoliosLoginsAlerts.AmlStatus:
                        alert = new PortfolioAlertAmlStatus();
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

                    case PostPortfoliosLoginsAlerts.KycStatus:
                        alert = new PortfolioAlertKycStatus();
                        break;

                    case PostPortfoliosLoginsAlerts.CddStatus:
                        alert = new PortfolioAlertCddStatus();
                        break;

                    //-----------------------------------------
                    case AlertTypes.ClientQuestionnaire:
                        alert = new QuestionnaireValidationAlert();
                        break;

                    //-----------------------------------------
                    case AlertTypes.ClientKnowledgeQuestionnaire:
                        alert = new KnowledgeQuestionnaireAlert();
                        break;

                    case AlertTypes.CddClientQuestionnaire:
                        alert = new CddQuestionnaireAlert();
                        break;

                    case AlertTypes.PopupClientQuestionnaire:
                        alert = new PopupClientQuestionnaireAlert();
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

                    case AlertTypes.RemoveFingerprintLoginOptionConfirmationAlert:
                        alert = new RemoveFingerprintLoginOptionConfirmationAlert();
                        break;

                    case AlertTypes.AddFingerprintLoginOptionConfirmationAlert:
                        alert = new AddFingerprintLoginOptionConfirmationAlert();
                        break;

                    case AlertTypes.ScanFingerprintLoginOptionConfirmationAlert:
                        alert = new ScanFingerprintLoginOptionConfirmationAlert();
                        break;

                    case AlertTypes.FingerprintLoginActivatedAlert:
                        alert = new FingerprintLoginActivatedAlert();
                        break;

                    case AlertTypes.DeviceNotSupportFingerprintAlert:
                        alert = new DeviceNotSupportFingerprintAlert();
                        break;

                    case AlertTypes.DepositSuccessAlert:
                        alert = new DepositSuccessAlert();
                        break;

                    case AlertTypes.HelpAlert:
                        alert = new HelpAlert();
                        break;

                    case AlertTypes.DepositConfirmationEmailSentAlert:
                        alert = new DepositConfirmationEmailSentAlert();
                        break;

                    case AlertTypes.PriceAlertServerResponseAlert:
                        alert = new PriceAlertServerResponseAlert();
                        break;

                    case AlertTypes.MultiplePriceAlertsClosedConfirmation:
                        alert = new MultipleDealsClosedConfirmation();
                        break;

                    case AlertTypes.PriceAlertClosedServerResponseAlert:
                        alert = new PriceAlertClosedServerResponseAlert();
                        break;

                    case AlertTypes.IframeAlert:
                        alert = new IframeAlert();
                        break;

                    case AlertTypes.SessionEndedAlert:
                        alert = new SessionEndedAlert();
                        break;

                    case AlertTypes.DepositConfirmationSignatureAlert:
                        alert = new DepositConfirmationSignatureAlert();
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

            var setAlertProperties = function (alert, alertType, title, body, messages, properties) {
                alert.messages.removeAll();

                if (title) {
                    alert.title(title);
                }

                if (body || body === '') {
                    alert.body(body);
                }

                if (messages) {
                    while (messages.length > 0) {
                        alert.messages.push(messages.shift());
                    }
                }

                if (properties) {
                    alert.properties = properties;
                } else {
                    alert.properties = {};
                }

                return alert;
            };

            return {
                CreateAlert: createAlert,
                UpdateAlert: setAlertProperties
            };
        }

        return AlertFactory;
    }
);
