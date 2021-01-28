/* eslint no-alert: 0*/
define(
    "deviceviewmodels/accountstatement/fixpositionviewmodel",
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer',
        'dataaccess/Backoffice/dalAccountStatement',
        'customEnums/ViewsEnums'
    ],
    function FixPositionDef(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            customer = require("initdatamanagers/Customer"),
            dalAccountStatement = require("dataaccess/Backoffice/dalAccountStatement");

        var FixPositionViewModel = general.extendClass(KoComponentViewModel,
            function FixPositionViewModel() {
                var self = this,
                    parent = this.parent, // inherited from KoComponentViewModel
                    data = this.Data,
                    marginError = 12,
                    alreadyDeleted = 0; // inherited from KoComponentViewModel

                var init = function () {
                    parent.init.call(self); // inherited from KoComponentViewModel

                    setObservables();
                };

                function setObservables() {
                    var args = viewModelsManager.VManager.GetViewArgs(eViewTypes.vFixPosition);

                    data.isSaveSpinnerOn = ko.observable(false);
                    data.isFormVisible = ko.observable(true);
                    data.doneText = ko.observable("");
                    data.accountNumber = ko.observable(customer.prop.accountNumber);
                    data.position = ko.observable(args.id);
                    data.mode = ko.observable();
                }

                function onClickSave() {
                    if (general.isNullOrUndefined(data.position())) {
                        alert(Dictionary.GetItem('txtNoPosition', 'AccountStatementBackOffice'));
                    }
                    else if (general.isNullOrUndefined(data.mode())) {
                        alert(Dictionary.GetItem('txtNoAction', 'AccountStatementBackOffice'));
                    }
                    else {
                        if (parseInt(data.mode()) === eFixPosition.deletePosition) {
                            dalDeletePosition();
                        } else {
                            dalRestorePosition(0);
                        }
                    }
                }

                function dalDeletePosition() {
                    var params = {
                        PositionNumber: data.position()
                    };

                    data.isSaveSpinnerOn(true);

                    dalAccountStatement
                        .deletePosition(params)
                        .then(onResponseDeletePosition)
                        .fail(function () { data.isSaveSpinnerOn(false); })
                        .done();
                }

                function dalRestorePosition(retryCounter) {
                    var params = {
                        PositionNumber: data.position(),
                        RetryCounter: retryCounter
                    };

                    data.isSaveSpinnerOn(true);

                    dalAccountStatement
                        .restorePosition(params)
                        .then(onResponseRestorePosition)
                        .fail(function () { data.isSaveSpinnerOn(false); })
                        .done();
                }

                function onResponseDeletePosition(response) {
                    data.isSaveSpinnerOn(false);

                    if (!general.isNullOrUndefined(response) && response.Status === eOperationStatus.Success) {
                        if (response.Result === alreadyDeleted) {
                            alert(Dictionary.GetItem('txtPositionAlreadyDeleted', 'AccountStatementBackOffice'));
                        }
                        else {
                            data.doneText(Dictionary.GetItem('txtDoneAlert', 'AccountStatementBackOffice'));
                            data.isFormVisible(false);
                        }
                    }
                    else {
                        alert(Dictionary.GetItem('txtFailedAlert', 'AccountStatementBackOffice'));
                    }
                }

                function onResponseRestorePosition(response) {
                    data.isSaveSpinnerOn(false);

                    if (!general.isNullOrUndefined(response) && !general.isNullOrUndefined(response.Result) && response.Status === eOperationStatus.Success) {
                        if (response.Result.ResponseID === marginError) {
                            if (confirm(response.Result.ResponseText)) {
                                dalRestorePosition(1);
                            }
                        }
                        else {
                            data.doneText(response.Result.ResponseText);
                            data.isFormVisible(false);
                        }
                    }
                    else {
                        alert(Dictionary.GetItem('txtFailedAlert', 'AccountStatementBackOffice'));
                    }
                }

                return {
                    init: init,
                    Data: data,
                    onClickSave: onClickSave,
                };
            });

        var createViewModel = function () {
            var viewModel = new FixPositionViewModel();

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
