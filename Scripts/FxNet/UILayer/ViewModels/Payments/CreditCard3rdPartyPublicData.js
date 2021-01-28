define(
    'viewmodels/Payments/CreditCard3rdPartyPublicData',
    [
        'require',
        'knockout',
        'helpers/ObservableHelper',
        'JSONHelper',
        'dataaccess/dalDeposit',
        'CreditCardManager',
        'viewmodels/Payments/defaultCurrencyManager',
        'initdatamanagers/Customer',
        'Dictionary',
        'initdatamanagers/SymbolsManager',
        'devicemanagers/AlertsManager',
        'fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation',
        'handlers/general'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            vmHelpers = require('helpers/ObservableHelper'),
            JSONHelper = require('JSONHelper'),
            dalDeposit = require('dataaccess/dalDeposit'),
            ccManager = require('CreditCardManager'),
            defaultCurrencyManager = require('viewmodels/Payments/defaultCurrencyManager'),
            customer = require('initdatamanagers/Customer'),
            Dictionary = require('Dictionary'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            amountCurrencyValidation = require('fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation');

        function CreditCardPublicData(paymentTypeVal) {
            defaultCurrencyManager.loadLastUsedCurrency();

            var formObs = {},
                infoObs = {},
                subscribers = [],
                disposables = [],
                paymentType = paymentTypeVal,
                isCreditCardDataLoading = false;

            var self = this;

            var amountValidation = new amountCurrencyValidation({ paymentType: paymentTypeVal /*paymentType*/ });

            function init() {
                initObservables();
                initComputables();

                amountValidation.init();
            }

            function addMinMaxAmountTuCurrencies(curs) {
                return curs.map(function (v) {
                    v.MinAmount = 0;
                    v.MaxAmount = 2000000000;
                    return v
                });
            }

            function initObservables() {
                formObs.isValidationEnabled = ko.observable(false);
                formObs.isValidationEnabled.subscribeTo(ePostboxTopic.EnableCCFormFieldsValidation, true);
                self.tilesSelectedCountry = ko.observable({ id: customer.prop.countryID });
                self.tilesSelectedCountry.subscribeTo(ePostboxTopic.ConcretePaymentSelectedCountry, true);

                infoObs.ccTypes = ko.observableArray([]);

                formObs.isPreviousSelectionUsedCard = ko.observable(false);
                formObs.selectedCCTypeId = ko.observable();
                formObs.concretePaymentType = ko.observable();
                formObs.originalPaymentName = ko.observable();
            }

            function initComputables() {
                formObs.usedCardSelected = ko.computed(function () {
                    var usedCardInfo = ccManager.usedCards.GetItem(formObs.selectedCCTypeId());

                    if (usedCardInfo) {
                        return true;
                    } else {
                        return false;
                    }
                });

                formObs.usedCard = ko.computed(function () {
                    var usedCardInfo = ccManager.usedCards.GetItem(formObs.selectedCCTypeId());

                    if (usedCardInfo) {
                        return usedCardInfo;
                    } else {
                        return null;
                    }
                });

                formObs.selectedCCType = ko.computed(function () {
                    if (formObs.usedCardSelected()) {
                        var usedCardInfo = ccManager.usedCards.GetItem(formObs.selectedCCTypeId());

                        return ccManager.creditCardsType.Get(usedCardInfo.cardTypeID);
                    } else {
                        return ccManager.creditCardsType.Get(formObs.selectedCCTypeId());
                    }
                });

                formObs.selectedCreditCardName = ko.computed(function () {
                    var usedCardInfo = ccManager.usedCards.GetItem(formObs.selectedCCTypeId());

                    if (usedCardInfo) {
                        return ccManager.creditCardsType.Get(usedCardInfo.cardTypeID)
                            ? ccManager.creditCardsType.Get(usedCardInfo.cardTypeID).name
                            : "XXXX " + usedCardInfo.last4;
                    } else {
                        return null;
                    }
                });

                disposables.push(formObs.usedCardSelected);
                disposables.push(formObs.usedCard);
                disposables.push(formObs.selectedCCType);
                disposables.push(formObs.selectedCreditCardName);

                formObs.isValid = ko.validatedObservable(Object.assign({}, formObs, { amount: amountValidation.Data.value })).isValid;
            }

            function start() {
                setDefaultObservables();
                setSubscribers();

                if (!isCreditCardDataLoading) {
                    getCreditCardData();
                }
            }

            function stop() {
                amountValidation.dispose();
                unsetSubscribers();
                general.disposeArray(subscribers);
                general.disposeArray(disposables);

                vmHelpers.CleanKoObservableSimpleObject(formObs);
                vmHelpers.CleanKoObservableSimpleObject(infoObs);
            }

            function setSubscribers() {
                subscribers.push(
                    formObs.selectedCCTypeId.subscribe(function () {
                        setSelectedCardInfo();
                    }));

                subscribers.push(
                    ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, function (newValue) {
                        formObs.concretePaymentType(newValue.concretePaymentType);
                        formObs.originalPaymentName(newValue.originalPaymentName);

                        var ccTypeId = parseInt(newValue.paymentData, 10);

                        if (!isNaN(ccTypeId)) {
                            formObs.selectedCCTypeId(ccTypeId);
                        }

                        var currencies = addMinMaxAmountTuCurrencies(newValue.paymentCurrencies);
                        amountValidation.Data.concretePaymentCurrencies(currencies);
                    }, true));

                subscribers.push(formObs.isValidationEnabled.subscribe(function (wasClicked) {
                    if (wasClicked) {
                        amountValidation.Data.validationOn(true);
                    }
                }));
            }

            function unsetSubscribers() {
                formObs.isValidationEnabled.unsubscribeFrom(ePostboxTopic.EnableCCFormFieldsValidation);
                self.tilesSelectedCountry.unsubscribeFrom(ePostboxTopic.ConcretePaymentSelectedCountry);
            }

            function setDefaultObservables() {
                infoObs.ccTypes([]);
                amountValidation.Data.currencyList([]);

                amountValidation.Data.selectedCurrency('');
                amountValidation.Data.value('');
                amountValidation.Data.value.isModified(false);

                formObs.isValidationEnabled(false);
            }

            function setSelectedCardInfo() {
                var usedCardInfo = ccManager.usedCards.GetItem(formObs.selectedCCTypeId());

                if (usedCardInfo) {
                    fillCurrencyList(usedCardInfo.cardTypeID);
                } else {
                    fillCurrencyList(formObs.selectedCCTypeId());
                }

                setPreselectedCurrency();
                formObs.isValidationEnabled(false);
            }

            function getCreditCardData() {
                isCreditCardDataLoading = true;
                dalDeposit.getCreditCardData(paymentType)
                    .then(onGetCreditCardDataComplete)
                    .fail(general.emptyFn)
                    .done();
            }

            function onGetCreditCardDataComplete(responseText) {
                createCreditCards(responseText);

                if (ccManager.hasData()) {
                    fillCardLists();
                    fillCurrencyList(formObs.selectedCCTypeId());
                    setPreselectedCurrency();
                    formObs.selectedCCTypeId.valueHasMutated();
                }

                isCreditCardDataLoading = false;
            }

            function createCreditCards(responseText) {
                var data = JSONHelper.STR2JSON("CreditCardViewModel/onLoadComplete", responseText);

                if (data.CreditCards.length > 0) {
                    ccManager.loadData(data);
                } else {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert,
                        null,
                        Dictionary.GetItem("paymentMethodUnavailable"),
                        null,
                        { redirectToView: eForms.Quotes });
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            function fillCardLists() {
                infoObs.ccTypes([]);

                var creditCards = fillUsedCardsList().concat(fillCCTypesList());

                infoObs.ccTypes(creditCards);
            }

            function fillCCTypesList() {
                var ccTypesList = ccManager.creditCardsType.Values();

                return ccTypesList.map(function (cc) {
                    return { "shortName": cc.name, "name": cc.name, "typeId": cc.typeID, "images": cc.images, "lang": cc.lang };
                });
            }

            function fillUsedCardsList() {
                var usedCards = ccManager.usedCards;

                if (usedCards && usedCards.Container) {
                    var result = [];
                    var maxCCId = -1;
                    var defaultCCId = 0;

                    usedCards.ForEach(function (id, uc) {
                        if (uc.paymentID > maxCCId)
                            maxCCId = uc.paymentID;
                        if (uc.isDefault)
                            defaultCCId = uc.paymentID;
                    });

                    defaultCCId = getDefaultCCId(maxCCId, defaultCCId);

                    usedCards.ForEach(function (id, uc) {
                        var card = ccManager.creditCardsType.Get(uc.cardTypeID);

                        if (card) {
                            var name = card.name + " " + uc.last4;
                            var paymentId = uc.paymentID;
                            var obj = {
                                "shortName": shortName(name, uc.last4),
                                "name": name,
                                "typeId": paymentId,
                                "isDefault": uc.paymentID === defaultCCId ? 1 : 0
                            };

                            if (obj.isDefault)
                                result.unshift(obj);
                            else
                                result.push(obj);
                        }
                    });

                    return result;
                }
                return [];
            }

            function getDefaultCCId(maxCCId, defaultCCId) {
                return defaultCCId ? defaultCCId : maxCCId;
            }

            function shortName(name, last4) {
                if (name.indexOf('Visa') != -1) {
                    name = name.split(",")[0] + ' ' + last4;
                }

                return name;
            }

            function clearUIFields() {
                amountValidation.Data.value("");
            }

            function fillCurrencyList(ccTypeId) {
                var currentCurrency = amountValidation.Data.selectedCurrency();
                var ccType = ccManager.creditCardsType.Get(ccTypeId);

                if (ccType) {
                    var cl = ccType.ccyUIOrder.map(function (ccyUIOrder) {
                        return { "name": symbolsManager.GetTranslatedSymbolById(ccyUIOrder), "orderId": ccyUIOrder };
                    });

                    amountValidation.Data.currencyList(addMinMaxAmountTuCurrencies(cl));
                }

                if (amountValidation.Data.selectedCurrency() !== currentCurrency) {
                    clearUIFields();
                }
            }

            function setPreselectedCurrency() {
                defaultCurrencyManager
                    .getDefaultCurrency(amountValidation.Data.currencyList())
                    .then(function (currency) {
                        amountValidation.Data.selectedCurrency(currency);
                        amountValidation.Data.selectedCurrency.valueHasMutated();
                    });
            }

            return {
                Form: formObs,
                Info: infoObs,
                Amount: amountValidation,
                Init: init,
                Start: start,
                Stop: stop
            };
        }

        return CreditCardPublicData;
    }
);
