define(
    "viewmodels/SeamlessPermissionsBase",
    [
        "require",
        'handlers/general',
        "initdatamanagers/Customer",
        "Dictionary"
    ],
    function (require) {
        var Customer = require("initdatamanagers/Customer"),
            general = require('handlers/general'),
            Dictionary = require("Dictionary");

        var SeamlessPermissionsBase = function () {

            function checkSeamless() {
                return Customer.prop.isSeamless === true;
            }


            function registerLeadType(formId, actionName, args) {
                var from = '';

                if (formId && formId === eForms.Deposit) {
                    from = "&" + registerParams.traderFrom + "=" + eFormActions.deposit;
                }

                if (!general.isNullOrUndefined(actionName)) {
                    if (actionName.toLowerCase() === eFormActions.newDeal.toLowerCase()) {
                        from = "&" + registerParams.traderFrom + "=" + eFormActions.newDeal;
                    } else if (actionName.toLowerCase() === eFormActions.newLimit.toLowerCase()) {
                        from = "&" + registerParams.traderFrom + "=" + eFormActions.newLimit;
                    }
                }
               
                if (args && args.register) {
                    from += '&' + args.register;
                }

                require(['managers/viewsmanager'], function ($viewsManager) {
                    window.location.href = Dictionary.GetItem("SeamlessRegisterLink") + "&saprocess=&trader_viewid=" + $viewsManager.Activeform().type + from;
                })
            }

            function isFormRestricted(eForm, allowedForms, allowedDemoForms) {
                if (!checkSeamless())
                    return false;
                if (!Customer.prop.isDemo)
                    return allowedForms.indexOf(eForm) < 0;
                else
                    return allowedForms.indexOf(eForm) < 0 && allowedDemoForms.indexOf(eForm) < 0; 
            }

            function isFormVisibleRestricted(eForm, visibleRestrictedForms) {
                if (!checkSeamless())
                    return false;
                return visibleRestrictedForms.indexOf(eForm) !== -1; 
            }

            function isActionRestricted(actionName, restrictedActions, restrictedDemoActions) {
                if (!checkSeamless())
                    return false;
                if (Customer.prop.isDemo === true)
                    return restrictedDemoActions.indexOf(actionName) !== -1;
                return restrictedActions.indexOf(actionName) !== -1;
            }

            function getMessage(formId) {
                var message;
                switch (formId) {
                    case eForms.Deposit:
                        message = Dictionary.GetItem('SeamlessRegisterDeposit');
                        break;
                    case eForms.Withdrawal:
                        message = Dictionary.GetItem('SeamlessRegisterWithdrawal');
                        break;
                    case eForms.ClientQuestionnaire:
                        message = Dictionary.GetItem('SeamlessRegisterQuestionnaire');
                        break;
                    default:
                        message = Dictionary.GetItem('SeamlessRegister');
                }
                return message;
            }

            function redirectToAllowedForm(allowedForms, allowedDemoForms, visibleRestrictedForms) {
                var eForm = $viewModelsManager.VManager.Activeform().type;
                require(['managers/viewsmanager'], function ($viewsManager) {
                    if (isFormRestricted(eForm, allowedForms, allowedDemoForms) || isFormVisibleRestricted(eForm, visibleRestrictedForms))
                        $viewsManager.SwitchViewVisible(Customer.prop.mainPage);
                });
            }

            return {
                CheckSeamless: checkSeamless,
                IsFormRestricted: isFormRestricted,
                IsActionRestricted: isActionRestricted,
                RegisterLeadType: registerLeadType,
                GetMessage: getMessage,
                IsFormVisibleRestricted: isFormVisibleRestricted,
                RedirectToAllowedForm: redirectToAllowedForm
            };
        };
        return SeamlessPermissionsBase; 
    }
);