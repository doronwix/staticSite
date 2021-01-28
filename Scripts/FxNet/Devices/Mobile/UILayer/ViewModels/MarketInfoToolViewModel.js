define(
    'deviceviewmodels/MarketInfoToolViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/CustomerProfileManager',
        'viewmodels/Deals/BaseMarketInfoToolViewModel',
        'configuration/initconfiguration'
    ],
    function MarketInfoToolDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            stateObject = require('StateObject!Transaction'),
            BaseMarketInfoToolViewModel = require('viewmodels/Deals/BaseMarketInfoToolViewModel'),
            sectionsConfig = require('configuration/initconfiguration').MarketInfoSectionsConfiguration;

        var MarketInfoToolViewModel = general.extendClass(BaseMarketInfoToolViewModel, function MarketInfoToolClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel
              
            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();
                initExpandableSections();
            }

            function setObservables() {
                data.expandHighLow = ko.observable();
            }

            function initExpandableSections() {
                var profileCustomer = customerProfileManager.ProfileCustomer();

                if (general.isNullOrUndefined(profileCustomer.tsArea) && general.isNullOrUndefined(profileCustomer.iiArea) && general.isNullOrUndefined(profileCustomer.hlArea) && general.isNullOrUndefined(profileCustomer.miArea)) {
                    setDefaultExpandable();
                } else {
                    setProfileExpandable(profileCustomer);
                }
            }

            function setDefaultExpandable() {
                var sectionsStatus = ['openTradingSentiments', 'openMarketInfo', 'openHighLow', 'openInstrumentInfo'];

                Object.keys(eMarketInfoSectionsProps).forEach(function (prop) {
                    data[sectionsStatus[eMarketInfoSectionsProps[prop]]] = sectionsConfig[prop];
                    updateProfile(prop, sectionsConfig[prop]);
                });
            }

            function setProfileExpandable(profileCustomer) {
                data.openTradingSentiments = !!profileCustomer.tsArea;
                data.openMarketInfo = !!profileCustomer.miArea;
                data.openHighLow = !!profileCustomer.hlArea;
                data.openInstrumentInfo = !!profileCustomer.iiArea;
            }

            function updateProfile(property, isExpand) {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                profileCustomer[property] = isExpand ? 1 : 0;

                customerProfileManager.ProfileCustomer(profileCustomer);
            }

            function dispatchEvent(isExpand, eventSectionName) {
                var pageName = stateObject.get('PageName');
                var eventExpand = isExpand ? eAccordionState.expand : eAccordionState.collapse;
                var eventPrefix = eMarketInfoPrefixEvent[pageName];
                var eventTemplate = "{0}-{1}-{2}";
                var eventName = String.format(eventTemplate, eventPrefix, eventExpand, eventSectionName);

                ko.postbox.publish(eventName);
            }

            function onExpandClick(property, isExpand, eventSectionName) {
                if (eventSectionName === eMarketInfoNameEvent.HighLow) {
                    data.expandHighLow(isExpand);
                }

                updateProfile(property, isExpand);
                dispatchEvent(isExpand, eventSectionName);
            }

            return {
                init: init,
                OnExpandClick: onExpandClick,
                dispose: parent.dispose,
                NewDealData: parent.NewDealData,
                ViewSentimentsButtonHandler: parent.ViewSentimentsButtonHandler
            };
        });

        var createViewModel = function () {
            var viewModel = new MarketInfoToolViewModel();

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