/* globals eUserStatus */
define(
    'viewmodels/TradingSummaryViewModel',
    [
        "require",
        "knockout",
        'userflow/UserFlowManager',
        "StateObject!userFlow",
        "deviceviewmodels/account/UserFlowCTA",
        'initdatamanagers/Customer',
        'devicemanagers/StatesManager',
        'helpers/ObservableHelper',
        'cachemanagers/ClientStateHolderManager',
        'cachemanagers/bonusmanager',
        'cachemanagers/PortfolioStaticManager'
    ],
    function TradingSummaryViewModelDef(require) {
        var ko = require("knockout"),
            stateObjectUserFlow = require("StateObject!userFlow"),
            UserFlowCTA = require("deviceviewmodels/account/UserFlowCTA"),
            Customer = require('initdatamanagers/Customer'),
            StatesManager = require('devicemanagers/StatesManager'),
            vmHelpers = require('helpers/ObservableHelper'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            bonusmanager = require('cachemanagers/bonusmanager'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            observableCustomerObject = {},
            stateObjectUnsubscribe,
            statesIsActiveUnsubscribe,
            data = {},
            cta,
            portfolio;

        function TradingSummaryViewModel() {
            function init() {
                setObservables();

                setSubscribers();

                registerToDispatcher();

                onClientStateChange();
            }

            function setSubscribers() {
                statesIsActiveUnsubscribe = StatesManager.States.IsActive.subscribe(function onIsActiveChangeds(isActive) {
                    data.showCta(!(isActive || Customer.prop.customerType === eCustomerType.TradingBonus));
                });

                updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));

                stateObjectUnsubscribe = stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function onUserFlowChanged(model) {
                    updateFromStateObject(model);
                });
            }

            function setObservables() {
                data.generalStatusColor = ko.observable('');
                data.ctaText = ko.observable('');
                data.showCta = ko.observable(!(StatesManager.States.IsActive() || Customer.prop.customerType === eCustomerType.TradingBonus));
            }

            function registerToDispatcher() {
                setDefaultObservables();
                setComputables();
                csHolderManager.OnChange.Add(onClientStateChange);
            }

            function disconnectFromDispatcher() {
                csHolderManager.OnChange.Remove(onClientStateChange);
                vmHelpers.CleanKoObservableSimpleObject(observableCustomerObject);
            }

            function setDefaultObservables() {
                observableCustomerObject.availableMargin = ko.observable();
                observableCustomerObject.openPL = ko.observable();
                observableCustomerObject.equity = ko.observable();
                observableCustomerObject.accountBalance = ko.observable();
                observableCustomerObject.customerCcyName = Customer.prop.defaultCcy();

                observableCustomerObject.availableMarginSign = ko.observable();
                observableCustomerObject.openPLSign = ko.observable();
                observableCustomerObject.equitySign = ko.observable();
                observableCustomerObject.accountBalanceSign = ko.observable();

                portfolio = portfolioManager.Portfolio;
                observableCustomerObject.cashBackVisibility = ko.observable(false);
                observableCustomerObject.spreadDiscountVisibility = ko.observable(false);
                observableCustomerObject.pendingBonusType = ko.observable(portfolio.pendingBonusType);
            }

            function setComputables() {
                observableCustomerObject.bonusAmount = ko.computed(function computeBonus() {
                    return bonusmanager.bonus().amountBase ? bonusmanager.bonus().amountBase : 0;
                });
            }

            function onClientStateChange() {
                var csHolder = csHolderManager.CSHolder;

                observableCustomerObject.availableMargin(csHolder.availableMargin);
                observableCustomerObject.openPL(csHolder.openPL);
                observableCustomerObject.equity(csHolder.equity);
                observableCustomerObject.accountBalance(csHolder.accountBalance);

                observableCustomerObject.availableMarginSign(csHolder.availableMargin.sign());
                observableCustomerObject.openPLSign(csHolder.openPL.sign());
                observableCustomerObject.equitySign(csHolder.equity.sign());
                observableCustomerObject.accountBalanceSign(csHolder.accountBalance.sign());
                observableCustomerObject.cashBackVisibility(ePendingBonusType.cashBack === portfolio.pendingBonusType);
                observableCustomerObject.spreadDiscountVisibility(ePendingBonusType.spreadDiscount === portfolio.pendingBonusType);
            }

            function updateFromStateObject(model) {
                if (model) {
                    if (model.cta === eCta.ContactUs && model.userStatus === eUserStatus.Restricted) {
                        data.ctaText('fs_' + model.ctaText + '_restricted');
                    }
                    else if (model.cta === eCta.ContactUs && model.userStatus === eUserStatus.Locked) {
                        data.ctaText('fs_' + model.ctaText + '_locked');
                    }
                    else {
                        data.ctaText('fs_' + model.ctaText);
                    }

                    cta = model.cta;
                }
            }

            function ctaClick() {
                ko.postbox.publish('action-source', 'FinancialSummaryCTA');
                UserFlowCTA.getUserFlowAction(cta)();
            }

            function dispose() {
                disconnectFromDispatcher();

                if (stateObjectUnsubscribe) {
                    stateObjectUnsubscribe();
                }

                if (statesIsActiveUnsubscribe) {
                    statesIsActiveUnsubscribe.dispose();
                }
            }

            return {
                init: init,
                Data: data,
                ctaClick: ctaClick,
                CustomerInfo: observableCustomerObject,
                dispose: dispose
            };
        }

        function createViewModel(params) {
            var viewModel = new TradingSummaryViewModel(params || {});
            viewModel.init();
            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
