define(
    'viewmodels/Withdrawal/PendingWithdrawalsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        "helpers/ObservableHashTable",
        'helpers/KoComponentViewModel',
        'cachemanagers/PortfolioStaticManager',
        'deviceviewmodels/BaseOrder',
        'configuration/initconfiguration',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/SymbolsManager',
        'dataaccess/dalWithdrawal',
        'Dictionary',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            observableHashTable = require("helpers/ObservableHashTable"),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            initConfiguration = require('configuration/initconfiguration'),
            customer = require('initdatamanagers/Customer'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            dalWithdrawal = require('dataaccess/dalWithdrawal'),
            Dictionary = require('Dictionary'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var PendingWithdrawalsViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = self.parent,
                baseOrder = new BaseOrder(),
                data = parent.Data,
                pendingWithdrawalCollection = new observableHashTable(ko,general,'withdrawalID'),
                processingWithdrawalCollection = new observableHashTable(ko,general,'withdrawalID');

            function init(settings) {
                parent.init.call(self, settings);

                setObservables();

                baseOrder.Init({}, pendingWithdrawalCollection);

                start();

                if (portfolioManager) {
                    portfolioManager.OnChange.Add(onPortfolioStaticChanged);
                }
            }

            function setObservables() {             
                data.totalAmountPendingWithdrawal = ko.observable("");
                data.isPendingWithdrawalGridVisible = ko.observable(true);
                data.defaultCcy = ko.observable(customer.prop.defaultCcy());
                data.isLoaded = ko.observable(false);
                data.isCancelingWithdrawal = ko.observable(false);
            }

            function getPendingWithdrawals() {
                data.isLoaded(true);
                dalWithdrawal.getAllPendingWithdrawalsByAccount(onLoadPendingWithdrawalsComplete);
            }

            function stop() {
                pendingWithdrawalCollection.Clear();
                processingWithdrawalCollection.Clear();
            }

            function start() {
                if (customer.prop.isDemo) {
                    viewModelsManager.VManager.SwitchViewVisible(customer.prop.mainPage, {});
                    setTimeout(function () { $(window).trigger('statechange'); }, 100);
                    return;
                }

                if (portfolioManager) {
                    data.totalAmountPendingWithdrawal(portfolioManager.Portfolio.pendingWithdrawals);
                }

                getPendingWithdrawals();
            }

            function refresh() {
                getPendingWithdrawals();
            }

            function onPortfolioStaticChanged(items) {
                data.totalAmountPendingWithdrawal(items.pendingWithdrawals);
            }

            function onLoadPendingWithdrawalsComplete(responseText) {
                var response = JSONHelper.STR2JSON("PendingWithdrawalViewModel/onLoadPendingWithdrawalsComplete", responseText, eErrorSeverity.medium);

                if (response) {
                    addNewItems(response.PendingWithdrawals);
                }

                data.isLoaded(false);
            }

            function addNewItems(items) {
                if (items) {
                    for (var i = 0, ii = items.length; i < ii; i++) {
                        var wInfo = buildRow(items[i]);
                        if (wInfo) {
                            switch (wInfo.statusID) {
                                case eWithdrawalStatus.pendingWithdrawal:
                                    pendingWithdrawalCollection.Add(wInfo);
                                    break;
                                case eWithdrawalStatus.processingWithdrawal:
                                    processingWithdrawalCollection.Add(wInfo);
                                    break;
                            }
                        }
                    }
                }
            }

            function buildRow(wInfo) {
                return {
                    withdrawalID: wInfo[eWithdrawalView.withdrawalID],
                    actionID: wInfo[eWithdrawalView.actionID],
                    datetime: (function () {
                        var dateParts = general.SplitDateTime(wInfo[eWithdrawalView.requestDate]);

                        return String.format("{0} {1}:{2}:{3}", dateParts.date, dateParts.hour, dateParts.min, dateParts.sec);
                    })(),
                    date: (function () {
                        var dateParts = general.SplitDateTime(wInfo[eWithdrawalView.requestDate]);

                        return dateParts.date;
                    })(),
                    time: (function () {
                        var dateParts = general.SplitDateTime(wInfo[eWithdrawalView.requestDate]);

                        return String.format("{0}:{1}:{2}", dateParts.hour, dateParts.min, dateParts.sec);
                    })(),
                    ccy: symbolsManager.GetTranslatedSymbolById(wInfo[eWithdrawalView.symbolID]),
                    amount: wInfo[eWithdrawalView.amount],
                    status: Dictionary.GetItem("WithdrawalStatus" + wInfo[eWithdrawalView.withdrawalStatus]),
                    statusID: wInfo[eWithdrawalView.withdrawalStatus],
                    onCancelPendingWithdrawal: function () { onCancelPendingWithdrawal(wInfo); },
                    onCancelProcessingWithdrawal: function () { onCancelProcessingWithdrawal(wInfo); }
                };
            }

            function onCancelPendingWithdrawal(wInfo) {
                data.isCancelingWithdrawal(true);

                dalWithdrawal.cancelPendingWithdrawal(wInfo)
                    .then(function (response) {
                        onCancelComplete(wInfo, response);
                    })
                    .finally(function () {
                        data.isCancelingWithdrawal(false);
                    })
                    .done();
            }

            function onCancelProcessingWithdrawal(wInfo) {   
                data.isCancelingWithdrawal(true);

                dalWithdrawal.cancelPendingWithdrawal(wInfo)
                    .then(function () {
                        var obj = {};
                        obj.msgKey = "CancelProcessWithdrawal";
                        showAlert(wInfo, obj);
                    })
                    .finally(function () {
                        data.isCancelingWithdrawal(false);
                    })
                    .done();
            }

            function onCancelComplete(wInfo, responseText) {
                var result = JSONHelper.STR2JSON("PendingWithdrawalViewModel/onCancelComplete", responseText),
                    successStatus = 1;
                result = result || {};

                result.msgKey = result.status == successStatus ? "SuccessCancelPendingWithdrawal" : "FaildCancelPendingWithdrawal";

                if (result.status == successStatus) {
                    pendingWithdrawalCollection.Remove(wInfo[eWithdrawalView.withdrawalID]);
                }

                var properties = {};

                if (!hasRecords()) {
                    properties.redirectToView = customer.prop.mainPage;
                }

                showAlert(wInfo, result, properties);

                ko.postbox.publish(eTopic.onCancelPendingRedrawal);

                if (result.status == successStatus && hasRecords()) {
                    stop();
                    refresh();
                }
            }

            function showAlert(wInfo, obj, properties) {
                obj.itemId = wInfo[eWithdrawalView.withdrawalID];
                obj.ccy = symbolsManager.GetTranslatedSymbolById(wInfo[eWithdrawalView.symbolID]);
                obj.amount = wInfo[eWithdrawalView.amount];

                baseOrder.ShowMessageResult([obj], null, null, properties);
            }

            function hasRecords() {
                return ((pendingWithdrawalCollection.Values().length > 0) || (processingWithdrawalCollection.Values().length > 0));
            }

            function togglePendingWithdrawalGrid() {
                data.isPendingWithdrawalGridVisible(!data.isPendingWithdrawalGridVisible());
            }

            function viewPrintWithdrawalHandler(withdrawalID) {
                if (isValidWithdrawal()) {
                    viewModelsManager.VManager.SwitchViewVisible(eForms.ViewAndPrintWithdrawal, { iD: withdrawalID });
                    ko.postbox.publish('trading-event', 'withdrawal-print'); 
                }
            }

            function isValidWithdrawal() {
                return !((viewModelsManager.VManager.ActiveFormType() == eForms.Withdrawal ||
                        viewModelsManager.VManager.ActiveFormType() == eForms.ViewAndPrintWithdrawal) &&
                        !customer.prop.isDemo && hasRecords());
            }

            function dispose() {
                parent.dispose.call(self);
                stop();
            }

            return {
                Init: init,
                dispose: dispose,
                PendingWithdrawals: pendingWithdrawalCollection.Values,
                ProcessWithdrawals: processingWithdrawalCollection.Values,
                Data: data,
                CancelPendingWithdrawal: onCancelPendingWithdrawal,
                CancelProcessingWithdrawal: onCancelProcessingWithdrawal,
                TotalAmountPendingWithdrawal: data.totalAmountPendingWithdrawal,
                DefaultCcy: data.defaultCcy,
                IsPendingWithdrawalGridVisible: data.isPendingWithdrawalGridVisible,
                TogglePendingWithdrawalGrid: togglePendingWithdrawalGrid,
                ViewPrintWithdrawalHandler: viewPrintWithdrawalHandler
            };
        });

        var createViewModel = function (params) {
            var viewModel = new PendingWithdrawalsViewModel(params);

            viewModel.Init(initConfiguration.PendingWithdrawalConfiguration);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
)