/* eslint no-alert: 0 */
define("deviceviewmodels/deposit/wiretransfereditviewmodel", [
    'require',
    'knockout',
    'handlers/general',
    'helpers/KoComponentViewModel',
    'dataaccess/Backoffice/dalWireTransfer',
    'LoadDictionaryContent!DepositBackOffice'
],
function (require) {

    var ko = require("knockout"),
        general = require('handlers/general'),
        dalWireTransfer = require("dataaccess/Backoffice/dalWireTransfer"),
        KoComponentViewModel = require('helpers/KoComponentViewModel');

    var WireTransferEditViewModel = general.extendClass(KoComponentViewModel, function WireTransferEditViewModelClass(params) {
        var self = this,
            parent = this.parent, // inherited from KoComponentViewModel
            data = this.Data; // inherited from KoComponentViewModel

        var init = function () {
            parent.init.call(self); // inherited from KoComponentViewModel

            setObservables();
            setSubscribers();
            setComputables();
        };

        function setObservables() {
            data.selectedWireTransfer = params.selectedWireTransfer;
            data.selectedComment = ko.observable();
            data.isCancelSpinnerOn = ko.observable(false);
            data.isSaveCommentSpinnerOn = ko.observable(false);
            data.isApproveViewVisible = ko.observable(false);
        }

        function setSubscribers() {
            self.subscribeTo(data.selectedWireTransfer, function (wireTransfer) {
                if (wireTransfer) {
                    data.selectedComment("-- Selected bank --");
                    data.selectedComment(wireTransfer.comment);
                }
            });
        }

        function setComputables() {
            data.showCancelButton = self.createComputed(function () {
                return data.selectedWireTransfer() && (data.selectedWireTransfer().statusId === eWireTransferStatus.Approved || data.selectedWireTransfer().statusId === eWireTransferStatus.Pending);
            });

            data.showApproveButton = self.createComputed(function () {
                return data.selectedWireTransfer() && data.selectedWireTransfer().statusId === eWireTransferStatus.Pending;
            });
        }

        function cancelClick() {
            if (data.isCancelSpinnerOn() || data.isSaveCommentSpinnerOn()) {
                return;
            }

            if (!window.confirm("Are you sure?")) {
                return;
            }

            if (data.selectedComment() === "-- Selected bank --") {
                var selectedBank = params.wireTransferBanks().find(function (bank) {
                    return bank.id === data.selectedWireTransfer().bankId;
                });

                data.selectedWireTransfer().comment = selectedBank.fullName;
            }

            var wireTransfer = {
                RecordID: data.selectedWireTransfer().recordId,
                TransferID: data.selectedWireTransfer().transferId,
                DepositingRequestID: data.selectedWireTransfer().depositingRequestId,
                AccountingTransctionID: data.selectedWireTransfer().accountingTransctionId,
                BankID: data.selectedWireTransfer().bankId,
                BankName: data.selectedWireTransfer().bankName,
                CurrencyID: data.selectedWireTransfer().currencyId,
                CurrencyName: data.selectedWireTransfer().currencyName,
                StatusID : data.selectedWireTransfer().statusId,
                Comment: data.selectedComment(),
                ExchangeRate: data.selectedWireTransfer().exchangeRate,
                Amount: data.selectedWireTransfer().amount,
                LastUpdate: general.str2Date(data.selectedWireTransfer().lastUpdate, "d/m/Y H:M"),
                ValueDate: general.str2Date(data.selectedWireTransfer().valueDate, "d/m/Y H:M"),
                IsEdited: data.selectedWireTransfer().isEdited
            };

            data.isCancelSpinnerOn(true);

            dalWireTransfer.insertWireTransferCanceledRequest(wireTransfer)
                .then(onCancelWireTransfer)
                .fail(function () { data.isCancelSpinnerOn(false); })
                .done();
        }

        function saveCommentClick() {
            var wireTransferComment = data.selectedComment(),
                selectedBank;

            if (data.isCancelSpinnerOn() || data.isSaveCommentSpinnerOn()) {
                return;
            }

            if (data.selectedComment() === "-- Selected bank --") {
                selectedBank = params.wireTransferBanks().find(function (bank) {
                    return bank.id === data.selectedWireTransfer().bankId;
                });

                wireTransferComment = selectedBank.fullName;
            }

            data.isSaveCommentSpinnerOn(true);
            dalWireTransfer.saveWireTransferComment(data.selectedWireTransfer().recordId, wireTransferComment)
                .then(onSaveComment)
                .fail(function () { data.isSaveCommentSpinnerOn(false); })
                .done();
        }

        function approveClick() {
            if (data.isCancelSpinnerOn() || data.isSaveCommentSpinnerOn()) {
                return;
            }

            data.isApproveViewVisible(true);
        }

        function onCancelWireTransfer(response) {
            if (response < 0) {
                window.alert("Internal Server Error Occurred, Please try again");
            } else if (response === 0) {
                window.alert("Wire transfer already canceled. Please reload data!")
            } else {
                setTimeout(function () { params.refreshWireTransfer(); }, 2000);
            }

            data.isCancelSpinnerOn(false);
        }

        function onSaveComment(response) {
            if (response === 'false') {
                window.alert("Internal Server Error Occurred, Please try again");
            } else {
                window.alert("Comment saved!");
                params.refreshWireTransfer();
            }

            data.isSaveCommentSpinnerOn(false);
        }

        function dispose() {
            parent.dispose.call(self);  // inherited from KoComponentViewModel
        }

        return {
            init: init,
            dispose: dispose,
            Data: data,
            cancelClick: cancelClick,
            saveCommentClick: saveCommentClick,
            approveClick: approveClick,
            refreshWireTransfer: params.refreshWireTransfer
        };
    });

    var createViewModel = function (params) {
        var viewModel = new WireTransferEditViewModel(params);

        viewModel.init();

        return viewModel;
    };

    return {
        viewModel: { createViewModel: createViewModel }
    };
});