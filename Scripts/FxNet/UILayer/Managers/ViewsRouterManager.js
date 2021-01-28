define(
    'managers/ViewsRouterManager',
    [
        "require",
        'payments/ComplianceBeforeDeposit',
        "initdatamanagers/Customer"
    ],
    function ViewsRouterManager(require) {
        var ComplianceBeforeDeposit = require('payments/ComplianceBeforeDeposit'),
            Customer = require("initdatamanagers/Customer");

        var getFormToRedirect = function (formId, viewArgs) {

            var redirectToFormType = formId;

            switch (formId) {
                case eForms.Deposit:
                    // is regulated 

                    if (ComplianceBeforeDeposit.showMifidPopupBeforeDeposit() ||
                        ComplianceBeforeDeposit.isMoveToCddFullNoPopupBeforeDeposit()) {
                        redirectToFormType = eForms.ClientQuestionnaire;
                        viewArgs = { from: { form: eForms.Deposit, viewArgs: viewArgs } };
                        break;
                    }

                    redirectToFormType = eForms.Deposit;
                    break;

                case eForms.UploadDocuments:
                    if (Customer.prop.isDemo) {
                        redirectToFormType = Customer.prop.mainPage;
                    }
                    break;
            }

            return { viewType: redirectToFormType, viewArgs: viewArgs };
        };

        return {
            GetFormToRedirect: getFormToRedirect
        };
    }
);