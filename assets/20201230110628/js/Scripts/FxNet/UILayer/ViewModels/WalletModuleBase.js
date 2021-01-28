define('viewmodels/WalletModuleBase', [
    'require',
    'knockout',
    'handlers/general',
    'viewmodels/ViewModelBase',
    'configuration/initconfiguration',
    'initdatamanagers/Customer',
    'managers/CustomerProfileManager',
    'cachemanagers/ClientStateHolderManager',
    'cachemanagers/PortfolioStaticManager',
    'viewmodels/dialogs/DialogViewModel',
    'Dictionary',
    'StateObject!DealerParams',
    'cachemanagers/bonusmanager'
], function (require) {
    var ko = require('knockout'),
        general = require('handlers/general'),
        DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
        walletSettings = require('configuration/initconfiguration').WalletConfiguration,
        customer = require('initdatamanagers/Customer'),
        customerProfileManager = require('managers/CustomerProfileManager'),
        csHolderManager = require('cachemanagers/ClientStateHolderManager'),
        portfolioManager = require('cachemanagers/PortfolioStaticManager'),
        Dictionary = require('Dictionary'),
        bonusManager = require('cachemanagers/bonusmanager');

    function WalletModule() {
        var observableCustomerObject = {},
            viewProperties = {},
            openInDialogDelegate = new TDelegate();

        function init() {
            setObservableViewProperties();

            setObservableCustomerObject();

            setComputables();

            if (DialogViewModel) {
                openInDialogDelegate.Add(function (name, options, eView, args) {
                    DialogViewModel.open(name, options, eView, args);
                });
            }

            registerToDispatcher();

            updateObservableObject();
        }

        //-------------------------------------------------------

        function updateObservableObject() {
            onClientStateChange();
            onClientPortfolioStateChange();
        }

        //-------------------------------------------------------

        function dispose() {
            unregisterFromDispatcher();
        }

        //-------------------------------------------------------

        function registerToDispatcher() {
            csHolderManager.OnChange.Add(onClientStateChange);
            portfolioManager.OnChange.Add(onClientPortfolioStateChange);
        }

        //-------------------------------------------------------

        function unregisterFromDispatcher() {
            csHolderManager.OnChange.Remove(onClientStateChange);
            portfolioManager.OnChange.Remove(onClientPortfolioStateChange);
        }

        //-------------------------------------------------------

        function setObservableCustomerObject() {
            observableCustomerObject.isMaintenanceMargin =
                customer.prop.maintenanceMarginPercentage > 0;
            observableCustomerObject.userName = customer.prop.userName;
            observableCustomerObject.accountNumber = customer.prop.accountNumber;

            var csHolder = csHolderManager.CSHolder;
            observableCustomerObject.maintenanceMargin = toObservable(
                csHolder.maintenanceMargin,
                function () {
                    return observableCustomerObject.isMaintenanceMargin;
                }
            );
            observableCustomerObject.openPLSign = ko.observable();

            observableCustomerObject.equity = toObservable(
                csHolder.equity,
                function () {
                    return true;
                }
            );
            observableCustomerObject.accountBalance = toObservable(
                csHolder.accountBalance,
                function () {
                    return true;
                }
            );
            observableCustomerObject.openPL = toObservable(
                csHolder.openPL,
                function () {
                    return true;
                }
            );

            observableCustomerObject.netExposure = toObservable(
                csHolder.netExposure,
                function () {
                    return true;
                }
            );
            observableCustomerObject.exposureCoverage = toObservable(
                csHolder.exposureCoverage,
                function () {
                    return true;
                }
            );
            observableCustomerObject.totalEquity = ko.observable(
                csHolder.totalEquity
            );

            observableCustomerObject.isValidExposureCoverage = ko.observable(
                isExposureCoverageValid(csHolder.exposureCoverage)
            );

            observableCustomerObject.usedMargin = toObservable(
                csHolder.usedMargin,
                function () {
                    return (
                        viewProperties.isAdvancedView() ||
                        (!general.isNullOrUndefined(walletSettings) &&
                            walletSettings.isVisibleUsedMargin)
                    );
                }
            );

            observableCustomerObject.availableMargin = toObservable(
                csHolder.availableMargin,
                function () {
                    return true;
                }
            );
            observableCustomerObject.availableMarginNoComma = ko.observable();

            observableCustomerObject.marginUtilizationPercentage = toObservable(
                csHolder.marginUtilizationPercentage,
                function () {
                    return viewProperties.isAdvancedView();
                }
            );
            observableCustomerObject.marginUtilizationStatus = ko.observable(
                csHolder.marginUtilizationStatus
            );

            var portfolio = portfolioManager.Portfolio;
            observableCustomerObject.maxExposure = toObservable(
                portfolio.maxExposure,
                function () {
                    return viewProperties.isAdvancedView();
                }
            );
            observableCustomerObject.securities = toObservable(
                portfolio.securities,
                function (observed) {
                    return general.toNumeric(observed) > 0 && viewProperties.isAdvancedView();
                }
            );
            observableCustomerObject.tradingBonus = toObservable(
                portfolio.tradingBonus,
                function (observed) {
                    return general.toNumeric(observed) > 0;
                }
            );
            observableCustomerObject.pendingBonus = toObservable(
                portfolio.pendingBonus,
                function (observed) {
                    return general.toNumeric(observed) > 0;
                }
            );
            observableCustomerObject.pendingWithdrawals = toObservable(
                portfolio.pendingWithdrawals,
                function (observed) {
                    return general.toNumeric(observed) > 0;
                }
            );

            // BONUS
            observableCustomerObject.pendingBonusType = ko.observable(
                portfolio.pendingBonusType
            );

            observableCustomerObject.showCashBack = showCashBack;

            // exposure
            observableCustomerObject.showExposureSummary = showExposureSummary;
            observableCustomerObject.showExposureSummary.disabled = ko.observable(
                false
            );

            observableCustomerObject.showDetailedMarginStatus = showDetailedMarginStatus;

            observableCustomerObject.isAdvancedView = viewProperties.isAdvancedView;

            observableCustomerObject.showFinancialSummaryDetails = ko.observable(
                $statesManager.States.IsActive() ||
                customer.prop.customerType === eCustomerType.TradingBonus
            );
        }

        function isExposureCoverageValid(exposureCoverage) {
            if (
                !general.isNullOrUndefined(customer) &&
                !general.isNullOrUndefined(customer.prop) &&
                !general.isNullOrUndefined(customer.prop.minPctEQXP) &&
                !general.isNullOrUndefined(exposureCoverage)
            ) {
                return (
                    general.toNumeric(exposureCoverage) > general.toNumeric(customer.prop.minPctEQXP)
                );
            }
            return true;
        }

        //-------------------------------------------------------
        function setComputables() {
            observableCustomerObject.bonusAmount = ko.computed(function () {
                return bonusManager.bonus().amountBase
                    ? bonusManager.bonus().amountBase
                    : 0;
            });
        }

        //-------------------------------------------------------
        function toObservable(value, visibilityFunc) {
            var valueObs = ko.observable(value);
            return {
                value: valueObs,
                toNumeric: ko.computed(function () {
                    return general.toNumeric(valueObs());
                }),
                visibility: ko
                    .computed(function () {
                        return visibilityFunc(valueObs());
                    })
                    .extend({ notify: 'always' }),
            };
        }

        //-------------------------------------------------------

        function setObservableViewProperties() {
            viewProperties.isAdvancedView = ko.observable();
            viewProperties.setAdvancedView = setAdvancedView;
        }

        //-------------------------------------------------------

        function setAdvancedView(newValue) {
            viewProperties.isAdvancedView(newValue);
            var profileCustomer = customerProfileManager.ProfileCustomer();
            profileCustomer.advancedWalletView = newValue ? 1 : 0;
            customerProfileManager.ProfileCustomer(profileCustomer);
        }

        //-------------------------------------------------------

        function onClientStateChange() {
            var csHolder = csHolderManager.CSHolder;
            observableCustomerObject.maintenanceMargin.value(
                csHolder.maintenanceMargin
            );

            observableCustomerObject.openPLSign(csHolder.openPL.sign());
            observableCustomerObject.openPL.value(csHolder.openPL);
            observableCustomerObject.equity.value(csHolder.equity);
            observableCustomerObject.accountBalance.value(csHolder.accountBalance);
            observableCustomerObject.netExposure.value(csHolder.netExposure);
            observableCustomerObject.exposureCoverage.value(
                csHolder.exposureCoverage
            );
            observableCustomerObject.totalEquity(csHolder.totalEquity);

            observableCustomerObject.isValidExposureCoverage(
                isExposureCoverageValid(csHolder.exposureCoverage)
            );

            observableCustomerObject.usedMargin.value(csHolder.usedMargin);
            observableCustomerObject.availableMargin.value(csHolder.availableMargin);
            observableCustomerObject.availableMarginNoComma(
                csHolder.availableMargin.sign()
            );

            observableCustomerObject.marginUtilizationPercentage.value(
                csHolder.marginUtilizationPercentage
            );
            observableCustomerObject.marginUtilizationStatus(
                csHolder.marginUtilizationStatus
            );

            observableCustomerObject.showFinancialSummaryDetails(
                $statesManager.States.IsActive() ||
                customer.prop.customerType === eCustomerType.TradingBonus
            );
        }

        //-------------------------------------------------------

        function canCloseDialog() {
            return (
                observableCustomerObject.pendingBonusType() !==
                ePendingBonusType.cashBack &&
                !general.isNullOrUndefined(walletSettings) &&
                !walletSettings.supressDialogs &&
                !general.isNullOrUndefined(DialogViewModel) &&
                DialogViewModel.isOpen() &&
                DialogViewModel.getCurrentView() === eViewTypes.vCashBack
            );
        }

        function onClientPortfolioStateChange() {
            var portfolio = portfolioManager.Portfolio;
            observableCustomerObject.maxExposure.value(portfolio.maxExposure);
            observableCustomerObject.securities.value(portfolio.securities);
            observableCustomerObject.tradingBonus.value(portfolio.tradingBonus);
            observableCustomerObject.pendingBonus.value(portfolio.pendingBonus);
            observableCustomerObject.pendingWithdrawals.value(
                portfolio.pendingWithdrawals
            );
            observableCustomerObject.pendingBonusType(portfolio.pendingBonusType);

            // if coming from deep link and no cash back pending bonus and dialog already pop up

            if (canCloseDialog()) {
                DialogViewModel.close();
            }
        }
        //-------------------------------------------------------

        function showCashBack(arg) {
            // if coming from deep link and no cash back pending bonus
            if (observableCustomerObject.pendingBonusType() !== ePendingBonusType.cashBack ||
                observableCustomerObject.bonusAmount() <= 0) {
                return;
            }

            if (arg && arg.tradingEvent) {
                ko.postbox.publish('trading-event', arg.tradingEvent);
            }

            openInDialogDelegate.Invoke(
                eDialog.CashBackDialog,
                {
                    title: Dictionary.GetItem('lblCashBackTitle', 'deals_CashBack'),
                    dialogClass: 'cashback fx-dialog',
                    width: 850,
                },
                eViewTypes.vCashBack,
                observableCustomerObject.bonusAmount()
            );
        }

        function showExposureSummary(arg) {
            openInDialogDelegate.Invoke(
                eDialog.NetExposuresSummaryDialog,
                { title: arg.title, dialogClass: 'netexposure fx-dialog' },
                eViewTypes.vNetExposure
            );
        }

        //-------------------------------------------------------
        function showDetailedMarginStatus(tradingEvent) {
            openInDialogDelegate.Invoke(
                eDialog.MarginStatus,
                { title: Dictionary.GetItem('MarginStatus', 'dialogsTitles', ' '), width: 800 },
                eViewTypes.vMarginStatus
            );

            if (tradingEvent) {
                ko.postbox.publish('trading-event', tradingEvent);
            }
        }

        return {
            Init: init,
            WalletInfo: observableCustomerObject,
            ViewProperties: viewProperties,
            OpenInDialog: openInDialogDelegate,
            Dispose: dispose,
            util: { toObservable: toObservable }
        };
    }

    return WalletModule;
});
