define(
    [
        'require',
        'jquery',
        'knockout',
        'handlers/general',
        'handlers/Cookie',
        'handlers/Logger',
        'devicemanagers/ViewModelsManager',
        'configuration/PaymentsConfiguration',
        'configuration/DealSlipsConfiguration',
        'modules/systeminfo',
        'configuration/initconfiguration',
        'viewmodels/PrintExportViewModel',
        'helpers/customkobindings/KoCustomBindings',
        'devicehelpers/KoCustomBindings',
        'helpers/CustomKOBindings/PrintBinding',
        'trackingIntExt/TrackingData',
        'vendor/globalize',
        'global/UrlResolver',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            $ = require('jquery'),
            CookieHandler = require('handlers/Cookie'),
            Logger = require('handlers/Logger'),
            ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            PaymentsConfiguration = require('configuration/PaymentsConfiguration'),
            DealSlipsConfiguration = require('configuration/DealSlipsConfiguration'),
            systemInfo = require('modules/systeminfo'),
            trackingData = require('trackingIntExt/TrackingData'),
            Globalize = require('vendor/globalize'),
            urlResolver = require('global/UrlResolver');

        function PlugInConfiguration() {
            function bindKO(rootElement) {
                ko.options.deferUpdates = false;
                if (!general.isDefinedType(rootElement)) {
                    rootElement = window.document.body;
                }

                try {
                    ko.applyBindingsWithValidation(ViewModelsManager, rootElement, {
                        registerExtenders: true,
                        messagesOnModified: true,
                        insertMessages: false,
                        parseInputAttributes: true,
                        decorateInputElement: true,
                        messageTemplate: null,
                        errorElementClass: 'validationElement',
                    });
                } catch (ex) {
                    Logger.log('PlugInConfiguration.bindKO', ex.message, '', eErrorSeverity.warning);
                }
            }

            function adjustHtml() {
                //prevent spaces in user text
                $(document)
                    .off('keydown')
                    .on('keydown', function (event) {
                        var doPrevent = false;

                        if (event.keyCode === 8) {
                            var d = event.srcElement || event.target;

                            if (
                                (d.tagName.toUpperCase() === 'INPUT' &&
                                    (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD')) ||
                                d.tagName.toUpperCase() === 'TEXTAREA'
                            ) {
                                doPrevent = d.readOnly || d.disabled;
                            }
                        }

                        if (doPrevent) {
                            event.preventDefault();
                        }
                    });

                $(document).on(eAppEvents.formChangeEvent, function () {
                    $(document).scrollTop(0);
                    $(document).trigger(eAppEvents.formChangedEvent);
                });
            }

            function addPixel() {
                var links = CookieHandler.ReadCookie('LinksForPixel');

                if (links) {
                    var arrayLinks = links.split(',');
                    var im = new Image();

                    arrayLinks.forEach(function addLinksToImage(link) {
                        if (link != '') {
                            im.src = link;
                        }
                    });

                    CookieHandler.EraseCookie('LinksForPixel');
                }
            }

            function exposeUI() { }

            function updateScmmTrackingData() {
                if (trackingData) {
                    trackingData.updateScmmData();
                }
            }

            function registerComponents(configuration) {
                configuration = configuration || {};

                ko.components.register('fx-component-loader', {
                    viewModel: { require: 'viewmodels/common/ComponentLoader' },
                    template: { require: 'text!webHtml/statichtml/common/component-loader.html' },
                });

                ko.components.register('fx-instrument-price-alert', {
                    viewModel: { require: 'viewmodels/InstrumentPriceAlertViewModel' },
                    template: { require: 'text!webHtml/statichtml/instrument-price-alert.html' },
                });

                ko.components.register('fx-customer-activation', {
                    viewModel: { require: 'viewmodels/MissingCustomerInformationViewModel' },
                    template: { require: 'text!controllers/Customer/MissingInformation' },
                });

                ko.components.register('fx-open-question', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/question/open-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/open-question.html' },
                });

                ko.components.register('fx-phone-number-question', {
                    viewModel: { require: 'viewmodels/questionnaire/question/phone-number-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/phone-number-question.html' },
                });

                ko.components.register('fx-questions-wrapper', {
                    viewModel: { require: 'viewmodels/questionnaire/question/questions-wrapper' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/questions-wrapper.html' },
                });

                ko.components.register('fx-overridable-question', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/question/overridable-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/open-question.html' },
                });

                ko.components.register('fx-radio-question', {
                    viewModel: { require: 'viewmodels/questionnaire/question/radio-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/radio-question.html' },
                });

                ko.components.register('fx-select-question', {
                    viewModel: { require: 'viewmodels/questionnaire/question/select-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/select-question.html' },
                });

                ko.components.register('fx-radiolist-question', {
                    viewModel: { require: 'viewmodels/questionnaire/question/radio-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/radiolist-question.html' },
                });

                ko.components.register('fx-search-question', {
                    deps: ['helpers/CustomKOBindings/AutocompleteBinding'],
                    viewModel: { require: 'viewmodels/questionnaire/question/search-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/search-question.html' },
                });

                ko.components.register('fx-date-question', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/question/date-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/date-question.html' },
                });

                ko.components.register('fx-checkbox-question', {
                    viewModel: { require: 'viewmodels/questionnaire/question/checkbox-question' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/checkbox-question.html' },
                });

                ko.components.register('fx-questionnaire', {
                    viewModel: { require: 'viewmodels/questionnaire/question/questionnaire' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/questionnaire.html' },
                });

                ko.components.register('fx-tooltip', {
                    viewModel: { require: 'viewmodels/common/tool-tip' },
                    template: { require: 'text!webHtml/statichtml/common/tool-tip.html' },
                });

                ko.components.register('fx-question-validation-balloon', {
                    template: {
                        require: 'text!webHtml/statichtml/questionnaire/question/question-validation-balloon.html',
                    },
                });

                ko.components.register('fx-question-tooltip-balloon', {
                    viewModel: { require: 'viewmodels/questionnaire/question-tooltip-balloon' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/question/question-tooltip-balloon.html' },
                });

                ko.components.register('fx-progress-bar-a', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/progress-bar-a' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/progress-bar-a.html' },
                });

                ko.components.register('fx-progress-title', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/progress-title' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/progress-title-a.html' },
                });

                ko.components.register('fx-questionnaire-right-side', {
                    template: { require: 'text!webHtml/statichtml/questionnaire/questionnaire-right-side.html' },
                });

                ko.components.register('fx-client-questionnaire', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/client-questionnaire' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/client-questionnaire.html' },
                });

                ko.components.register('fx-welcome-client-questionnaire', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/welcome-client-questionnaire' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/welcome-client-questionnaire.html' },
                });

                ko.components.register('fx-component-userflow-wrap', {
                    deps: ['LoadDictionaryContent!account_hub'],
                    viewModel: { require: 'viewmodels/Account/UserFlowWrapViewModel' },
                    template: { require: 'text!webHtml/statichtml/account/user-flow-wrap.html' },
                });

                ko.components.register('fx-component-account-userflow-br' + urlResolver.getBroker(), {
                    viewModel: { require: 'deviceviewmodels/account/UserFlowViewModel' },
                    template: {
                        require: 'text!webHtml/statichtml/account/userflow-br' + urlResolver.getBroker() + '.html',
                    },
                });

                ko.components.register('fx-thankyou-client-questionnaire', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/thankyou-client-questionnaire' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/thankyou-client-questionnaire.html' },
                });

                ko.components.register('fx-unsuccessful-client-questionnaire', {
                    deps: ['LoadDictionaryContent!client_questionnaire'],
                    viewModel: { require: 'viewmodels/questionnaire/unsuccessful-client-questionnaire' },
                    template: { require: 'text!webHtml/statichtml/questionnaire/unsuccessful-client-questionnaire.html' },
                });

                ko.components.register('fx-aml-status-page', {
                    viewModel: { require: 'viewmodels/AmlViewModel' },
                    template: { require: 'text!partial-views/web-compliance-amlstatus.html' },
                });

                ko.components.register('fx-upload-documents-page', {
                    deps: [
                        'LoadDictionaryContent!FAQUPLOADDOCUMENTS',
                        'LoadDictionaryContent!compliance_UploadDocuments',
                        'LoadDictionaryContent!Tooltip',
                        'LoadDictionaryContent!Category',
                        'LoadDictionaryContent!Status',
                        'LoadDictionaryContent!UploadDocumentsStatusPopUpMessages',
                    ],
                    viewModel: { require: 'viewmodels/UploadDocumentsViewModel' },
                    template: { require: 'text!webHtml/statichtml/compliance/upload-documents.html' },
                });

                ko.components.register('fx-component-require-margin-text', {
                    viewModel: { require: 'viewmodels/Deals/DealMarginViewModel' },
                    template: { require: 'text!partial-views/web-deals-requiremargin.html' },
                });

                ko.components.register('fx-component-converted-amount-text', {
                    viewModel: { require: 'viewmodels/Deals/ConvertedAmountViewModel' },
                    template: { require: 'text!partial-views/web-deals-convertedamount.html' },
                });

                ko.components.register('fx-component-chart-tool', {
                    viewModel: { require: 'deviceviewmodels/ChartToolViewModel' },
                    template: { require: 'text!webHtml/statichtml/deals/deal-charttool.html' },
                });

                ko.components.register('fx-component-market-info-rates', {
                    deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                    viewModel: { require: 'viewmodels/Deals/MarketInfoRatesViewModel' },
                    template: { require: 'text!webHtml/statichtml/deals/market-info-rates.html' },
                });

                ko.components.register('fx-component-rate-range-indicator', {
                    deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                    viewModel: { require: 'viewmodels/Deals/RateRangeIndicatorViewModel' },
                    template: { require: 'text!webHtml/statichtml/deals/rate-range-indicator.html' },
                });

                ko.components.register('fx-component-economic-calendar-tool', {
                    deps: [
                        'LoadDictionaryContent!economicCalendarLongData',
                        'LoadDictionaryContent!economicCalendar',
                        'LoadDictionaryContent!economicCalendar_tools_static',
                    ],
                    viewModel: { require: 'viewmodels/EconomicCalendarViewModel' },
                    template: { require: 'text!partial-views/web-deals-dealcalendartool.html' },
                });

                ko.components.register('fx-component-instrument-info-tool', {
                    deps: ['LoadDictionaryContent!deals_DealMarketInfoTool'],
                    viewModel: { require: 'viewmodels/Deals/InstrumentInfoViewModel' },
                    template: { require: 'text!partial-views/web-deals-instrumentinfotool.html' },
                });

                ko.components.register('fx-component-cash-back', {
                    viewModel: { require: 'viewmodels/CashBackViewModel' },
                    template: { require: 'text!partial-views/web-deals-cashback.html' },
                    synchronous: true,
                });

                ko.components.register('fx-component-live-cash-back', {
                    viewModel: { require: 'viewmodels/BonusViewModel' },
                    template: { require: 'text!partial-views/web-deals-livecashback.html' },
                    synchronous: true,
                });

                ko.components.register('fx-component-spread-discount', {
                    viewModel: { require: 'viewmodels/BonusViewModel' },
                    template: { require: 'text!partial-views/web-deals-spreaddiscount.html' },
                    synchronous: true,
                });

                // Export data registrations
                ko.components.register('fx-component-export-buttons', {
                    viewModel: { require: 'viewmodels/PrintExportViewModel' },
                    template: { element: 'fx-template-export-buttons' },
                });

                ko.components.register('fx-component-export', {
                    viewModel: { require: 'viewmodels/PrintExportViewModel' },
                    template: { element: 'fx-template-export' },
                });

                ko.components.register('closed-deals', {
                    viewModel: { require: 'viewmodels/PrintExportViewModel' },
                    template: { require: 'text!partial-views/web-export-closeddeals.html' },
                });

                ko.components.register('account-statement', {
                    viewModel: { require: 'viewmodels/PrintExportViewModel' },
                    template: { require: 'text!partial-views/web-export-accountstatment.html' },
                });

                ko.components.register('activity-log', {
                    viewModel: { require: 'viewmodels/PrintExportViewModel' },
                    template: { require: 'text!partial-views/web-export-activitylog.html' },
                });

                ko.components.register('fx-component-accountcard-records', {
                    deps: ['LoadDictionaryContent!deals_AccountCardRecords'],
                    viewModel: { require: 'deviceviewmodels/AccountCardRecordsViewModel' },
                    template: { require: 'text!partial-views/web-deals-accountcardrecords.html' },
                });

                ko.components.register('fx-component-rolledover', {
                    viewModel: { require: 'deviceviewmodels/RolledOverViewModel' },
                    template: { require: 'text!partial-views/web-deals-rolledover.html' },
                });

                ko.components.register('fx-component-contract-rollover', {
                    viewModel: { require: 'deviceviewmodels/ContractRolloverViewModel' },
                    template: { require: 'text!partial-views/web-deals-contractrollover.html' },
                });

                ko.components.register('fx-component-personal-details', {
                    deps: ['LoadDictionaryContent!country_names'],
                    viewModel: { require: 'viewmodels/PersonalDetailsViewModel' },
                    template: { require: 'text!partial-views/web-customer-PersonalDetailsPartial.html' },
                });

                ko.components.register('fx-component-market-closed-view', {
                    viewModel: { require: 'viewmodels/MarketClosedViewModel' },
                    template: { element: 'fx-template-market-closed' },
                });

                ko.components.register('fx-schedule-group', {
                    deps: ['LoadDictionaryContent!schedulegrouphtml'],
                    viewModel: { require: 'viewmodels/Deals/ScheduleGroupViewModel' },
                    template: { require: 'text!html/statichtml/deals/schedule-group.html' },
                });

                ko.components.register('fx-component-netexposures-summary', {
                    viewModel: { instance: { VmNetExposure: ViewModelsManager.VmNetExposure } },
                    template: { require: 'text!partial-views/web-customer-netexposuresummary.html' },
                });

                if (ViewModelsManager.ReactComponentsEnabled()['fx-core-api/summaryView']) {
                    ko.components.register('fx-component-account-summary', {
                        react: 'fx-core-api/SummaryView',
                        deps: [
                            'LoadDictionaryContent!summaryview_accountsummary',
                            'LoadDictionaryContent!summaryview_exposures',
                        ],
                    });
                } else {
                    ko.components.register('fx-component-account-summary', {
                        viewModel: { require: 'viewmodels/WalletViewModel' },
                        template: { require: 'text!webHtml/statichtml/AcccountSummaryWallet.html' },
                        deps: [
                            'LoadDictionaryContent!summaryview_accountsummary',
                            'LoadDictionaryContent!summaryview_exposures',
                        ],
                    });
                }

                if (ViewModelsManager.ReactComponentsEnabled()['fx-core-api/quotesGrid']) {
                    ko.components.register('fx-component-quotes-grid', {
                        react: 'fx-core-api/QuotesView',
                        deps: ['LoadDictionaryContent!summaryview_quotesgrid'],
                    });
                }

                ko.components.register('fx-component-main-header', {
                    deps: ['LoadDictionaryContent!menus_mainmenu'],
                    viewModel: { require: 'viewmodels/menuviewmodel' },
                    template: { require: 'text!webHtml/statichtml/MainHeader.html' },
                });

                ko.components.register('fx-component-summary-view', {
                    viewModel: { instance: ViewModelsManager },
                    template: { element: 'fx-template-summary-view' },
                    deps: ['LoadDictionaryContent!summaryview_quotesgrid'],
                });

                ko.components.register('fx-component-control-title', {
                    deps: ['LoadDictionaryContent!general_controltitle'],
                    viewModel: { instance: ViewModelsManager },
                    template: { require: 'text!webHtml/statichtml/ControlTitle.html' },
                });

                ko.components.register('fx-component-page-title', {
                    deps: ['LoadDictionaryContent!general_pagetitle'],
                    viewModel: { instance: ViewModelsManager },
                    template: { require: 'text!webHtml/statichtml/PageTitle.html' },
                });

                ko.components.register('fx-component-validation', {
                    viewModel: { instance: ViewModelsManager },
                    template: { element: 'fx-template-validation' },
                });

                ko.components.register('fx-component-dialog-box', {
                    viewModel: { instance: ViewModelsManager },
                    template: { element: 'fx-template-dialog-box' },
                });

                ko.components.register('fx-component-modal-iframe', {
                    viewModel: { instance: ViewModelsManager },
                    template: { element: 'fx-template-modal-iframe' },
                });

                ko.components.register('fx-component-spinner-box', {
                    viewModel: { require: 'managers/SpinnerManager' },
                    template: { require: 'text!partial-views/web-customer-spinnerbox.html' },
                });

                ko.components.register('fx-component-footer', {
                    template: { element: 'fx-template-footer' },
                });

                ko.components.register('fx-custom-dropdown', {
                    viewModel: { require: 'viewmodels/CustomDropDown' },
                    template: { require: 'text!partial-views/web-navigation-customdropdown.html' },
                });

                ko.components.register('fx-component-change-password', {
                    viewModel: { require: 'viewmodels/ChangePasswordViewModel' },
                    template: {
                        require: 'text!account/changepasswordpartial?SuppressExpirationMessage=true&refresh=' + Date.now(),
                    },
                });

                ko.components.register('fx-component-open-deals-grid-tab-header', {
                    viewModel: { require: 'deviceviewmodels/OpenDealsViewModel' },
                    template: { element: 'fx-template-open-deals-grid-tab-header' },
                    deps: ['LoadDictionaryContent!tooltipsStaticResource'],
                });

                ko.components.register('fx-component-limits-grid-tab-header', {
                    viewModel: { require: 'deviceviewmodels/LimitsViewModel' },
                    template: { element: 'fx-template-limits-grid-tab-header' },
                });

                ko.components.register('fx-component-closed-deals-grid-tab-header', {
                    template: { element: 'fx-template-closed-deals-grid-tab-header' },
                });

                ko.components.register('fx-component-openeddeal-row', {
                    viewModel: { require: 'deviceviewmodels/OpenedDealRowViewModel' },
                    template: { require: 'text!webHtml/statichtml/deals/openeddeal-row.html' },
                    deps: ['LoadDictionaryContent!tooltipsStaticResource', 'LoadDictionaryContent!datagrids_opendeals'],
                });

                ko.components.register('fx-component-limits-grid', {
                    viewModel: { require: 'deviceviewmodels/LimitsViewModel' },
                    template: { require: 'text!partial-views/web-deals-limits.html' },
                    deps: ['LoadDictionaryContent!tooltipsStaticResource'],
                });

                ko.components.register('fx-component-price-alerts-grid', {
                    viewModel: { require: 'deviceviewmodels/PriceAlertsViewModel' },
                    template: { require: 'text!partial-views/web-limits-pricealerts.html' },
                });

                ko.components.register('fx-component-closed-deals-grid', {
                    deps: ['helpers/CustomKOBindings/NumericFieldBinding'],
                    viewModel: { require: 'deviceviewmodels/ClosedDealsViewModel' },
                    template: { require: 'text!partial-views/web-deals-closeddeals.html' },
                });

                ko.components.register('fx-component-account-closed-deals', {
                    viewModel: { require: 'deviceviewmodels/AccountClosedDealsViewModel' },
                    template: { require: 'text!partial-views/web-deals-closeddeals.html' },
                });

                ko.components.register('fx-component-deals-tabs', {
                    viewModel: { require: 'viewmodels/TabsViewModel' },
                    template: { element: 'fx-template-deals-tabs' },
                    deps: ['LoadDictionaryContent!tooltipsStaticResource'],
                });

                ko.components.register('fx-component-sort', {
                    viewModel: { require: 'viewmodels/SortStateViewModel' },
                    template: { require: 'text!webHtml/statichtml/sort-up-down-button.html' },
                });

                ko.components.register('fx-component-trading-signals', {
                    viewModel: { require: 'deviceviewmodels/Signals/TradingSignalsViewModel' },
                    template: { require: 'text!partial-views/web-signals-signals.html' },
                });

                ko.components.register('signals-alerts-grid', {
                    viewModel: { require: 'deviceviewmodels/Signals/SignalsAlertGridViewModel' },
                    template: { require: 'text!partial-views/web-signals-signalsalertsgrid.html' },
                });

                ko.components.register('signals-candle-stick-grid', {
                    viewModel: { require: 'deviceviewmodels/Signals/SignalsCandleStickGridViewModel' },
                    template: { require: 'text!partial-views/web-signals-signalscandlestickgrid.html' },
                });

                ko.components.register('signals-technical-analisis-grid', {
                    viewModel: { require: 'deviceviewmodels/Signals/SignalsTechnicalAnalisisGridViewModel' },
                    template: { require: 'text!partial-views/web-signals-signalstechnicalanalisisgrid.html' },
                });

                ko.components.register('signal-technical-analysis-full', {
                    viewModel: { require: 'deviceviewmodels/Signals/SignalTechAnalysisFullViewModel' },
                    template: { require: 'text!partial-views/web-signals-signaltechanalysisfull.html' },
                });

                ko.components.register('signals-service-grid', {
                    viewModel: { require: 'deviceviewmodels/Signals/SignalsServiceViewModel' },
                    template: { require: 'text!partial-views/web-signals-signalsservice.html' },
                });

                ko.components.register('signals-disclamer-grid', {
                    viewModel: { require: 'deviceviewmodels/Signals/SignalsDisclamerViewModel' },
                    template: { require: 'text!partial-views/web-signals-signalsdisclamer.html' },
                });

                ko.components.register('fx-notifications-settings', {
                    viewModel: { require: 'viewmodels/NotificationsSettingsViewModel' },
                    template: { require: 'text!partial-views/web-compliance-notificationssettings.html' },
                    deps: ['LoadDictionaryContent!compliance_NotificationsSettings'],
                });

                ko.components.register('fx-account-preferences', {
                    deps: ['LoadDictionaryContent!account_hub'],
                    viewModel: { require: 'viewmodels/AccountPreferencesViewModel' },
                    template: { require: 'text!partial-views/web-account-AccountPreferences.html' },
                });

                ko.components.register('fx-component-transaction-report', {
                    viewModel: { require: 'viewmodels/TransactionsReportViewModel' },
                    template: { require: 'text!webHtml/statichtml/Account/TransactionsReport.html' },
                });

                ko.components.register('fx-component-demo-deposit-icon', {
                    viewModel: { require: 'viewmodels/demoDeposit/demo-deposit-icon' },
                    template: { require: 'text!webHtml/statichtml/demoDeposit/demo-deposit-icon.html' },
                });

                ko.components.register('fx-component-demo-banner-openclosedeal', {
                    viewModel: { require: 'viewmodels/DemoBannerViewModel' },
                    template: { require: 'text!webHtml/statichtml/demoaccount-banner.html' },
                });

                ko.components.register('fx-component-chart', {
                    viewModel: { require: 'deviceviewmodels/ChartViewModel' },
                    template: { element: 'fx-template-chart-item' },
                });

                ko.components.register('fx-component-dropdown-instrument-search', {
                    deps: ['helpers/CustomKOBindings/AutocompleteBinding'],
                    viewModel: { require: 'deviceviewmodels/DropdownInstrumentSearchViewModel' },
                    template: { require: 'text!webHtml/statichtml/DropdownInstrumentSearch.html' },
                });

                ko.components.register('fx-component-tile-dropdown-instrument-search', {
                    deps: ['helpers/CustomKOBindings/AutocompleteBinding'],
                    viewModel: { require: 'deviceviewmodels/DropdownInstrumentSearchViewModel' },
                    template: { require: 'text!webHtml/statichtml/TileDropdownInstrumentSearch.html' },
                });

                ko.components.register('fx-component-closed-deals-instrument-search', {
                    deps: ['helpers/CustomKOBindings/AutocompleteBinding'],
                    viewModel: { require: 'deviceviewmodels/ClosedDealsInstrumentSearchViewModel' },
                    template: { require: 'text!webHtml/statichtml/ClosedDealsInstrumentSearch.html' },
                });

                ko.components.register('fx-component-preset-instrument-search', {
                    deps: ['helpers/CustomKOBindings/AutocompleteBinding'],
                    viewModel: { require: 'deviceviewmodels/PresetInstrumentSearchViewModel' },
                    template: { require: 'text!webHtml/statichtml/PresetInstrumentSearch.html' },
                });

                ko.components.register('fx-component-dropdown-presets', {
                    viewModel: { require: 'deviceviewmodels/PresetDropdownListViewModel' },
                    template: { require: 'text!webHtml/statichtml/PresetDropdownList.html' },
                });

                ko.components.register('fx-component-scroll', {
                    viewModel: { require: 'deviceviewmodels/ScrollComponentViewModel' },
                    template: { element: 'fx-scroll-bar-template' },
                });

                ko.components.register('fx-component-withdrawal', {
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalViewModel' },
                    template: { require: 'text!partial-views/web-withdrawal-withdrawal.html' },
                });

                ko.components.register('fx-component-withdrawalbankdetails', {
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalBankDetailsViewModel' },
                    template: { require: 'text!partial-views/web-withdrawal-withdrawalbankdetails.html' },
                });

                ko.components.register('fx-component-withdrawal-ccdetails', {
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalCreditCardDetailsViewModel' },
                    template: { require: 'text!partial-views/web-withdrawal-withdrawalcreditcarddetails.html' },
                });

                ko.components.register('faq', {
                    viewModel: { require: 'viewmodels/Content/FaqQuestionViewModel' },
                    template: { require: 'text!webHtml/statichtml/content/content-faq-question.html' },
                });

                ko.components.register('fx-component-faq', {
                    viewModel: { require: 'viewmodels/questionnaire/FaqViewModel' },
                    template: { require: 'text!webHtml/statichtml/faq.html' },
                });

                ko.components.register('fx-component-faq-deposit', {
                    viewModel: { require: 'viewmodels/questionnaire/FaqViewModel' },
                    template: { require: 'text!webHtml/statichtml/faq.html' },
                    deps: ['LoadDictionaryContent!FAQDEPOSIT', 'LoadDictionaryContent!FAQDEPOSITTHANKYOU'],
                });

                ko.components.register('fx-component-support', {
                    viewModel: { require: 'viewmodels/questionnaire/SupportViewModel' },
                    template: { require: 'text!webHtml/statichtml/support.html' },
                });

                ko.components.register('fx-component-amount-spinner', {
                    viewModel: { require: 'viewmodels/AmountSpinnerFieldViewModel' },
                    template: { require: 'text!webHtml/statichtml/AmountSpinnerField.html' },
                });

                ko.components.register('fx-component-low-margin-spinner', {
                    viewModel: { require: 'viewmodels/LowMarginSpinnerViewModel' },
                    template: { require: 'text!webHtml/statichtml/LowMarginSpinnerField.html' },
                });

                ko.components.register('fx-component-search-country', {
                    deps: ['helpers/CustomKOBindings/AutocompleteBinding', 'LoadDictionaryContent!country_names'],
                    viewModel: { require: 'deviceviewmodels/SearchCountryViewModel' },
                    template: { require: 'text!webHtml/statichtml/SearchCountry.html' },
                });

                ko.components.register('fx-component-deposit-confirmation', {
                    deps: ['LoadDictionaryContent!compliance_DepositConfirmation'],
                    viewModel: { require: 'viewmodels/deposit/DepositConfirmationViewModel' },
                    template: { require: 'text!webHtml/statichtml/deposit/deposit-confirmation.html' },
                });

                ko.components.register('fx-component-electronic-signature', {
                    viewModel: { require: 'viewmodels/deposit/ElectronicSignatureViewModel' },
                    template: { require: 'text!webHtml/statichtml/deposit/electronic-signature.html' },
                });

                ko.components.register('fx-component-account-header', {
                    deps: ['LoadDictionaryContent!account_hub'],
                    viewModel: { require: 'viewmodels/accounthub/AccountHeaderViewModel' },
                    template: { require: 'text!webHtml/statichtml/AccountHub/AccountHeader.html' },
                });

                ko.components.register('fx-component-account-hub-countdown', {
                    deps: ['LoadDictionaryContent!account_hub'],
                    viewModel: { require: 'viewmodels/accounthub/AccountHubCountdownViewModel' },
                    template: { require: 'text!webHtml/statichtml/AccountHub/AccountHubCountdown.html' },
                });

                ko.components.register('fx-component-account-hub', {
                    deps: ['LoadDictionaryContent!account_hub'],
                    viewModel: { require: 'viewmodels/accounthub/AccountHubCardViewModel' },
                    template: { require: 'text!webHtml/statichtml/AccountHub/AccountHubCard.html' },
                });

                ko.components.register('fx-component-access-request-signals-details', {
                    deps: ['LoadDictionaryContent!accessRequest'],
                    viewModel: { require: 'viewmodels/AccessRequestViewModel' },
                    template: { require: 'text!webHtml/statichtml/Signals/SignalDetailsAccessRequest.html' },
                });

                ko.components.register('fx-component-access-request-signals', {
                    deps: ['LoadDictionaryContent!accessRequest'],
                    viewModel: { require: 'viewmodels/AccessRequestViewModel' },
                    template: { require: 'text!webHtml/statichtml/Signals/SignalsAccessRequest.html' },
                });

                ko.components.register('fx-component-extension-request-videolessons', {
                    deps: ['LoadDictionaryContent!accessRequest'],
                    viewModel: { require: 'viewmodels/AccessRequestViewModel' },
                    template: { require: 'text!webHtml/statichtml/Tutorials/VideoLessonsExtensionRequest.html' },
                });

                ko.components.register('fx-component-extension-request-tutorials', {
                    deps: ['LoadDictionaryContent!accessRequest'],
                    viewModel: { require: 'viewmodels/AccessRequestViewModel' },
                    template: { require: 'text!webHtml/statichtml/Tutorials/TutorialsExtensionRequest.html' },
                });

                ko.components.register('fx-component-trading-tutorials', {
                    deps: ['tutorials/tutorials'],
                    viewModel: { instance: ViewModelsManager },
                    template: { require: 'text!controllers/Tools/Tutorials/Pips' },
                });

                ko.components.register('fx-component-trading-educational-tutorials', {
                    deps: ['tutorials/tutorials'],
                    viewModel: { instance: ViewModelsManager },
                    template: { require: 'text!controllers/Tools/Tutorials/Educational' },
                });

                ko.components.register('fx-component-tutorials-pips-partial', {
                    deps: ['LoadDictionaryContent!accessRequest'],
                    viewModel: { require: 'deviceviewmodels/TutorialsViewModel' },
                    template: { require: 'text!controllers/Tools/Tutorials/_Tutorials' },
                });

                ko.components.register('fx-component-tutorials-educational-partial', {
                    deps: ['LoadDictionaryContent!accessRequest'],
                    viewModel: { require: 'deviceviewmodels/TutorialsViewModel' },
                    template: { require: 'text!controllers/Tools/Tutorials/_VideoLessons' },
                });

                ko.components.register('fx-component-pending-withdrawal', {
                    deps: ['LoadDictionaryContent!withdrawal_pendingwithdrawals'],
                    viewModel: { require: 'viewmodels/Withdrawal/PendingWithdrawalsViewModel' },
                    template: { require: 'text!webHtml/statichtml/Withdrawal/PendingWithdrawals.html' },
                });

                ko.components.register('account-summary-not-active', {
                    deps: ['LoadDictionaryContent!summaryview_accountsummary', 'LoadDictionaryContent!account_hub'],
                    viewModel: { require: 'viewmodels/AccountSummaryNotActiveViewModel' },
                    template: { require: 'text!webHtml/statichtml/AccountSummaryNotActive.html' },
                });

                if (configuration['fx-component-activation-slip'] === true) {
                    ko.components.register('fx-component-activation-slip', {
                        deps: ['LoadDictionaryContent!account_hub'],
                        viewModel: { require: 'deviceviewmodels/ActivationSlipViewModel' },
                        template: { require: 'text!webHtml/statichtml/ActivationSlip.html' },
                    });
                }

                ko.components.register('fx-balloon-validation', {
                    template: { require: 'text!webHtml/statichtml/balloon-validation.html' },
                });

                ko.components.register('fx-component-withdrawal-wrapper', {
                    template: { require: 'text!webHtml/statichtml/withdrawal-wrapper.html' },
                });

                ko.components.register('fx-component-navigation-wizard', {
                    deps: ['LoadDictionaryContent!navigationWizard'],
                    viewModel: { require: 'viewmodels/NavigationWizardViewModel' },
                    template: { require: 'text!webHtml/statichtml/navigation-wizard.html' },
                });

                ko.components.register('fx-component-amount-requested', {
                    deps: ['LoadDictionaryContent!withdrawal_withdrawalrequest'],
                    viewModel: { require: 'viewmodels/Withdrawal/AmountRequestedViewModel' },
                    template: { require: 'text!webHtml/statichtml/Withdrawal/amount-requested.html' },
                });

                ko.components.register('fx-component-withdrawal-amount', {
                    deps: ['LoadDictionaryContent!withdrawal_withdrawalrequest'],
                    viewModel: { require: 'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetAmountViewModel' },
                    template: { require: 'text!webHtml/statichtml/withdrawal/wizard/withdrawal-setamount.html' },
                });

                ko.components.register('fx-component-withdrawal-method', {
                    deps: ['LoadDictionaryContent!withdrawal_withdrawalrequest'],
                    viewModel: { require: 'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetMethodViewModel' },
                    template: { require: 'text!webHtml/statichtml/withdrawal/wizard/withdrawal-setmethod.html' },
                });

                ko.components.register('fx-component-withdrawal-setbankdetails', {
                    deps: [
                        'helpers/CustomKOBindings/AutocompleteBinding',
                        'LoadDictionaryContent!country_names',
                        'LoadDictionaryContent!withdrawal_withdrawalrequest',
                    ],
                    viewModel: { require: 'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetbankdetailsViewModel' },
                    template: { require: 'text!webHtml/statichtml/withdrawal/wizard/withdrawal-setbankdetails.html' },
                });

                ko.components.register('fx-component-withdrawal-setccdetails', {
                    deps: [
                        'LoadDictionaryContent!withdrawal_withdrawalrequest',
                        'LoadDictionaryContent!payments_concreteView',
                        'LoadDictionaryContent!payments_concreteNames',
                    ],
                    viewModel: { require: 'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetCCDetailsViewModel' },
                    template: { require: 'text!webHtml/statichtml/withdrawal/wizard/withdrawal-setccdetails.html' },
                });

                ko.components.register('fx-component-withdrawal-setapproval', {
                    deps: ['LoadDictionaryContent!views_vMobileWithdrawal', 'LoadDictionaryContent!country_names'],
                    viewModel: { require: 'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetApprovalViewModel' },
                    template: { require: 'text!webHtml/statichtml/withdrawal/wizard/withdrawal-setapproval.html' },
                });

                ko.components.register('fx-component-withdrawal-thankyou', {
                    deps: [
                        'LoadDictionaryContent!navigationWizard',
                        'LoadDictionaryContent!withdrawal_withdrawalrequest',
                        'LoadDictionaryContent!Category',
                    ],
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalThankYouViewModel' },
                    template: { require: 'text!webHtml/statichtml/withdrawal/withdrawal-thankyou.html' },
                });

                ko.components.register('fx-component-toolbar', {
                    viewModel: { require: 'deviceviewmodels/ToolbarViewModel' },
                    template: { require: 'text!webHtml/statichtml/toolbartemplate.html' },
                    deps: ['LoadDictionaryContent!Toolbar'],
                });

                ko.components.register('fx-component-help-center-action', {
                    viewModel: { require: 'viewmodels/HelpCenter/HelpCenterActionViewModel' },
                    template: { require: 'text!webHtml/statichtml/HelpCenter/help-center-action.html' },
                });

                ko.components.register('fx-component-help-center', {
                    deps: ['LoadDictionaryContent!HelpCenterWalkthroughs', 'LoadDictionaryContent!HelpCenterTradingGuide'],
                    viewModel: { require: 'deviceviewmodels/HelpCenterViewModel' },
                    template: { require: 'text!webHtml/statichtml/HelpCenter/help-center.html' },
                });

                ko.components.register('fx-confirm-documentverification', {
                    deps: [
                        'LoadDictionaryContent!compliance_UploadDocuments',
                        'LoadDictionaryContent!UploadDocumentsStatusPopUpMessages',
                    ],
                    viewModel: { require: 'deviceviewmodels/UploadDocuments/VerificationDocumentViewModel' },
                    template: { require: 'text!webHtml/statichtml/Compliance/confirm-verification-document.html' },
                });

                ko.components.register('fx-documentverification-modal', {
                    deps: ['LoadDictionaryContent!compliance_UploadDocuments'],
                    viewModel: { require: 'deviceviewmodels/UploadDocuments/VerificationDocumentModal' },
                    template: { require: 'text!webHtml/statichtml/Compliance/verification-document-modal.html' },
                });

                PaymentsConfiguration.RegisterDepositComponents();
                DealSlipsConfiguration.RegisterComponents(configuration);

                registerBackofficeComponents();
            }

            function registerBackofficeComponents() {
                window.enableTradingComponentRegistered = ko.observable(false);

                if (!systemInfo.get('hasTradingPermission')) {
                    return;
                }

                ko.components.unregister('fx-component-change-password');
                ko.components.register('fx-component-change-password', {
                    deps: ['LoadDictionaryContent!account_ChangePasswordPartial'],
                    viewModel: { require: 'viewmodels/ChangePasswordViewModel' },
                    template: { require: 'text!webHtml/statichtml/backoffice/ChangePassword.html' }
                });

                require(['configuration/EnableTradingConfiguration'],
                    function (enableTradingConfiguration) {
                        enableTradingConfiguration.RegisterComponents();
                        window.enableTradingComponentRegistered(true);
                    },
                    function doingNothing() {
                        return;
                    }
                );
            }

            function adjustCulture() {
                if (typeof Globalize !== 'undefined') {
                    var cultureInfo = {
                        numberFormat: {},
                    };

                    cultureInfo.numberFormat[','] = '';
                    Globalize.addCultureInfo('noThousandsSeparator', 'default', cultureInfo);
                    window.Globalize = Globalize;
                }

                return true;
            }

            return {
                AdjustCulture: adjustCulture,
                RegisterComponents: registerComponents,
                RegisterContentTemplateComponents: function () { },
                BindKO: bindKO,
                AdjustHtml: adjustHtml,
                AddPixel: addPixel,
                ExposeUI: exposeUI,
                UpdateScmmTrackingData: updateScmmTrackingData,
            };
        }

        return PlugInConfiguration();
    }
);
