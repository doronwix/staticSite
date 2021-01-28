define(
    'devicecustommodules/SeamlessPermissionsModule',
    [
        'require',
        'customEnums/alertenums',
        'handlers/general',
        'Dictionary',
        'viewmodels/SeamlessPermissionsBase',
        'customEnums/ViewsEnums'
    ],
    function SeamlessPermissionsModuleDef(require) {
        var Dictionary = require('Dictionary'),
            general = require('handlers/general'),
            SeamlessPermissionsBase = require('viewmodels/SeamlessPermissionsBase');

        var SeamlessPermissionsModule = general.extendClass(SeamlessPermissionsBase, function SeamlessPermissionsModuleClass() {
            var parent = this.parent,
                allowedForms = [eForms.Deals, eForms.Statement, eForms.ActivityLog, eForms.Tutorials, eForms.EducationalTutorials, eForms.AdvinionChart, eForms.TransactionsReport],
                allowedDemoForms = [];

            var restrictedActions = [
                'logout',
                'newDeal',
                'newLimit',
                'signals',
                'addFavorite',
                'accountNumber'
            ];

            var restrictedDemoActions = [
                'accountNumber',
                'signals',
                'logout'
            ];

            var visibleRestrictedForms = [eForms.Tutorials, eForms.EducationalTutorials];

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
                    onClose: function () {
                        parent.RedirectToAllowedForm(allowedForms, allowedDemoForms, visibleRestrictedForms);
                    },
                    okButtonCaption: Dictionary.GetItem('RegisterForFree'),
                    okButtonCallback: function () {
                        parent.RegisterLeadType(formId, actionName, viewArgs);
                    }
                };

                require(['devicemanagers/AlertsManager'], function (alertsManager) {
                    alertsManager.UpdateAlert(AlertTypes.GeneralOkAlert,
                        Dictionary.GetItem('PleaseNote'),
                        message,
                        null,
                        buttonsProperties);

                    alertsManager.PopAlert(AlertTypes.GeneralOkAlert);
                });
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