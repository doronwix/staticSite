define(
    'configuration/PlugInConfiguration',
    [
        'require',
        'knockout',
        'handlers/general',
        'jquery',
        'handlers/Logger',
        'tracking/googleTagManager',
        'configuration/PaymentsConfiguration',
        'helpers/customkobindings/KoCustomBindings',
        'devicehelpers/KoCustomBindings',
        'devicemanagers/ViewModelsManager',
        'trackingIntExt/TrackingData',
    ],
    function PlugInConfigurationDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            $ = require('jquery'),
            Logger = require('handlers/Logger'),
            GoogleTagManager = require('tracking/googleTagManager'),
            PaymentsConfiguration = require('configuration/PaymentsConfiguration'),
            ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            trackingData = require('trackingIntExt/TrackingData');

        function PlugInConfiguration() {
            var bindKO = function (rootElement) {
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
                }
                catch (ex) {
                    Logger.log('PlugInConfiguration.bindKO', ex.message, '', eErrorSeverity.warning);
                }

                $(document).on(eAppEvents.formChangeEvent, function () {
                    $(document).scrollTop(0);
                    $(document).trigger(eAppEvents.formChangedEvent);
                });
            };

            // need to register components before ko.applyBindings
            var registerComponents = function (/*configuration*/) {
                /////////// back office /////////////////////////
                ko.components.register('fx-withdrawal-automation', {
                    viewModel: { require: 'deviceviewmodels/withdrawalautomation/withdrawalautomationviewmodel', },
                    template: { require: 'text!deviceviews/withdrawalautomation/withdrawal-automation.html', },
                });

                ko.components.register('fx-withdrawals', {
                    viewModel: { require: 'deviceviewmodels/withdrawalautomation/withdrawalsviewmodel', },
                    template: { require: 'text!deviceviews/withdrawalautomation/withdrawals.html', },
                });

                ko.components.register('fx-withdrawal-lines', {
                    viewModel: { require: 'deviceviewmodels/withdrawalautomation/withdrawallinesviewmodel', },
                    template: { require: 'text!deviceviews/withdrawalautomation/withdrawal-lines.html', },
                });

                ko.components.register('fx-withdrawal-details', {
                    viewModel: { require: 'deviceviewmodels/withdrawalautomation/withdrawaldetailsviewmodel', },
                    template: { require: 'text!deviceviews/withdrawalautomation/withdrawal-details.html', },
                });

                ko.components.register('fx-withdrawal-method', {
                    viewModel: { require: 'deviceviewmodels/withdrawalautomation/withdrawalmethodviewmodel', },
                    template: { require: 'text!deviceviews/withdrawalautomation/withdrawal-method.html', },
                });

                ko.components.register('fx-withdrawal-process', {
                    viewModel: { require: 'deviceviewmodels/withdrawalautomation/withdrawalprocessviewmodel', },
                    template: { require: 'text!deviceviews/withdrawalautomation/withdrawal-process.html', },
                });

                ko.components.register('fx-forced-deposit', {
                    deps: ['LoadDictionaryContent!DepositBackOffice'],
                    viewModel: { require: 'deviceviewmodels/deposit/forceddepositviewmodel', },
                    template: { require: 'text!deviceviews/deposit/forced-deposit.html' },
                });

                ko.components.register('fx-wire-transfer', {
                    viewModel: { require: 'deviceviewmodels/deposit/wiretransferviewmodel', },
                    template: { require: 'text!deviceviews/deposit/wire-transfer.html' },
                });

                ko.components.register('fx-wire-transfer-edit', {
                    viewModel: { require: 'deviceviewmodels/deposit/wiretransfereditviewmodel', },
                    template: { require: 'text!deviceviews/deposit/wire-transfer-edit.html', },
                });

                ko.components.register('fx-wire-transfer-comments', {
                    viewModel: { require: 'deviceviewmodels/deposit/wiretransfercommentsviewmodel', },
                    template: { require: 'text!deviceviews/deposit/wire-transfer-comments.html', },
                });

                ko.components.register('fx-wire-transfer-newapprove', {
                    deps: ['LoadDictionaryContent!DepositBackOffice'],
                    viewModel: { require: 'deviceviewmodels/deposit/wiretransfernewapproveviewmodel', },
                    template: { require: 'text!deviceviews/deposit/wire-transfer-newapprove.html', },
                });

                ko.components.register('fx-convert-balance', {
                    viewModel: { require: 'deviceviewmodels/accountstatement/convertbalanceviewmodel', },
                    template: { require: 'text!deviceviews/accountstatement/convert-balance.html', },
                });

                ko.components.register('fx-convert-account-line', {
                    viewModel: { require: 'deviceviewmodels/accountstatement/convertaccountlineviewmodel', },
                    template: { require: 'text!deviceviews/accountstatement/convert-account-line.html', },
                });

                ko.components.register('fx-general-account-actions', {
                    deps: [
                        'LoadDictionaryContent!AccountStatementBackOffice',
                        'helpers/CustomKOBindings/NumericFieldBinding',
                    ],
                    viewModel: { require: 'deviceviewmodels/accountstatement/generalaccountactionsviewmodel', },
                    template: { require: 'text!deviceviews/accountstatement/general-account-actions.html', },
                });

                ko.components.register('fx-amend-deposit', {
                    deps: [
                        'LoadDictionaryContent!AccountStatementBackOffice',
                        'helpers/CustomKOBindings/NumericFieldBinding',
                    ],
                    viewModel: { require: 'deviceviewmodels/accountstatement/amenddepositviewmodel', },
                    template: { require: 'text!deviceviews/accountstatement/amend-deposit.html', },
                });

                ko.components.register('fx-fix-position', {
                    deps: ['LoadDictionaryContent!AccountStatementBackOffice'],
                    viewModel: { require: 'deviceviewmodels/accountstatement/fixpositionviewmodel', },
                    template: { require: 'text!deviceviews/accountstatement/fix-position.html', },
                });

                ko.components.register('fx-currency-converter', {
                    deps: [
                        'helpers/CustomKOBindings/NumericFieldBinding',
                        'LoadDictionaryContent!CurrencyConverterBackOffice',
                    ],
                    viewModel: { require: 'deviceviewmodels/currencies/currencyconverterviewmodel', },
                    template: { require: 'text!deviceviews/currencies/currency-converter.html', },
                });

                //////////////////////////////////////////////////////////////////

                ko.components.register('fx-upload-documents-page', {
                    viewModel: { require: 'viewmodels/UploadDocumentsViewModel' },
                    template: { require: 'text!partial-views/web-compliance-uploaddocuments.html', },
                });

                ko.components.register('fx-component-cash-back', {
                    viewModel: { require: 'viewmodels/CashBackViewModel' },
                    template: { require: 'text!partial-views/web-deals-cashback.html' },
                });

                ko.components.register('fx-component-trading-signals', {
                    viewModel: { require: 'deviceviewmodels//Signals/TradingSignalsViewModel', },
                    template: { require: 'text!partial-views/web-signals-signals.html' },
                });

                ko.components.register('signals-alerts-grid', {
                    viewModel: { require: 'deviceviewmodels//Signals/SignalsAlertGridViewModel', },
                    template: { require: 'text!partial-views/web-signals-signalsalertsgrid.html', },
                });

                ko.components.register('signals-candle-stick-grid', {
                    viewModel: { require: 'deviceviewmodels//Signals/SignalsCandleStickGridViewModel', },
                    template: { require: 'text!partial-views/web-signals-signalscandlestickgrid.html', },
                });

                ko.components.register('signals-technical-analisis-grid', {
                    viewModel: { require: 'deviceviewmodels//Signals/SignalsTechnicalAnalisisGridViewModel', },
                    template: { require: 'text!partial-views/web-signals-signalstechnicalanalisisgrid.html', },
                });

                ko.components.register('signal-technical-analysis-full', {
                    viewModel: { require: 'deviceviewmodels//Signals/SignalTechAnalysisFullViewModel', },
                    template: { require: 'text!partial-views/web-signals-signaltechanalysisfull.html', },
                });

                ko.components.register('signals-service-grid', {
                    viewModel: { require: 'deviceviewmodels//Signals/SignalsServiceViewModel', },
                    template: { require: 'text!partial-views/web-signals-signalsservice.html', },
                });

                ko.components.register('signals-disclamer-grid', {
                    viewModel: { require: 'deviceviewmodels//Signals/SignalsDisclamerViewModel', },
                    template: { require: 'text!partial-views/web-signals-signalsdisclamer.html', },
                });

                ko.components.register('fx-component-withdrawal', {
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalViewModel' },
                    template: { require: 'text!partial-views/web-withdrawal-withdrawal.html', },
                });

                ko.components.register('fx-component-withdrawalbankdetails', {
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalBankDetailsViewModel', },
                    template: { require: 'text!partial-views/web-withdrawal-withdrawalbankdetails.html', },
                });

                ko.components.register('fx-component-withdrawal-ccdetails', {
                    viewModel: { require: 'viewmodels/Withdrawal/WithdrawalCreditCardDetailsViewModel', },
                    template: { require: 'text!partial-views/web-withdrawal-withdrawalcreditcarddetails.html', },
                });

                ko.components.register('fx-component-search-country', {
                    deps: [
                        'helpers/CustomKOBindings/AutocompleteBinding',
                        'LoadDictionaryContent!country_names',
                    ],
                    viewModel: { require: 'deviceviewmodels/SearchCountryViewModel' },
                    template: { require: 'text!webHtml/statichtml/SearchCountry.html' },
                });

                PaymentsConfiguration.RegisterDepositComponents();
            };

            var googleTagManagerInit = function () {
                if (typeof window.Model == 'undefined') {
                    return;
                }

                window.trackingData = trackingData;
                // window.trackingData.init(); // lazy loading init like external
                var googleTagManagerId = window.Model.GoogleTagManagerId;

                if (googleTagManagerId !== '') {
                    /*eslint no-undef: 2*/
                    GoogleTagManager.Init(googleTagManagerId);

                    window.trackingEventsCollector = new TrackingEventsCollector(
                        new TrackingDesktopEvents(TrackingEventRaiser()),
                        window.trackingData,
                        true
                    );

                    window.trackingEventsCollector.init();
                }
            };

            return {
                GoogleTagManagerInit: googleTagManagerInit,
                RegisterComponents: registerComponents,
                RegisterContentTemplateComponents: function () { },
                BindKO: bindKO,
            };
        }

        return PlugInConfiguration();
    }
);
