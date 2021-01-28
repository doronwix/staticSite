define(
    'deviceviewmodels/Signals/TradingSignalsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'initdatamanagers/Customer',
        'devicemanagers/AlertsManager',
        "dataaccess/dalcustomer",
        'handlers/Cookie',
        'viewmodels/dialogs/DialogViewModel',
        'Dictionary',
        'JSONHelper',
        'LoadDictionaryContent!controls_ctlsignalservice',
        'LoadDictionaryContent!controls_ctlsignaldisclaimer',
        'LoadDictionaryContent!controls_ctlsignalrequest',
        'LoadDictionaryContent!controls_ctlsignals',
        'LoadDictionaryContent!controls_ctlsignalcompliance'
    ],
    function TradingSignalsDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            customer = require('initdatamanagers/Customer'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            dalCustomer = require("dataaccess/dalcustomer"),
            cookieHandler = require('handlers/Cookie'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            Dictionary = require('Dictionary'),
            JSONHelper = require('JSONHelper');

        var TradingSignalsViewModel = general.extendClass(KoComponentViewModel, function TradingSignalsClass(_params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                params = _params,
                handlers = {};

            var init = function (settings) {
                parent.init.call(self, settings);
                setObservables();
                setHandlers();
                setComputables();
                setSubscribers();
                updateSignalsPermissions();
            };

            var setHandlers = function () {
                handlers.handleSignalTutorialSelection = function (handleParams) {
                    //handleParams is the component's viewmodel instance
                    var options = handleParams.Data.signalstutorials.options();
                    var selectedValue = handleParams.Data.signalstutorials.value();
                    var optionFound;

                    if (!general.isNullOrUndefined(options) && !general.isNullOrUndefined(selectedValue)) {
                        optionFound = options[parseInt(selectedValue) - 1];
                    }

                    if (general.isNullOrUndefined(optionFound)) {
                        return false;
                    }

                    var dialogVieModelOptions = { width: 900, height: 670, title: optionFound.text }
                    var dialogEViewType = eViewTypes.vTradingSignalsTutorials;
                    var dialogArgs = { url: optionFound.url }

                    DialogViewModel.open(eDialog.TradingSignalsTutorials, dialogVieModelOptions, dialogEViewType, dialogArgs);

                    return true;
                };
            };

            /*returns an observable array*/
            var generateSignalsTutotrialOptionList = function (iterations) {
                var textPrefix = 'ddlSignalTutorials';
                var urlPrefix = textPrefix + '_Href';

                return ko.observableArray(Array.apply(0, Array(iterations)).map(function (value, index) {
                    var _index = ++index;

                    return {
                        index: _index,
                        url: systemInfo.signalsTutorialsDomainUrl + Dictionary.GetItem(urlPrefix + _index, 'controls_ctlsignals'),
                        text: Dictionary.GetItem(textPrefix + _index, 'controls_ctlsignals', '*')
                    };
                }));
            };

            var setObservables = function () {
                var signalsTutorialCount = 6;

                data.hasAgreedDisclaimer = ko.observable(false);
                data.areSignalsAllowed = ko.observable(false);
                data.signalsEndDate = ko.observable("");
                data.isLoading = ko.observable(false);
                data.symbol = ko.observable(params.symbol || "");
                data.signalstutorials = {
                    options: generateSignalsTutotrialOptionList(signalsTutorialCount),
                    optiontext: 'text',
                    optionvalue: 'index',
                    value: ko.observable(),
                    caption: Dictionary.GetItem('ddlSignalTutorials0', 'controls_ctlsignals')
                }
            };

            var setComputables = function () {
                data.isShowSignal = self.createComputed(function () {
                    return data.hasAgreedDisclaimer() && data.areSignalsAllowed() && !data.isLoading();
                });

                data.signalsAreDissallowed = self.createComputed(function () {
                    return !data.areSignalsAllowed() && !data.isLoading();
                });
            };

            var setSubscribers = function () {
                self.subscribeTo(data.areSignalsAllowed, function (value) {
                    if (value) {
                        var tsComplianceDate = cookieHandler.ReadCookie("TsComplianceDate");
                        if (tsComplianceDate === null && !params.isDealer) {
                            AlertsManager.UpdateAlert(AlertTypes.SignalsDisclaimerAlert);
                            AlertsManager.PopAlert(AlertTypes.SignalsDisclaimerAlert);

                            setAlertSubscriber();
                        } else {
                            data.hasAgreedDisclaimer(true);
                        }
                    }
                });
            };

            var setAlertSubscriber = function () {
                if (AlertsManager.GetAlert(AlertTypes.SignalsDisclaimerAlert).isSetComplianceDate) {
                    self.subscribeTo(AlertsManager.GetAlert(AlertTypes.SignalsDisclaimerAlert).isSetComplianceDate, function (value) {
                        if (value) {
                            data.hasAgreedDisclaimer(true);
                        }
                    });
                }
            };

            var updateSignalsPermissions = function () {
                if (general.isEmptyValue(customer.prop.AreSignalsAllowed)) {
                    data.isLoading(true);

                    dalCustomer
                        .getCustomerSignalsPermissions()
                        .then(function (responseText) {
                            data.isLoading(false);
                            var result = JSONHelper.STR2JSON("getLatestTradingSignal/onLoadComplete", responseText);
                            result = result || {};
                            customer.prop.AreSignalsAllowed = result.status == eResult.Success && result.result == "True";
                            customer.prop.signalsEndDate = customer.prop.AreSignalsAllowed ? general.str2Date(result.signalsEndDate).ExtractDate() : "";

                            data.areSignalsAllowed(customer.prop.AreSignalsAllowed);
                            data.signalsEndDate(customer.prop.signalsEndDate);
                        })
                        .done();
                }
                else {
                    data.areSignalsAllowed(customer.prop.AreSignalsAllowed);
                    data.signalsEndDate(customer.prop.signalsEndDate);
                }
            };

            var dispose = function () {
                parent.dispose.call(self);          // inherited from KoComponentViewModel
            };

            return {
                init: init,
                dispose: dispose,
                Data: data,
                Handlers: handlers
            };
        });

        var createViewModel = function (_params) {
            var params = _params || {};

            var viewModel = new TradingSignalsViewModel(params);
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
