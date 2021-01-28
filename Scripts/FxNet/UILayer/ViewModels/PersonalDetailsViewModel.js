define(
    'viewmodels/PersonalDetailsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/StatesManager',
        'StateObject!Setting'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            customer = require('initdatamanagers/Customer'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            settingStateObject = require('StateObject!Setting'),
            statesManager = require('devicemanagers/StatesManager');

        function personalDetailsViewModel() {
            var isCollapsed = ko.observable(true),
                settingStateObjectUnsubscribe;

            var viewModel = {
                brokerID: ko.observable(''),
                contactFirstName: ko.observable(''),
                contactLastName: ko.observable(''),
                contactFullName: ko.observable(''),
                contactInitials: ko.observable(''),
                contactUserName: ko.observable(''),
                phone: ko.observable(''),
                mobile: ko.observable(''),
                country: ko.observable(''),
                expiryDate: ko.observable(''),
                isCDDRestricted: ko.observable(false),
                updateInfoVisible: statesManager.States.IsCddOrKycRequired,
                generalStatusColor: ko.observable(''),
                generalStatusName: ko.observable(''),
                generalStatusIcon: ko.observable(''),
                generalStatusClick: generalStatusClick,
                showCta: false
            };

            function init() {
                setObservables();
                setSubscribers();
                setComputables();

                if (!settingStateObject.get('AccountHubSetting')) {
                    settingStateObject.set('AccountHubSetting', null);
                }

                settingStateObjectUnsubscribe = settingStateObject.subscribe('AccountHubSetting', function (view) {
                    isCollapsed(view !== eViewTypes.vPersonalDetails);
                });

                isOpenCollapsed();

                customer
                    .GetCustomerDetails()
                    .then(function (response) {
                        var serverModel = JSONHelper.STR2JSON('PersonalDetailsViewModel:GetCustomerDetails', response);

                        viewModel.contactFirstName(checkUserNamesNotNull(serverModel.contactFirst));
                        viewModel.contactLastName(checkUserNamesNotNull(serverModel.contactLast));
                        viewModel.brokerID(serverModel.brokerID);
                        viewModel.contactFullName(viewModel.contactFirstName() + ' ' + viewModel.contactLastName());
                        viewModel.phone(serverModel.phone);
                        viewModel.mobile(serverModel.mobile);
                        viewModel.country('cntr_' + customer.prop.countryID);
                        viewModel.expiryDate(serverModel.expiryDate);
                        viewModel.contactInitials(viewModel.contactFirstName().charAt(0) + viewModel.contactLastName().charAt(0));
                        viewModel.contactUserName(customer.prop.userName);
                    })
                    .done();
            }

            function setObservables() {
                viewModel.isCDDRestricted(statesManager.States.IsCDDRestricted());
            }

            function setSubscribers() {
                statesManager.States.IsCDDRestricted.subscribe(function (newValue) {
                    viewModel.isCDDRestricted(newValue);
                });
            }

            function setComputables() {
                viewModel.hasFullName = ko.computed(function () {
                    return !general.isNullOrUndefined(viewModel.contactFullName()) && viewModel.contactFullName().length > 1;
                });

                viewModel.hasPhone = ko.computed(function () {
                    return !general.isNullOrUndefined(viewModel.phone()) && viewModel.phone().length > 4;
                });

                viewModel.hasMobile = ko.computed(function () {
                    return !general.isNullOrUndefined(viewModel.mobile()) && viewModel.mobile().length > 4;
                });
            }

            function checkUserNamesNotNull(name) {
                if (general.isNullOrUndefined(name)) {
                    return '';
                }

                else return name;
            }

            function isOpenCollapsed() {
                if (viewModelsManager.VManager.GetViewArgs(eViewTypes.vPersonalDetails) === eViewTypes.vPersonalDetails) {
                    isCollapsed(false);
                }
            }

            function collapsedToggle() {
                isCollapsed(!isCollapsed());
            }

            function goToUploaddocuments() {
                viewModelsManager.VManager.RedirectToForm(eForms.UploadDocuments);
            }

            function goToClientQuestionnaire() {
                viewModelsManager.VManager.RedirectToForm(eForms.ClientQuestionnaire);
            }

            function generalStatusClick() {
                ko.postbox.publish('action-source', 'StatusRow');
                viewModelsManager.VManager.SwitchViewVisible(eForms.UserFlowMap);
            }

            function dispose() {
                if (settingStateObjectUnsubscribe) {
                    settingStateObjectUnsubscribe();
                }
            }

            return {
                viewModel: viewModel,
                isOpenCollapsed: isOpenCollapsed,
                collapsedToggle: collapsedToggle,
                isCollapsed: isCollapsed,
                init: init,
                dispose: dispose,
                goToUploaddocuments: goToUploaddocuments,
                goToClientQuestionnaire: goToClientQuestionnaire
            }
        }

        var createViewModel = function () {
            var viewModel = new personalDetailsViewModel();
            viewModel.init();
            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
