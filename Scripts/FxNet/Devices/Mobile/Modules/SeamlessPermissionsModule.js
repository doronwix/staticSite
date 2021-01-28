define(
    'devicecustommodules/SeamlessPermissionsModule',
    [
        'require',
        'enums/alertenums',
        'handlers/general',
        'Dictionary',
        'viewmodels/SeamlessPermissionsBase',
        'customEnums/ViewsEnums'
    ],
    function SeamlessPermissionsModuleDef(require) {
        var general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            SeamlessPermissionsBase = require('viewmodels/SeamlessPermissionsBase');

        var SeamlessPermissionsModule = general.extendClass(SeamlessPermissionsBase, function SeamlessPermissionsModuleClass() {
            var parent = this.parent,
                allowedForms = [eForms.Quotes, eForms.OpenDeals, eForms.Limits, eForms.ClosedDeals, eForms.ClosedDealsFilter, eForms.Balance, eForms.Wallet, eForms.NetExposure, eForms.InternalContactUs, eForms.Menu, eForms.Charts, eForms.EconomicCalendar, eForms.EconomicCalendarFilter, eForms.Transaction, eForms.EducationalTutorials, eForms.UserFlowMap],
                allowedDemoForms = [eForms.OpenDeals, eForms.Limits, eForms.ClosedDeals, eForms.ClosedDealDetails, eForms.EditClosingLimit, eForms.EditLimit, eForms.CloseDeal, eForms.ClosedDealsFilter, eForms.ContractRollover, eForms.AccountCardRecords, eForms.CashBack, eForms.Balance];

            var restrictedActions = [
                'newDeal',
                'newLimit',
                'signals',
                'logout',
                'addFavorite'
            ];

            var restrictedDemoActions = [
                'signals',
                'logout'
            ];

            var visibleRestrictedForms = [eForms.EducationalTutorials];

            function isFormVisibleRestricted(eForm) {
                return parent.IsFormVisibleRestricted(eForm, visibleRestrictedForms);
            }

            function isFormRestricted(eForm) {
                return parent.IsFormRestricted(eForm, allowedForms, allowedDemoForms);
            }

            function isActionRestricted(actionName) {
                return parent.IsActionRestricted(actionName, restrictedActions, restrictedDemoActions);
            }

            function popAlert(formId, actionName, viewArgs) {
                var message = parent.GetMessage(formId);

                var buttonsProperties = {
                    cancelButtonCallback: function () {
                        parent.RedirectToAllowedForm(allowedForms, allowedDemoForms, visibleRestrictedForms);
                    },
                    okButtonCaption: Dictionary.GetItem('RegisterForFree'),
                    okButtonCallback: function () {
                        parent.RegisterLeadType(formId, actionName, viewArgs);
                    }
                };

                require(['devicemanagers/AlertsManager'], function (alertsManager) {
                    alertsManager.UpdateAlert(AlertTypes.GeneralOkCancelAlert,
                        Dictionary.GetItem('PleaseNote'),
                        message,
                        null,
                        buttonsProperties);

                    alertsManager.PopAlert(AlertTypes.GeneralOkCancelAlert);
                })
            }

            return {
                CheckSeamless: parent.CheckSeamless,
                PopAlert: popAlert,
                IsFormRestricted: isFormRestricted,
                IsActionRestricted: isActionRestricted,
                RegisterLeadType: parent.RegisterLeadType,
                IsFormVisibleRestricted: isFormVisibleRestricted
            };
        });

        return new SeamlessPermissionsModule();
    }
);