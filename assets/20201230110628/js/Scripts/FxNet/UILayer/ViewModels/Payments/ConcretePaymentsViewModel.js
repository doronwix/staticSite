/* globals  eConcretePaymentCategory */
"use strict";
define(
    'viewmodels/Payments/ConcretePaymentsViewModel',
    [
        'require',
        'knockout',
        'Q',
        'dataaccess/dalDeposit',
        'initdatamanagers/Customer',
        'configuration/initconfiguration',
        'devicemanagers/AlertsManager',
        'managers/CustomerProfileManager',
        'viewmodels/Payments/ConcretePaymentBehavior',
        'managers/viewsmanager',
        'Dictionary',
        'deviceviewmodels/PaymentSelectionBehaviors',
        'deposit/CreditCard/CreditCardTypesManager',
        'global/UrlResolver',
        'JSONHelper',
        'StateObject!Deposit',
        'handlers/general',
        'enums/paymentsconfigsettings',
        'enums/enums'
    ],
    function (require) {
        var ko = require('knockout'),
            Q = require('Q'),
            dalDeposit = require('dataaccess/dalDeposit'),
            customer = require('initdatamanagers/Customer'),
            initConfiguration = require('configuration/initconfiguration'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            ConcretePaymentsBehavior = require('viewmodels/Payments/ConcretePaymentBehavior'),
            ViewsManager = require('managers/viewsmanager'),
            Dictionary = require('Dictionary'),
            PaymentSelectionBehaviors = require('deviceviewmodels/PaymentSelectionBehaviors'),
            creditCardTypesManager = require('deposit/CreditCard/CreditCardTypesManager'),
            urlResolver = require('global/UrlResolver'),
            jsonHelper = require("JSONHelper"),
            general = require('handlers/general'),
            lastPaymentMethodCache = require('StateObject!Deposit'),
            paymentsConfigSettings = require('enums/paymentsconfigsettings'),
            useDeepLinkPreselectedPayment = true;

        function ConcretePaymentsViewModel() {
            var formObs = {
                selectedCategory: ko.observable(),
                selectedCountry: ko.observable()
                    .extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } }),
                lastHandledCountry: ko.observable(),
                paymentsConfigSettings: paymentsConfigSettings
            },
                infoObs = {
                    payments: ko.observableArray([]),
                    categories: ko.observableArray([]),
                    countries: ko.observableArray([]),
                    allowedCreditCards: ko.observableArray([]),
                    currentPayment: ko.observable(),
                    customerHasMissingInfo: ko.observable(customer.prop.hasMissingInformation),
                    arePaymentsLoading: ko.observable(false),
                    isLoading: ko.observable(true)
                },
                shouldResetPaymentsFormPosition = ko.observable(false).extend({ notify: 'always' }),
                resetPaymentsFormPositionOn = ko.computed(function () {
                    if (!general.isNullOrUndefined(formObs.selectedCountry()) && general.isNullOrUndefined(formObs.selectedCategory())) {
                        shouldResetPaymentsFormPosition(true);
                    }
                }),
                subscribers = [],
                concretePaymentCategoryNames = ['rcmd', 'cc', 'epayment', 'bank', 'prepaid', 'last'],
                supportLastPaymentCategory = initConfiguration.PaymentsConfiguration.supportLastPaymentCategory,
                redirectToLastPaymentOnLoad = initConfiguration.PaymentsConfiguration.redirectToLastPaymentOnLoad,
                viewTypeForExistingCC = initConfiguration.PaymentsConfiguration.viewTypeForExistingCC,
                showAllowedCreditCards = initConfiguration.PaymentsConfiguration.showAllowedCreditCards,
                concretePaymentsBehavior = new ConcretePaymentsBehavior();

            function handleCountryChanged() {
                infoObs.arePaymentsLoading(true);
                formObs.lastHandledCountry(formObs.selectedCountry());

                Q.all([
                    dalDeposit.getConcretePayments(formObs.selectedCountry().id, parseInt(customer.prop.countryID), customer.prop.brokerID),
                    dalDeposit.getUserDepositDetails(null)
                ])
                    .then(delayedGetPaymentsHandler)
                    .then(showSuggestedPayment)
                    .done();
            }

            function setSubscribers() {
                subscribers.push(formObs.selectedCountry.subscribe(function () {
                    if (formObs.selectedCountry()) {
                        handleCountryChanged();
                    }
                }));

                subscribers.push(ko.postbox.subscribeSingleton(ePostboxTopic.ReloadConcretePayments, function () {
                    shouldResetPaymentsFormPosition(true);
                    handleCountryChanged();
                }));

                subscribers.push(ko.postbox.subscribeSingleton(ePostboxTopic.MissingInfo, function (value) {
                    infoObs.customerHasMissingInfo(value);
                }));
            }

            function getDefaultCategory(currentIndex, expectedIndex, supportsLastPayment) {
                if (supportsLastPayment && currentIndex === expectedIndex) {
                    return eConcretePaymentCategory.LastPayment;
                }

                return eConcretePaymentCategory.Recommended;
            }

            function delayedGetPaymentsHandler(result) {
                if (formObs.lastHandledCountry() !== formObs.selectedCountry()) {
                    formObs.lastHandledCountry(formObs.selectedCountry());
                    formObs.selectedCountry.valueHasMutated();
                }
                else {
                    getPaymentsHandler(result);
                    ko.postbox.publish(ePostboxTopic.ConcretePaymentSelectedCountry, formObs.selectedCountry());
                }

                infoObs.arePaymentsLoading(false);
            }

            function showSuggestedPayment() {
                if (useDeepLinkPreselectedPayment !== true || infoObs.payments().length <= 0) {
                    return;
                }

                useDeepLinkPreselectedPayment = false;

                var viewArguments = ViewsManager.GetActiveFormViewProperties(eViewTypes.vPaymentTypes).args;

                if (general.isObjectType(viewArguments) && general.isStringType(viewArguments.payment)) {

                    var deepLinkPreselectedPayment = viewArguments.payment;

                    var payment = infoObs.payments().find(function checkPaymentName(p) { return p.originalName === deepLinkPreselectedPayment; });

                    if (!payment) {
                        return;
                    }

                    setTimeout(goToPaymentView, 200, payment);
                }
            }

            function getLastAvailableUserActionIndex(paymentlist, userActions) {
                for (var index = userActions.length - 1; index >= 0; --index) {
                    var payment = findPaymentDetailsAndIndex(paymentlist, userActions[index]);

                    if (payment) {
                        return index;
                    }
                }

                return -1;
            }

            function findPaymentDetailsAndIndex(paymentList, userAction) {
                for (var index = 0; index < paymentList.length; ++index) {
                    var payment = paymentList[index];

                    if (isMatchingPaymentId(payment, userAction) ||
                        isMatchingCCType(payment, userAction)) {

                        return {
                            details: payment,
                            index: index
                        };
                    }
                }

                return null;
            }

            function isMatchingPaymentId(payment, userAction) {
                return userAction.id &&
                    payment.id === userAction.id;
            }

            function isMatchingCCType(payment, userAction) {
                return !userAction.id &&
                    payment.paymentType === 1 &&
                    payment.paymentDataObject &&
                    payment.paymentDataObject.paymentData === userAction.ccType;
            }

            function updateFirstVisibleCategory(payments, categories, lastPaymentCategorySupported) {
                if (payments.find(function (p) { return p.isRecommended; })) {
                    categories.unshift(eConcretePaymentCategory.Recommended);

                    if (lastPaymentCategorySupported) {
                        categories.unshift(eConcretePaymentCategory.LastPayment);
                    }
                }
            }

            function getPaymentsHandler(result) {
                var parsedPaymentResults = JSONHelper.STR2JSON("ConcretePaymentsViewModel:getPaymentsHandler", result[0]);
                var maxRecommended = parsedPaymentResults.maxRecommended;
                var payments = parsedPaymentResults.payments;
                var categories = parsedPaymentResults.categories;
                var undefinedVar;
                var userActions = JSONHelper.STR2JSON("ConcretePaymentsViewModel:getPaymentsHandler", result[1]).actions;

                payments.forEach(setPaymentDataDetails);

                var lastAvailableUserActionIndex = getLastAvailableUserActionIndex(payments, userActions);
                if (userActions && userActions.length > 0) {
                    userActions.forEach(function (action, index) {
                        if (action.id) {
                            updatePaymentAsRecommended(action, payments, getDefaultCategory(index, lastAvailableUserActionIndex, supportLastPaymentCategory));
                        } else {
                            generatePaymentForExistingCC(action, payments, getDefaultCategory(index, lastAvailableUserActionIndex, supportLastPaymentCategory));
                        }
                    });
                }

                limitRecommendations(payments, maxRecommended);
                updateFirstVisibleCategory(payments, categories, (supportLastPaymentCategory && lastAvailableUserActionIndex >= 0));

                payments.forEach(function saveOriginalName(p) { p.originalName = p.name; });

                infoObs.payments(payments);

                categories = updateCategories(categories, payments);
                infoObs.categories(categories);

                if (categories) {
                    if (general.isDefinedType(CustomerProfileManager.ProfileCustomer().lastSelectedCategory) && supportLastPaymentCategory) {
                        changeSelectedCategory(CustomerProfileManager.ProfileCustomer().lastSelectedCategory);
                        formObs.selectedCategory(CustomerProfileManager.ProfileCustomer().lastSelectedCategory);
                        CustomerProfileManager.ProfileCustomer().lastSelectedCategory = undefinedVar;
                    } else {
                        changeSelectedCategory(categories[0]);
                    }
                }
            }

            function setPaymentDataDetails(payment) {
                if (!payment) {
                    return;
                }

                var paymentData = payment.paymentData || "",
                    data = deserializeData(paymentData),
                    isGenericPayment = data && data.paymentData === "generic",
                    ccTypeId = null;

                if (!isGenericPayment && data && general.isNumber(data.paymentData)) {
                    ccTypeId = Number(data.paymentData);
                }

                if (general.isObjectType(data)) {
                    payment.paymentDataObject = data;
                }

                payment.isGeneric = isGenericPayment;
                payment.ccTypeId = ccTypeId;
            }

            function generatePaymentForExistingCC(action, payments, category) {
                var paymentData = JSONHelper.STR2JSON("ConcretePaymentsViewModel:generatePaymentForExistingCC", action.paymentData);
                paymentData.viewType = viewTypeForExistingCC;

                payments.unshift({
                    id: null,
                    name: action.name,
                    paymentType: 1,
                    currencies: action.currencies,
                    ccTypeId: paymentData.paymentData,
                    categories: [category, eConcretePaymentCategory.CreditCard],
                    paymentData: JSON.stringify(paymentData),
                    textContentKey: '',
                    originalPaymentName: action.paymentName,
                    imageClass: action.imageClass + '_saved',
                    isRecommended: true,
                    isExistingCC: true,
                    isGeneric: false,
                    isUserAction: true,
                    subtitleContentKey: action.subtitleContentKey,
                    cardHolder: action.cardHolder,
                    expirationDate: addFullYearToExpirationDate(action.expirationDate),
                    lastUsed: action.lastUsed ? new Date(action.lastUsed) : '',
                    isCcBinFromEea: action.isCcBinFromEea
                });
            }

            function addFullYearToExpirationDate(expirationDate) {
                if (general.isEmptyType(expirationDate) ||
                    !general.isStringType(expirationDate)) {
                    return null;
                }

                var expirationDateParts = expirationDate.split('/');

                if (expirationDateParts.length !== 2) {
                    return expirationDate;
                }

                var month = expirationDateParts[0],
                    year = expirationDateParts[1],
                    fullYear = year.length === 2 ? '20' + year : year;

                return String.format('{0}/{1}', month, fullYear);
            }

            function updatePaymentAsRecommended(action, payments, category) {
                var originalPayment = findPaymentDetailsAndIndex(payments, action);

                if (originalPayment) {
                    var payment = payments[originalPayment.index];

                    payment.isUserAction = true;
                    payment.isRecommended = true;
                    payment.categories.push(category);
                    payments.splice(originalPayment.index, 1);
                    payments.unshift(payment);
                }
            }

            function limitRecommendations(payments, maxRecommended) {
                var foundRecommended = 0;

                payments.forEach(function (payment) {
                    if (payment.isRecommended) {
                        if (foundRecommended < maxRecommended) {
                            ++foundRecommended;
                        } else {
                            payment.isRecommended = false;
                        }
                    }
                });
            }

            function removeCategoryIfEmpty(category, currentCategoryIndex, categories, payments) {
                var found = payments.find(function (payment) {
                    return (category === eConcretePaymentCategory.Recommended && payment.isRecommended) ||
                        (category !== eConcretePaymentCategory.Recommended && payment.categories.contains(category));
                });

                if (!found)
                    categories.splice(currentCategoryIndex, 1);
            }

            function removeRecommendedIfNeeded(categories) {
                var numberOfUsualCategories = categories.filter(function (category) {
                    return !(category === eConcretePaymentCategory.Recommended || category === eConcretePaymentCategory.LastPayment);
                }).length;

                var recommendedIndex = categories.indexOf(eConcretePaymentCategory.Recommended);

                if (numberOfUsualCategories === 1 && recommendedIndex >= 0) {
                    categories.splice(recommendedIndex, 1);
                }
            }

            function updateCategories(categories, payments) {
                if (supportLastPaymentCategory) {
                    categories.forEach(function (category, index) {
                        if (category === eConcretePaymentCategory.LastPayment)
                            return;
                        removeCategoryIfEmpty(category, index, categories, payments);
                    });
                }

                removeRecommendedIfNeeded(categories);

                return categories;
            }

            function getPaymentClass(payment) {
                if (payment.imageClass) {
                    return payment.imageClass;
                }

                if (formObs.selectedCategory() === eConcretePaymentCategory.Recommended) {
                    return getPaymentClassByCategory(payment.categories.find(isOtherThanRecomennded));
                }

                return getPaymentClassByCategory(formObs.selectedCategory());
            }

            function isOtherThanRecomennded(category) { return category !== eConcretePaymentCategory.Recommended }

            function getPaymentClassByCategory(category) {
                return 'unavailable ' + concretePaymentCategoryNames[category];
            }

            function getCategoryClass(category) {
                var css = concretePaymentCategoryNames[category];

                if (formObs.selectedCategory() === category)
                    css += ' active';
                return css;
            }

            function init() {
                setSubscribers();

                dalDeposit.getPaymentCountries(customer.prop.brokerID, customer.prop.countryID)
                    .then(function (result) {
                        var countriesResult = JSONHelper.STR2JSON("ConcretePaymentsViewModel:getPaymentsHandler", result);

                        var countryList = countriesResult.result.countries.map(function (countryDetails) {
                            var name = fixRtlParanthesis(countryDetails.name);

                            return {
                                text: name,
                                id: countryDetails.id,
                                code: countryDetails.code.toLowerCase(),
                                label: name
                            };
                        });

                        infoObs.countries(countryList);

                        var countryId = customer.prop.countryID;

                        if (general.isDefinedType(CustomerProfileManager.ProfileCustomer().lastSelectedPaymentMethodCountry)) {
                            countryId = CustomerProfileManager.ProfileCustomer().lastSelectedPaymentMethodCountry.id.toString();
                        }

                        selectDefaultCountry(countryList, countryId);
                    })
                    .fail(dataLoadFailCallback)
                    .done();

                getAllowedCreditCards();
            }

            function fixRtlParanthesis(text) {
                var valuesToReplace = {
                    '(': cTextMarks.Ltr + '(',
                    '[': cTextMarks.Ltr + '[',
                    ')': ')' + cTextMarks.Ltr,
                    ']': ']' + cTextMarks.Ltr
                };

                for (var item in valuesToReplace) {
                    if (!valuesToReplace.hasOwnProperty(item)) {
                        continue;
                    }

                    text = text.replace(item, valuesToReplace[item]);
                }

                return text;
            }

            function selectDefaultCountry(countriesResult, selectedCountry) {
                if (!countriesResult || countriesResult.length === 0) {
                    return dataLoadFailCallback();
                }

                var countryDetails = countriesResult.filter(function (country) {
                    return country.id.toString() === selectedCountry;
                });

                formObs.selectedCountry(countryDetails.length > 0 ? countryDetails[0] : countriesResult[0]);
            }

            function getPaymentVisibility(payment) {
                if (!payment.categories) {
                    return false;
                }

                return (payment.categories.indexOf(formObs.selectedCategory()) >= 0 && formObs.selectedCategory() !== eConcretePaymentCategory.Recommended && formObs.selectedCategory() !== eConcretePaymentCategory.LastPayment) ||
                    (payment.isRecommended && formObs.selectedCategory() === eConcretePaymentCategory.Recommended);
            }

            function changeSelectedCategory(category) {
                if (!general.isNullOrUndefined(category)) {
                    formObs.selectedCategory(category);
                    var redirected;

                    if (supportLastPaymentCategory && category === eConcretePaymentCategory.LastPayment) {
                        var payment = infoObs.payments().find(function (p) { return p.isRecommended; });
                        setTimeout(showPaymentView, 200, payment);

                        redirected = true;
                    }
                    else {
                        redirected = redirectToLastPaymentIfNeeded();
                    }

                    if (!redirected) {
                        PaymentSelectionBehaviors.Stop();
                        infoObs.currentPayment(null);
                        infoObs.isLoading(false);
                    }
                } else {
                    dataLoadFailCallback();
                }
            }

            function redirectToLastPaymentIfNeeded() {
                if (!redirectToLastPaymentOnLoad) {
                    return false;
                }

                if (shouldSkipRedirectToLastPayment()) {
                    resetRedirectToLastPayment();

                    return false;
                } else {
                    var payment = infoObs.payments().find(function (p) { return p.isRecommended && p.isUserAction; });

                    if (!payment) {
                        return false;
                    }

                    skipRedirectToLastPayment();
                    setTimeout(goToPaymentView, 200, payment);

                    return true;
                }
            }

            function skipRedirectToLastPayment() {
                lastPaymentMethodCache.update('skipRedirectToLastPayment', true);
            }

            function resetRedirectToLastPayment() {
                lastPaymentMethodCache.update('skipRedirectToLastPayment', false);
            }

            function shouldSkipRedirectToLastPayment() {
                return lastPaymentMethodCache.get('skipRedirectToLastPayment');
            }

            function isSelectedCategory(category) {
                return formObs.selectedCategory() === category;
            }

            function isSelectedPayment(payment) {
                return payment === infoObs.currentPayment();
            }

            function showPaymentView(payment) {
                infoObs.isLoading(false);

                if (infoObs.arePaymentsLoading()) {
                    return;
                }

                PaymentSelectionBehaviors.Stop();

                infoObs.currentPayment(payment);


                concretePaymentsBehavior.showPaymentView(payment, formObs.selectedCountry(), getPaymentClass(payment), payment.isGeneric && showAllowedCreditCards ? infoObs.allowedCreditCards() : []);
                CustomerProfileManager.ProfileCustomer().lastSelectedCategory = formObs.selectedCategory();
            }

            function goToPaymentView(payment) {
                infoObs.isLoading(false);

                skipRedirectToLastPayment();

                ViewsManager.SwitchViewVisible(eForms.ConcretePaymentForm, {
                    payment: payment,
                    country: formObs.selectedCountry(),
                    imageClass: getPaymentClass(payment),
                    lastChars: getLastFourCharsOfConcretePaymentName(payment),
                    cardHolder: payment.cardHolder,
                    expirationDate: payment.expirationDate,
                    lastUsed: payment.lastUsed,
                    isGeneric: payment.isGeneric,
                    allowedCreditCards: infoObs.allowedCreditCards(),
                    isCcBinFromEea: payment.isCcBinFromEea
                });

                CustomerProfileManager.ProfileCustomer().lastSelectedCategory = formObs.selectedCategory();
                CustomerProfileManager.ProfileCustomer().lastSelectedPaymentMethodCountry = formObs.selectedCountry();
            }

            function getConcretePaymentName(payment) {
                if (Dictionary.ValueIsEmpty(payment.textContentKey, 'payments_concreteNames')) {
                    return payment.name;
                }

                payment.name = Dictionary.GetItem(payment.textContentKey, 'payments_concreteNames');

                return payment.name;
            }

            function getConcretePaymentSubtitle(payment) {
                if (!payment.subtitleContentKey || Dictionary.ValueIsEmpty(payment.subtitleContentKey)) {
                    return '';
                }

                return Dictionary.GetItem(payment.subtitleContentKey);
            }

            function getLastFourCharsOfConcretePaymentName(payment) {
                if (!general.isDefinedType(payment)) {
                    return "";
                }

                var paymentName = getConcretePaymentName(payment);

                if (general.isNullOrUndefined(paymentName)) {
                    return "";
                }

                if (paymentName.length < 4) {
                    return paymentName;
                }

                var startIndex = paymentName.length - 4;

                return paymentName.substring(startIndex);
            }

            function getCategoryName(category) {
                var categoryName = Dictionary.GetItem('ePaymentCategory_' + category, 'payments_concreteView');

                if (category === eConcretePaymentCategory.LastPayment && infoObs.payments().length > 0) {
                    return categoryName + ' (' + getConcretePaymentName(infoObs.payments()[0]) + ') ';
                }

                return categoryName;
            }

            function getPaymentConfigData(payment) {
                try {
                    return JSONHelper.STR2JSON("ConcretePaymentsViewModel:getPaymentConfigData", payment.paymentData);
                }
                catch (e) {
                    return {};
                }
            }

            function getPaymentId(payment) {
                payment = ko.utils.unwrapObservable(payment);

                return !general.isNullOrUndefined(payment.id) ? ('ConcretePaymentTypeId_' + payment.id) : ('PaymentData_' + getPaymentConfigData(payment).paymentdata);
            }

            function getAllowedCreditCards() {
                dalDeposit.getAllowedCreditCardData(customer.prop.accountNumber)
                    .then(deserializeData)
                    .then(processAllowedCreditCards)
                    .fail(general.emptyFn)
                    .done();
            }

            function deserializeData(data) {
                if (!jsonHelper.IsValid(data)) {
                    return null;
                }

                return jsonHelper.STR2JSON("ConcretePaymentsViewModel/deserializeData", data);
            }

            function processAllowedCreditCards(data) {
                data.CreditCards.forEach(processCreditCardData);
            }

            function processCreditCardData(creditCardData) {
                var ccTypeIdIndex = 0,
                    ccTypeId = creditCardData[ccTypeIdIndex],
                    ccTypeImages = creditCardTypesManager.Images[ccTypeId];

                if (!ccTypeImages) {
                    return;
                }

                ccTypeImages.forEach(buildImagePath);
            }

            function buildImagePath(image) {
                infoObs.allowedCreditCards.push(urlResolver.getImageSharedPath(image));
            }

            function dispose() {
                PaymentSelectionBehaviors.CloseMissingDetailsDialog();

                subscribers.forEach(function (subscriber) {
                    subscriber.dispose();
                });

                subscribers.length = 0;
            }

            function removeConcretePayment(payment) {
                if (!payment || !payment.isExistingCC) {
                    return;
                }

                var removeCreditCardCallBack = function () {
                    dalDeposit.removeUsedCard(payment.ccTypeId)
                        .fail(general.emptyFn)
                        .done();

                    skipRedirectToLastPayment();
                    ko.postbox.publish(ePostboxTopic.ReloadConcretePayments);
                };

                confirmRemoveCreditCard(removeCreditCardCallBack, payment);
            }

            function confirmRemoveCreditCard(removeCallback, payment) {
                var removeCcProps = {
                        okButtonCallback: removeCallback,
                        okButtonCaption: 'depConfirmRemoveCC',
                        cancelButtonCaption: 'depCancelRemoveCC'
                    },
                    lastChars = getLastFourCharsOfConcretePaymentName(payment),
                    confirmationMessage = String.format(Dictionary.GetItem(cDepositMessageKeys.removeCCMessage), lastChars);

                AlertsManager.UpdateAlert(AlertTypes.RemoveCreditCardConfirmationAlert, '', confirmationMessage, null, removeCcProps);
                AlertsManager.PopAlert(AlertTypes.RemoveCreditCardConfirmationAlert);
            }

            function dataLoadFailCallback() {
                AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("DepositNoPaymentMethods"), null, { redirectToView: initConfiguration.PaymentsConfiguration.missingPaymentsRedirect });
                AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            init();

            return {
                Form: formObs,
                Info: infoObs,
                getPaymentVisibility: getPaymentVisibility,
                changeSelectedCategory: changeSelectedCategory,
                showPaymentView: showPaymentView,
                getConcretePaymentName: getConcretePaymentName,
                getConcretePaymentSubtitle: getConcretePaymentSubtitle,
                getLastFourCharsOfConcretePaymentName: getLastFourCharsOfConcretePaymentName,
                isSelectedCategory: isSelectedCategory,
                isSelectedPayment: isSelectedPayment,
                getPaymentClass: getPaymentClass,
                getCategoryClass: getCategoryClass,
                getCategoryName: getCategoryName,
                getPaymentId: getPaymentId,
                dispose: dispose,
                goToPaymentView: goToPaymentView,
                resetPaymentsFormPositionOn: resetPaymentsFormPositionOn,
                shouldResetPaymentsFormPosition: shouldResetPaymentsFormPosition,
                skipRedirectToLastPayment: skipRedirectToLastPayment,
                removeConcretePayment: removeConcretePayment
            };
        }

        return ConcretePaymentsViewModel;
    }
);