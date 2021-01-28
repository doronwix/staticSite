define('configuration/DealSlipsConfiguration', 
    [
        'require',
        'knockout'
    ],
    function EnableTradingConfiguration(require) {
        var ko = require('knockout');
        var components = [];

        function registerComponents(configuration) {
            var loadRevised = configuration['fx-revised-deal-slips'],
                dealComponents = [
                    {
                        name: 'fx-component-transaction-switcher',
                        vm: 'deviceviewmodels/TransactionSwitcherViewModel',
                        template: 'text!partial-views/web-deals-transactionswitcher.html'
                    },
                    {
                        name: 'fx-component-deal-tools',
                        vm: 'deviceviewmodels/Deals/DealToolsViewModel',
                        template: 'text!partial-views/web-deals-dealtools.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!deal-slip',
                            'helpers/CustomKOBindings/SpinnerFieldBinding'],
                        name: 'fx-component-new-deal-slip',
                        vm: 'deviceviewmodels/Deals/NewDealViewModel',
                        template: 'text!partial-views/web-deals-newdeal.html',
                    },
                    {
                        deps: ['modules/ComponentStyle!deal-slip',
                            'helpers/CustomKOBindings/SpinnerFieldBinding'],
                        name: 'fx-component-new-limit',
                        vm: 'deviceviewmodels/Deals/NewLimitViewModel',
                        template: 'text!partial-views/web-deals-newlimit.html',
                    }, 
                    {
                        deps: ['modules/ComponentStyle!deal-slip',
                            'LoadDictionaryContent!tooltipsStaticResource'],
                        name: 'fx-component-close-deal',
                        vm: 'deviceviewmodels/Deals/CloseDealViewModel',
                        template: 'text!partial-views/web-deals-closedeal.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!deal-slip',
                            'helpers/CustomKOBindings/SpinnerFieldBinding'],
                        name: 'fx-component-edit-closing-limit',
                        vm: 'deviceviewmodels/Deals/EditClosingLimitViewModel' ,
                        template: 'text!partial-views/web-deals-editclosinglimit.html' 
                    },
                    {
                        deps: ['modules/ComponentStyle!deal-slip',
                            'LoadDictionaryContent!deals_EditLimit',
                            'helpers/CustomKOBindings/SpinnerFieldBinding'],
                        name: 'fx-component-edit-limit',
                        vm: 'deviceviewmodels/Deals/EditLimitViewModel',
                        template: 'text!partial-views/web-deals-editlimit.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!deal-slip',
                            'LoadDictionaryContent!deals_newlimit'],
                        name: 'fx-component-new-pricealert',
                        vm: 'viewmodels/NewPriceAlertViewModel',
                        template: 'text!partial-views/web-limits-newpricealert.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                        name: 'fx-component-market-info-tool',
                        vm: 'deviceviewmodels/MarketInfoToolViewModel',
                        template: 'text!partial-views/web-deals-dealmarketinfotool.html',
                    },
                    {
                        deps: ['LoadDictionaryContent!deals_DealSignalsTool'],
                        name: 'fx-component-signals-tool',
                        vm: 'deviceviewmodels/Signals/SignalsToolViewModel',
                        template: 'text!partial-views/web-deals-dealsignalstool.html',
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
                        name: 'fx-component-tile-transaction-switcher',
                        vm: 'deviceviewmodels/TileTransactionSwitcherViewModel',
                        template: 'text!webHtml/statichtml/TileTransactionSwitcher.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!chart_station'],
                        name: 'fx-component-tiled-layout',
                        vm: 'deviceviewmodels/TileLayoutViewModel',
                        template: 'text!webHtml/statichtml/TileLayout.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!tooltipsStaticResource'],
                        name: 'fx-component-open-deals-grid',
                        vm: 'deviceviewmodels/OpenDealsViewModel',
                        template: 'text!partial-views/web-deals-opendeals.html',
                    }
                ],
                revisedDealComponents = [
                    {
                        deps: ['LoadDictionaryContent!dialogsTitles'],
                        name: 'fx-component-transaction-switcher',
                        vm: 'deviceviewmodels/TransactionSwitcherViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/transaction-switcher.html'
                    },
                    {
                        name: 'fx-component-deal-tools',
                        deps: ['LoadDictionaryContent!deals_DealTools'],
                        vm: 'deviceviewmodels/Deals/Revised/DealToolsViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/deal-tools.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!revised-slips',
                            'helpers/CustomKOBindings/SpinnerFieldBinding',
                            'LoadDictionaryContent!deals_NewDeal',
                            'LoadDictionaryContent!deals_Notes'],
                        name: 'fx-component-new-deal-slip',
                        vm: 'deviceviewmodels/Deals/Revised/NewDealViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/new-deal.html',
                    },
                    {
                        deps: ['modules/ComponentStyle!revised-slips',
                            'helpers/CustomKOBindings/SpinnerFieldBinding',
                            'LoadDictionaryContent!deals_NewLimit',
                            'LoadDictionaryContent!deals_Notes'],
                        name: 'fx-component-new-limit',
                        vm: 'deviceviewmodels/Deals/Revised/NewLimitViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/new-limit.html',
                    }, 
                    {
                        deps: ['modules/ComponentStyle!revised-slips',
                            'LoadDictionaryContent!tooltipsStaticResource',
                            'LoadDictionaryContent!deals_CloseDeal'],
                        name: 'fx-component-close-deal',
                        vm: 'deviceviewmodels/Deals/Revised/CloseDealViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/close-deal.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!revised-slips',
                            'helpers/CustomKOBindings/SpinnerFieldBinding',
                            'LoadDictionaryContent!deals_EditClosingLimit',
                            'LoadDictionaryContent!deals_CloseDeal'],
                        name: 'fx-component-edit-closing-limit',
                        vm: 'deviceviewmodels/Deals/Revised/EditClosingLimitViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/edit-closinglimit.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!revised-slips',
                            'LoadDictionaryContent!deals_EditLimit',
                            'helpers/CustomKOBindings/SpinnerFieldBinding'],
                        name: 'fx-component-edit-limit',
                        vm: 'deviceviewmodels/Deals/Revised/EditLimitViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/edit-limit.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!revised-slips',
                            'LoadDictionaryContent!limits_NewPriceAlert'],
                        name: 'fx-component-new-pricealert',
                        vm: 'deviceviewmodels/Deals/Revised/NewPriceAlertViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/new-pricealert.html'
                    },
                    {
                        name: 'fx-component-dynamic-title-slip',
                        vm: 'deviceviewmodels/Deals/DynamicTitleSlip',
                        template: 'text!webHtml/statichtml/deals/dynamic-title-slip.html'
                    },
                    {
                        name: 'fx-component-slip-toggle',
                        vm: 'deviceviewmodels/Deals/SlipToggleViewModel',
                        template: 'text!webHtml/statichtml/deals/slip-toggle.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                        name: 'fx-component-market-info-tool',
                        vm: 'deviceviewmodels/MarketInfoToolViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/marketinfo-tool.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                        name: 'fx-component-market-info-summary',
                        vm: 'deviceviewmodels/Deals/MarketInfoSummaryViewModel',
                        template: 'text!webHtml/statichtml/deals/marketinfo-summary.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!deals_DealSignalsTool'],
                        name: 'fx-component-signals-tool',
                        vm: 'deviceviewmodels/Signals/SignalsToolViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/signals-tool.html',
                    },
                    {
                        deps: ['LoadDictionaryContent!deals_Notes'],
                        name: 'fx-component-deal-note',
                        vm: 'deviceviewmodels/Deals/DealNoteViewModel',
                        template: 'text!webHtml/statichtml/deals/deal-note.html',
                    },
                    {
                        name: 'fx-instrument-notavailable',
                        vm: 'viewmodels/InstrumentNotAvailableViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/instrument-notavailable.html'
                    }, 
                    {
                        name: 'fx-component-transaction-switchwrap',
                        template: 'text!webHtml/statichtml/deals/revised/transaction-switchwrap.html'
                    },
                    {
                        deps: ['modules/ComponentStyle!revised-chartstation'],
                        name: 'fx-component-main-chart',
                        vm: 'deviceviewmodels/MainChartViewModel',
                        template: 'text!webHtml/statichtml/Chart/revised/main-chart.html'
                    }, 
                    {
                        name: 'fx-component-tile-transaction-switcher',
                        vm: 'deviceviewmodels/TileTransactionSwitcherViewModel',
                        template: 'text!webHtml/statichtml/deals/revised/tile-transaction-switcher.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!chart_station'],
                        name: 'fx-component-tiled-layout',
                        vm: 'deviceviewmodels/TileLayoutViewModel',
                        template: 'text!webHtml/statichtml/Chart/revised/tiled-layout.html'
                    },
                    {
                        deps: ['LoadDictionaryContent!tooltipsStaticResource'],
                        name: 'fx-component-open-deals-grid',
                        vm: 'deviceviewmodels/OpenDealsViewModel',
                        template: 'text!partial-views/web-deals-opendeals.html',
                    }
                ];

            components = loadRevised ? revisedDealComponents : dealComponents;

            for (var i = 0; i < components.length; i++) {
                registerComponent(components[i]);
            }
        }

        function registerComponentByName(cName) {
            for (var i = 0; i < components.length; i++) {
                if (components[i].name == cName) {
                    registerComponent(components[i]);
                    break;
                }
            }
        }

        function registerComponent(config) {
            var component = {};

            if (config.hasOwnProperty('deps')) {
                component.deps = config.deps;
            } 

            if (config.hasOwnProperty('vm')) {
                component.viewModel = { require: config.vm };
            } 

            if (config.hasOwnProperty('template')) {
                component.template = { require: config.template };
            } else if (config.hasOwnProperty('element')) {
                component.template = { element: config.element };
            }

            ko.components.register(config.name, component);
        }

        function unRegisterComponents() {
            for (var i = 0; i < components.length; i++) {
                ko.components.unregister(components[i].name);
            }
        }

        return {
            RegisterComponent: registerComponent,
            RegisterComponentByName: registerComponentByName,
            RegisterComponents: registerComponents,
            UnRegisterComponents: unRegisterComponents
        };
    }
);