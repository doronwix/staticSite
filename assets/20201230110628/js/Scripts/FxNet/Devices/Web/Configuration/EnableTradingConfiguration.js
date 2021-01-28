define('configuration/EnableTradingConfiguration',
    [
        'require',
        'knockout',
        'Q',
        'customEnums/ViewsEnums',
        'generalmanagers/ErrorManager',
        'StateObject!DealsTabs',
        'configuration/DealSlipsConfiguration'
    ],
    function EnableTradingConfiguration(require) {
        var ko = require('knockout'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            state = require('StateObject!DealsTabs'),
            Q = require('Q'),
            dealSlipConfig = require('configuration/DealSlipsConfiguration'),
            stateKey = 'selectedTabView' + eViewTypes.vDealsTabs;

        var errorPreloadComponent = 'Error when preload component';

        var childrenComponentsConfig = {
            backOffice: {}
        };

        var componentsBackOfficeConfig = [
            {
                name: 'fx-component-new-deal-slip',
                vm: 'deviceviewmodels/BackOffice/NewDealSlipViewModel',
                template: 'text!webHtml/statichtml/backoffice/newdeal.html'
            },
            {
                name: 'fx-component-new-limit',
                deps: ['helpers/CustomKOBindings/SpinnerFieldBinding'],
                vm: 'deviceviewmodels/BackOffice/NewLimitViewModel',
                template: 'text!webHtml/statichtml/backoffice/new-limit.html'
            },
            {
                name: 'fx-component-close-deal',
                vm: 'deviceviewmodels/BackOffice/CloseDealViewModel',
                template: 'text!webHtml/statichtml/BackOffice/close-deal.html'
            },
            {
                name: 'fx-component-open-deals-grid',
                vm: 'deviceviewmodels/BackOffice/OpenDealsViewModel',
                template: 'text!webHtml/statichtml/BackOffice/opened-deals.html'
            },
            {
                name: 'fx-component-edit-limit',
                deps: ['helpers/CustomKOBindings/SpinnerFieldBinding'],
                vm: 'deviceviewmodels/BackOffice/EditLimitViewModel',
                template: 'text!webHtml/statichtml/BackOffice/edit-limit.html'
            },
            {
                name: 'fx-component-edit-closing-limit',
                deps: ['helpers/CustomKOBindings/SpinnerFieldBinding'],
                vm: 'deviceviewmodels/BackOffice/EditClosingLimitViewModel',
                template: 'text!webHtml/statichtml/BackOffice/edit-closing-limit.html'
            },
            {
                name: 'fx-component-transaction-switcher',
                deps: ['helpers/CustomKOBindings/SpinnerFieldBinding'],
                vm: 'deviceviewmodels/TransactionSwitcherViewModel',
                template: 'text!partial-views/web-deals-transactionswitcher.html'
            },
            {
                name: 'fx-component-tile-transaction-switcher',
                vm: 'deviceviewmodels/TileTransactionSwitcherViewModel',
                template: 'text!webHtml/statichtml/TileTransactionSwitcher.html'
            },
            {
                name: 'fx-component-new-pricealert',
                deps: ['LoadDictionaryContent!deals_newlimit'],
                vm: 'viewmodels/NewPriceAlertViewModel',
                template: 'text!partial-views/web-limits-newpricealert.html'
            },
            {
                name: 'fx-component-deal-tools',
                vm: 'deviceviewmodels/Deals/DealToolsViewModel',
                template: 'text!partial-views/web-deals-dealtools.html'
            },
            {
                name: 'fx-component-tile-transaction-switcher',
                vm: 'deviceviewmodels/TileTransactionSwitcherViewModel',
                template: 'text!webHtml/statichtml/TileTransactionSwitcher.html'
            },
            {
                name: 'fx-component-tiled-layout',
                vm: 'deviceviewmodels/TileLayoutViewModel',
                template: 'text!webHtml/statichtml/TileLayout.html'
            },
            {
                name: 'fx-instrument-notavailable',
                vm: 'viewmodels/InstrumentNotAvailableViewModel',
                template: 'text!webHtml/statichtml/instrument-notavailable.html'
            },
            {
                name: 'fx-component-transaction-switchwrap',
                template: 'text!webHtml/statichtml/deals/transaction-switchwrap.html'
            },
            {
                name: 'fx-component-main-chart',
                vm: 'deviceviewmodels/MainChartViewModel',
                template: 'text!webHtml/statichtml/Chart/MainChart.html'
            },
            {
                deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                name: 'fx-component-market-info-tool',
                vm: 'deviceviewmodels/MarketInfoToolViewModel',
                template: 'text!webHtml/statichtml/deals/revised/marketinfo-tool.html'
            }
        ];

        function registerComponents() {
            ko.components.register('fx-component-enable-trading', {
                viewModel: { require: 'deviceviewmodels/BackOffice/EnableTradingViewModel' },
                template: { require: 'text!webHtml/statichtml/backoffice/enable-trading.html' }
            });          
        }

        function loadComponent(componentName) {
            return Q.Promise(function (resolve, reject) {
                ko.components.get(componentName, function (component) {
                    if (!component) {
                        ErrorManager.onError(componentName, errorPreloadComponent, eErrorSeverity.medium);
                        reject();
                    }
                    resolve();
                })
            })
        }

        /**
         * returns a promise<void> that loads all components
         * */

        function registerComponentsOnEnable() {
            var componentsLoading = [];


            for (var i = 0; i < componentsBackOfficeConfig.length; i++) {
                var componentObj = componentsBackOfficeConfig[i];

                ko.components.unregister(componentObj.name);
                dealSlipConfig.RegisterComponent(componentObj);

                var childComponents = childrenComponentsConfig.backOffice[componentObj.name];

                if (childComponents && childComponents.length) {
                    childComponents.forEach(function (item) {
                        var cname = Object.keys(item)[0];

                        if (!ko.components.isRegistered(cname)) {
                            ko.components.register(cname, item[cname]);
                        }
                    });
                }

                componentsLoading.push(loadComponent(componentObj.name));
            }

            return Q.all(componentsLoading).then(function () {
                forceOpenedDealsRender();
            });
        }

        function registerComponentsOnDisable() {
            for (var i = 0; i < componentsBackOfficeConfig.length; i++) {
                var componentObj = componentsBackOfficeConfig[i];

                ko.components.unregister(componentObj.name);

                var childComponents = childrenComponentsConfig.backOffice[componentObj.name];

                if (childComponents && childComponents.length) {
                    childComponents.forEach(function (item) {
                        var cname = Object.keys(item)[0];

                        ko.components.unregister(cname);
                    });
                }

                dealSlipConfig.RegisterComponentByName(componentObj.name);
            }

            forceOpenedDealsRender();
        }

        function forceOpenedDealsRender() {
            var selectedTab,
                noTabSelected = 0;

            if (state.containsKey(stateKey)) {
                selectedTab = state.get(stateKey);

                if (selectedTab() === eViewTypes.vOpenDeals) {
                    selectedTab(noTabSelected);
                    selectedTab(eViewTypes.vOpenDeals);
                }
            }
        }

        return {
            RegisterComponents: registerComponents,
            RegisterComponentsOnEnable: registerComponentsOnEnable,
            RegisterComponentsOnDisable: registerComponentsOnDisable
        };
    }
);