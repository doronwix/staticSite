/* eslint no-alert: 0*/
define("deviceviewmodels/accountstatement/generalaccountactionsviewmodel", [
    'require',
    'knockout',
    'handlers/general',
    'helpers/KoComponentViewModel',
    'initdatamanagers/Customer',
    'dataaccess/Backoffice/dalAccountStatement',
    'Q',
],
    function GeneralAccountActionsViewModelClass(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            customer = require('initdatamanagers/Customer'),
            Q = require('Q'),
            dalAccountStatement = require("dataaccess/Backoffice/dalAccountStatement");

        var GeneralAccountActionsViewModel = general.extendClass(KoComponentViewModel,
            function GeneralAccountActionsViewModel() {
                var self = this,
                    parent = this.parent, // inherited from KoComponentViewModel
                    data = this.Data, // inherited from KoComponentViewModel
                    savedComment = '',
                    defaultCcy = '',
                    savedAccountNumberOther,
                    currenciesSymbolTypeId = 5,
                    txtCommentKeyPart = 'txtComment',
                    actionRadioGroup = {
                        credit: 'credit',
                        debit: 'debit'
                    };

                function init() {
                    parent.init.call(self); // inherited from KoComponentViewModel

                    setObservables();
                    setSubscribers();

                    data.isSaveSpinnerOn(true);

                    getData()
                        .then(function onDataReceived() {
                            data.isSaveSpinnerOn(false);
                        })
                        .done();
                }

                function getData() {
                    return Q.all(
                        [
                            getLiquidityProvider(),
                            getSymbols().then(function () {
                                setSelectedSymbol();
                            }),
                            getActionTypes().then(function () {
                                setSelectedActionType();
                            })
                        ]
                    );
                }

                function getSymbols() {
                    return dalAccountStatement.getSymbols().then(function (symbols) {
                        symbols.forEach(function (symbol) {
                            if (symbol.SymbolTypeId === currenciesSymbolTypeId) {
                                data.symbols.push({
                                    symbolId: symbol.SymbolID,
                                    symbolName: symbol.SymbolName
                                });
                            }
                        });
                    });
                }

                function setSelectedSymbol() {
                    var symbol = data.symbols().find(function (s) {
                        return s.symbolName === customer.prop.baseCcyName();
                    });

                    if (!general.isNullOrUndefined(symbol)) {
                        data.selectedToCcy(symbol.symbolName);
                        defaultCcy = symbol.symbolName;
                    }
                }

                function getLiquidityProvider() {
                    return dalAccountStatement.getLiquidityProvider().then(function (liquidityProvider) {
                        if (!general.isNullOrUndefined(liquidityProvider)) {
                            savedAccountNumberOther = liquidityProvider.AccountNumberOther;
                            data.accountNumberOther(savedAccountNumberOther);
                            data.providerName(liquidityProvider.ProviderName);
                        }
                    });
                }

                function getActionTypes() {
                    return dalAccountStatement.getGeneralActionTypes().then(function (actionTypes) {
                        actionTypes.forEach(function (actionType) {
                            data.actionTypes.push({
                                typeId: actionType.TypeId,
                                typeName: actionType.TypeName,
                                allowDebit: actionType.AllowDebit,
                                allowCredit: actionType.AllowCredit,
                                nostro: actionType.Nostro
                            });
                        });
                    });
                }

                function setSelectedActionType() {
                    data.selectedActionType(data.actionTypes()[0]);
                }

                function setObservables() {
                    data.isSaveSpinnerOn = ko.observable(false);
                    data.isFormVisible = ko.observable(true);
                    data.accountNumber = ko.observable(customer.prop.accountNumber);
                    data.accountNumberOther = ko.observable();
                    data.providerName = ko.observable();
                    data.symbols = ko.observableArray([]);
                    data.actionTypes = ko.observableArray([]);
                    data.actionGroup = ko.observable(false);
                    data.comment = ko.observable();
                    data.hasDefaultComment = ko.observable(false);
                    data.selectedActionType = ko.observable();
                    data.selectedToCcy = ko.observable();
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

                function setSubscribers() {
                    self.subscribeTo(data.selectedActionType, function (actionType) {
                        if (!general.isNullOrUndefined(actionType)) {
                            setComment(actionType.typeId);
                            setAccountNumberOther(actionType.nostro);
                        }

                        resetAmountAndCurrency();
                        resetDebitAndCredit();
                    });
                }

                function resetAmountAndCurrency() {
                    data.amount(null);
                    data.selectedToCcy(defaultCcy);
                }

                function resetDebitAndCredit() {
                    var selectedAction = data.selectedActionType();

                    if (!general.isNullOrUndefined(selectedAction) && (selectedAction.allowDebit !== selectedAction.allowCredit)) {
                        if (selectedAction.allowDebit) {
                            data.actionGroup(actionRadioGroup.debit);
                        } else if (selectedAction.allowCredit) {
                            data.actionGroup(actionRadioGroup.credit);
                        }
                    } else {
                        data.actionGroup(false);
                    }
                }

                function setAccountNumberOther(nostro) {
                    if (nostro === false) {
                        data.accountNumberOther(0);
                    } else {
                        data.accountNumberOther(savedAccountNumberOther);
                    }
                }

                function setComment(actionTypeID) {
                    var key = txtCommentKeyPart + actionTypeID;

                    if (!Dictionary.ValueIsEmpty(key, 'AccountStatementBackOffice')) {
                        var formatedComment = String.format(Dictionary.GetItem(key, 'AccountStatementBackOffice'), data.accountNumber());
                        savedComment = formatedComment;
                        data.comment(formatedComment);
                        data.hasDefaultComment(true);
                    } else {
                        savedComment = '';
                        data.comment('');
                        data.hasDefaultComment(false);
                    }
                }

                function getAmount() {
                    var amount = 0;

                    if (data.actionGroup() === actionRadioGroup.credit) {
                        amount = parseFloat(data.amount());
                    }

                    if (data.actionGroup() === actionRadioGroup.debit) {
                        amount = -1 * parseFloat(data.amount());
                    }

                    return amount;
                }

                function onClickSave() {
                    if (general.isEmptyValue(data.amount()) || data.amount() === 0) {
                        alert(Dictionary.GetItem('txtAmountMissing', 'AccountStatementBackOffice'));
                        return;
                    }

                    if (data.comment() != savedComment && !general.isEmptyValue(savedComment)) {
                        if (!confirm(Dictionary.GetItem('txtConfirmComment', 'AccountStatementBackOffice'))) {
                            return;
                        }
                    }

                    if (data.actionGroup() === false) {
                        alert(Dictionary.GetItem('txtCreditOrDeposit', 'AccountStatementBackOffice'));
                        return;
                    }

                    var generalRequest = {
                        NostroAccountNumber: data.accountNumberOther(),
                        AccountTypeID: data.selectedActionType().typeId,
                        Currency: data.selectedToCcy(),
                        Amount: getAmount(),
                        Comment: { Text: data.comment(), HasDefaultComment: data.hasDefaultComment() }
                    };

                    data.isSaveSpinnerOn(true);

                    dalAccountStatement.saveGeneralActions(generalRequest)
                        .then(onSaveGeneralActions)
                        .fail(function () { data.isSaveSpinnerOn(false); })
                        .done();
                }

                function onSaveGeneralActions(response) {
                    data.isSaveSpinnerOn(false);

                    if (!general.isNullOrUndefined(response) && response.Status === eOperationStatus.Success) {
                        data.isFormVisible(false);
                    } else {
                        alert(Dictionary.GetItem('txtFailedAlert', 'AccountStatementBackOffice'));
                    }
                }

                return {
                    init: init,
                    Data: data,
                    onClickSave: onClickSave
                };
            });

        var createViewModel = function () {
            var viewModel = new GeneralAccountActionsViewModel();

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    });
