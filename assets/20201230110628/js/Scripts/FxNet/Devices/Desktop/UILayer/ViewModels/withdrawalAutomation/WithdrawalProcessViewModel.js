define(
    'deviceviewmodels/withdrawalautomation/withdrawalprocessviewmodel',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalWithdrawalAutomation',
        'managers/viewsmanager',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'LoadDictionaryContent!DepositBackOffice'
    ],
    function WithdrawalProcessDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            viewsManager = require('managers/viewsmanager'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            dalWithdrawalAutomation = require('dataaccess/dalWithdrawalAutomation'),
            dictionary = require('Dictionary');

        var WithdrawalProcessViewModel = general.extendClass(KoComponentViewModel, function WithdrawalProcessClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            var withdrawalActionResult = {
                Success: 0,
                NoPermission: 1,
                OperationFailedCheckCanceled: 2,
                OperationFailed: 3
            };

            function init(customSettings) {
                parent.init.call(self, customSettings);
                setObservables();

                withdrawalProcess();
            }

            function withdrawalProcess() {
                data.isWithdrawalProcessInProgress(true);
                var args = viewsManager.GetViewArgs(eViewTypes.vWithdrawalProcess);

                if (args.id <= 0) {
                    data.withdrawalProcessMessage(dictionary.GetItem('lblInternalServerError', 'DepositBackOffice'));
                    data.isWithdrawalProcessInProgress(false);
                    return;
                }

                data.withdrawalId(args.id);

                dalWithdrawalAutomation.forceProcessWithdrawal(data.withdrawalId(), function (result) {
                    data.isWithdrawalProcessInProgress(false);

                    updateWithdrawalProcessMessage(result);
                });
            }

            function updateWithdrawalProcessMessage(response) {
                var msg = dictionary.GetItem('lblDone', 'DepositBackOffice');

                if (response.Status !== 1) {
                    msg = dictionary.GetItem('lblInternalServerError', 'DepositBackOffice');
                }

                if (response.Result !== withdrawalActionResult.Success) {
                    msg = dictionary.GetItem('lblWithdrawalFailed', 'DepositBackOffice');

                    switch (response.Result) {
                        case withdrawalActionResult.NoPermission:
                            msg += dictionary.GetItem('lblNoPermission', 'DepositBackOffice');
                            break;

                        case withdrawalActionResult.OperationFailed:
                            msg += dictionary.GetItem('lblOperationFailed', 'DepositBackOffice');
                            break;

                        default:
                            msg += dictionary.GetItem('lblUnknownReason', 'DepositBackOffice');
                            break;
                    }
                }

                data.withdrawalProcessMessage(msg);
            }

            function setObservables() {
                data.withdrawalId = ko.observable(0);
                data.isWithdrawalProcessInProgress = ko.observable(false);
                data.withdrawalProcessMessage = ko.observable('');
            }

            return {
                init: init,
                Data: data
            };
        });


        var createViewModel = function () {
            var viewModel = new WithdrawalProcessViewModel();

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
/*eslint-enable no-alert, no-confirm */
