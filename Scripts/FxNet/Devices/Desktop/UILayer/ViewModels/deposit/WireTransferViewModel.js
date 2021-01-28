/* globals eWireTransferStatuses */
define("deviceviewmodels/deposit/wiretransferviewmodel", [
    'require',
    'knockout',
    'handlers/general',
    'devicemanagers/ViewModelsManager',
    'helpers/KoComponentViewModel',
    'dataaccess/Backoffice/dalWireTransfer',
    'LoadDictionaryContent!DepositBackOffice'
],
function (require) {

    var ko = require("knockout"),
        general = require('handlers/general'),
        viewModelsManager = require('devicemanagers/ViewModelsManager'),
        KoComponentViewModel = require('helpers/KoComponentViewModel'),
        dalWireTransfer = require("dataaccess/Backoffice/dalWireTransfer");

    var WireTransferViewModel = general.extendClass(KoComponentViewModel,
        function WireTransferViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                selectedWireTransferId;

            var init = function () {
                parent.init.call(self); // inherited from KoComponentViewModel

                var args = viewModelsManager.VManager.GetViewArgs(eViewTypes.vWireTransfers);
                selectedWireTransferId = args.id;

                setObservables();
                setSubscribers();

                refreshWireTransfer();

                dalWireTransfer.getWireTransferBanks().then(onGetWireTransferBanks).done();
            };

            function setObservables() {
                data.selectedWireTransferId = ko.observable().extend({ notify: "always" });
                data.wireTransfers = ko.observableArray([]);
                data.wireTransfersSelectedOrPending = ko.observableArray([]);
                data.wireTransferHistoryList = ko.observableArray([]);
                data.selectedWireTransfer = ko.observable();
                data.wireTransferBanks = ko.observableArray([]);
                data.isAllowedAccess = ko.observable(true);
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedWireTransferId, function (id) {
                    data.selectedWireTransfer(data.wireTransfersSelectedOrPending().find(function (w) {
                        return w.transferId === id;
                    }));

                    data.wireTransferHistoryList(data.wireTransfers().filter(function (w) {
                        return w.transferId === id;
                    }));
                });
            }

            function refreshWireTransfer () {
                dalWireTransfer.getWireTransferInfos()
                    .then(onGetWiretransfers)
                    .fail(onGetWiretransfersError)
                    .done();
            }

            function onGetWiretransfers(wireTransfers) {
                var arr = [];
                wireTransfers.forEach(function (wiretransfer) {
                    var wireTransferRow = {
                        recordId: wiretransfer.RecordID,
                        transferId: wiretransfer.TransferID,
                        depositingRequestId: wiretransfer.DepositingRequestID,
                        accountingTransctionId: wiretransfer.AccountingTransctionID,
                        bankId: wiretransfer.BankID,
                        currencyId: wiretransfer.CurrencyID,
                        statusId: wiretransfer.StatusID,
                        statusName: wiretransfer.StatusName,
                        isEdited: wiretransfer.IsEdited,
                        accountNumber: wiretransfer.AccountNumber,
                        accountName: wiretransfer.AccountName,
                        bankName: wiretransfer.BankName,
                        currencyName: wiretransfer.CurrencyName,
                        amount: wiretransfer.Amount,
                        exchangeRate: wiretransfer.ExchangeRate,
                        valueDate: general.isNullOrUndefined(wiretransfer.ValueDate) ? "" : formatDate(wiretransfer.ValueDate),
                        lastUpdate: formatDate(wiretransfer.LastUpdate),
                        dealerName: wiretransfer.DealerName,
                        comment: wiretransfer.Comment
                    };

                    arr.push(wireTransferRow);
                });

                data.wireTransfers(arr);

                var wireTransfersForGrid = data.wireTransfers().filter(function (w) {
                    return w.statusId === eWireTransferStatus.Pending && w.isEdited === false;
                });

                var wireTransfersForTransferId = data.wireTransfers().filter(function(w) {
                    return w.transferId === selectedWireTransferId;
                });
                wireTransfersForTransferId.sort(function (l, r) { return l.recordId < r.recordId ? 1 : -1; });

                if (wireTransfersForTransferId[0] && wireTransfersForTransferId[0].statusId !== eWireTransferStatus.Pending) {
                    wireTransfersForGrid.push(wireTransfersForTransferId[0]);
                }

                wireTransfersForGrid.sort(function (l, r) { return l.transferId > r.transferId ? 1 : -1; });
                data.wireTransfersSelectedOrPending(wireTransfersForGrid);

                if (general.isNullOrUndefined(selectedWireTransferId)) {
                    data.selectedWireTransfer(wireTransfersForGrid[0]);
                    data.selectedWireTransferId(wireTransfersForGrid[0].transferId);
                } else {
                    data.selectedWireTransferId(selectedWireTransferId);
                }
            }

            function onGetWiretransfersError() {
                data.isAllowedAccess(false);
            }

            function onGetWireTransferBanks(banks) {
                var arr = [];
                banks.forEach(function (bank) {
                    var bankRow = {
                        id: bank.BankID,
                        name: bank.Name,
                        fullName: bank.FullName,
                        brokerId: bank.BrokerID,
                        bankCurrencies: bank.WireTransferBankCurrencies
                    };

                    arr.push(bankRow);
                });

                data.wireTransferBanks(arr);
            }

            function formatDate(dateStr) {
                var date = new Date(dateStr);
                return date.ExtractDate() + ' ' + date.ExtractFullTime();
            }

            return {
                init: init,
                Data: data,
                refreshWireTransfer: refreshWireTransfer
            };
        });

    var createViewModel = function () {
        var viewModel = new WireTransferViewModel();

        viewModel.init();

        return viewModel;
    };

    return {
        viewModel: { createViewModel: createViewModel }
    };
});
