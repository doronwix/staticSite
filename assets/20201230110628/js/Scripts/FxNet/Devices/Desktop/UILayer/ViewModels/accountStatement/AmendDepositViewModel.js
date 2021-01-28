/* eslint no-alert: 0*/
define(
    "deviceviewmodels/accountstatement/amenddepositviewmodel",
    [
        'require',
        'knockout',
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer',
        'dataaccess/Backoffice/dalAccountStatement',
        'dataaccess/dalConversion',
        'handlers/general'
    ],
    function AmendDepositDef(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            customer = require('initdatamanagers/Customer'),
            dalAccountStatement = require("dataaccess/Backoffice/dalAccountStatement");

        var AmendDepositViewModel = general.extendClass(KoComponentViewModel,
            function AmendDepositClass() {
                var self = this,
                    parent = this.parent, // inherited from KoComponentViewModel
                    data = this.Data, // inherited from KoComponentViewModel
                    savedComment = '',
                    savedAccountNumberOther,
                    actions = {
                        None: -1,
                        Chargeback: 21,
                        CancelDeposit: 49,
                        CancelChargeback: 65
                    },
                    actionLabels = {},
                    commentTemplates = {},
                    defaultAmountValues = {};

                function init(settings) {
                    parent.init.call(self); // inherited from KoComponentViewModel

                    setActionLabels();
                    setCommentTemplates();
                    setObservables(settings);
                    setComputables();
                    setSubscribers();

                    getData();
                }

                function setActionLabels() {
                    actionLabels[actions.None] = 'lblAmount';
                    actionLabels[actions.Chargeback] = 'lblAmountToAmendDebit';
                    actionLabels[actions.CancelDeposit] = 'lblAmountToAmendDebit';
                    actionLabels[actions.CancelChargeback] = 'lblAmountToAmendCredit';
                }

                function setCommentTemplates() {
                    commentTemplates[actions.None] = '{0}';
                    commentTemplates[actions.Chargeback] = 'txtCommentChargeback';
                    commentTemplates[actions.CancelDeposit] = 'txtCommentCancelDeposit';
                    commentTemplates[actions.CancelChargeback] = 'txtCommentCancelChargeback';
                }

                function showSpinner() {
                    data.isSaveSpinnerOn(true);
                }

                function hideSpinner() {
                    data.isSaveSpinnerOn(false);
                }

                function getData() {
                    showSpinner();

                    getActionTypes()
                        .then(setSelectedActionType)
                        .then(hideSpinner)
                        .done();
                }

                function getActionTypes() {
                    return dalAccountStatement.getAmendDepositActionTypes(data.depositId())
                        .then(function (result) {
                            result.AccountTypes.forEach(function (actionType) {
                                data.actionTypes.push({
                                    typeId: actionType.TypeId,
                                    typeName: actionType.TypeName,
                                    allowDebit: actionType.AllowDebit,
                                    allowCredit: actionType.AllowCredit,
                                    nostro: actionType.Nostro
                                });
                            });

                            defaultAmountValues = result.DefaultValues;
                        });
                }

                function setSelectedActionType() {
                    data.selectedActionType(data.actionTypes()[0]);
                }

                function setObservables(args) {
                    data.isSaveSpinnerOn = ko.observable(false);
                    data.isFormVisible = ko.observable(true);
                    data.accountNumber = ko.observable(customer.prop.accountNumber);
                    data.depositId = ko.observable(args.di || 0); // TO GET FROM QUERY STRING
                    data.depositCcy = ko.observable(args.dc || 'USD'); // TO GET FROM QUERY STRING
                    data.accountNumberOther = ko.observable();
                    data.actionTypes = ko.observableArray([]);
                    data.comment = ko.observable();
                    data.hasDefaultComment = ko.observable(false);
                    data.selectedActionType = ko.observable();
                    data.amount = ko.observable().extend({
                        toNumericLength: {
                            ranges: [
                                {
                                    from: 0,
                                    to: Number.MAX_SAFE_INTEGER,
                                    decimalDigits: 2
                                }
                            ]
                        }
                    });
                }

                function setComputables() {
                    data.amountLabel = self.createComputed(function () {
                        var action = data.selectedActionType() || {},
                            actionTypeId = action.typeId || -1;

                        return actionLabels[actionTypeId];
                    });
                }

                function setSubscribers() {
                    self.subscribeTo(data.selectedActionType, function (actionType) {
                        if (!general.isNullOrUndefined(actionType)) {
                            setAmount(actionType.typeId);
                            setComment(actionType.typeId);
                            setAccountNumberOther(actionType.nostro);
                        }
                    });
                }

                function setAmount(actionTypeId) {
                    switch (actionTypeId) {
                        case actions.Chargeback:
                            data.amount(defaultAmountValues.ChargebackAmount);
                            break;

                        case actions.CancelChargeback:
                            data.amount(defaultAmountValues.CancelChargebackAmount);
                            break;

                        case actions.CancelDeposit:
                            data.amount(defaultAmountValues.RemainingAmount);
                            break;

                        default:
                            data.amount(0);
                            break;
                    }
                }

                function setAccountNumberOther(nostro) {
                    if (nostro === false) {
                        data.accountNumberOther(0);
                    } else {
                        data.accountNumberOther(savedAccountNumberOther);
                    }
                }

                function setComment(actionTypeId) {
                    data.comment(String.format(Dictionary.GetItem(commentTemplates[actionTypeId], 'AccountStatementBackOffice'), defaultAmountValues.DepositTransId));
                }

                function onClickSave() {
                    if (general.isEmptyValue(data.amount()) || data.amount() === 0) {
                        alert(Dictionary.GetItem('txtAmountMissing', 'AccountStatementBackOffice'));
                        return;
                    }

                    if (data.selectedActionType().typeId == actions.Chargeback &&
                        data.amount() !== defaultAmountValues.ChargebackAmount) {
                        if (!confirm('This amount is different than the remaining deposit amount, do you wish to proceed?')) {
                            return;
                        }
                    }

                    if (data.comment() != savedComment && !general.isEmptyValue(savedComment)) {
                        if (!confirm(Dictionary.GetItem('txtConfirmComment', 'AccountStatementBackOffice'))) {
                            return;
                        }
                    }

                    var generalRequest = {
                        NostroAccountNumber: data.accountNumberOther(),
                        AccountTypeID: data.selectedActionType().typeId,
                        Currency: data.depositCcy(),
                        AccountBaseCurrency: customer.prop.baseCcyName(),
                        Amount: getAmount(),
                        Comment: { Text: data.comment(), HasDefaultComment: data.hasDefaultComment() },
                        RequestId: data.depositId(),
                        AmountDefaultValues: defaultAmountValues
                    };

                    showSpinner();

                    dalAccountStatement.saveAmendDeposit(generalRequest)
                        .then(onSaveAmendDeposit)
                        .fail(hideSpinner)
                        .done();
                }

                function onSaveAmendDeposit(response) {
                    hideSpinner();

                    if (!general.isNullOrUndefined(response) && response.Status === eOperationStatus.Success) {
                        data.isFormVisible(false);
                    } else if (response.Result) {
                        alert(response.Result);
                    } else {
                        alert(Dictionary.GetItem('txtFailedAlert', 'AccountStatementBackOffice'));
                    }
                }

                function getAmount() {
                    var amount = 0;

                    if (data.selectedActionType().typeId === actions.Chargeback || data.selectedActionType().typeId === actions.CancelDeposit)
                        amount = -1 * parseFloat(data.amount());
                    else
                        amount = parseFloat(data.amount());

                    return amount;

                }

                return {
                    init: init,
                    Data: data,
                    onClickSave: onClickSave
                };
            });

        var createViewModel = function (settings) {
            var viewModel = new AmendDepositViewModel();

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    });
