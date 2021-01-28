define(
    'devicealerts/Alert',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/dialogs/DialogViewModel',
        'cachemanagers/PortfolioStaticManager',
        'initdatamanagers/Customer',
        'handlers/Delegate',
        'Dictionary'
    ],
    function AlertBaseDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            Dictionary = require('Dictionary'),
            delegate = require('handlers/Delegate'),
            customer = require('initdatamanagers/Customer');

        var AlertBase = function AlertBaseClass() {
            var defaultTitle = Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' '),
                visible = ko.observable(false),
                title = ko.observable(defaultTitle),
                body = ko.observable(''),
                messages = ko.observableArray([]),
                disableThisAlertByCookie = ko.observable(false),
                caller = ko.observable(''),
                buttons = ko.observableArray([]),
                onCloseAction = new delegate(),
                theme = ko.observable(),
                timer = null;

            var hasPendingWithdrawals = function () {
                return portfolioManager.Portfolio.pendingWithdrawals.sign() > 0;
            };

            var injectDepositButtons = function (noCancelButton) {
                var thisAlert = this;

                thisAlert.buttons.removeAll();

                var closeOpenedDialog = function () {
                    DialogViewModel.close();
                };

                if (!customer.prop.isDemo) {
                    thisAlert.buttons.push(
                        new thisAlert.buttonProperties(
                            Dictionary.GetItem('DepositeNow'),
                            function () {
                                thisAlert.visible(false);
                                closeOpenedDialog();
                                require(['devicemanagers/ViewModelsManager'], function ($viewModelsManager) {
                                    ko.postbox.publish('action-source', 'InsufficientAvailableMarginPopUp');
                                    $viewModelsManager.VManager.RedirectToForm(eForms.Deposit, {});
                                });

                            },
                            'btnDeposit'
                        )
                    );

                    if (hasPendingWithdrawals()) {
                        thisAlert.buttons.push(
                            new thisAlert.buttonProperties(
                                Dictionary.GetItem('ViewCancel'),
                                function () {
                                    thisAlert.visible(false);
                                    closeOpenedDialog();
                                    require(['devicemanagers/ViewModelsManager'], function ($viewModelsManager) {
                                        $viewModelsManager.VManager.SwitchViewVisible(eForms.PendingWithdrawal);
                                    });

                                },
                                'btnPending disable'
                            )
                        );
                    }
                }

                if (noCancelButton) {
                    return;
                }

                thisAlert.buttons.push(
                    new thisAlert.buttonProperties(
                        Dictionary.GetItem('NotNow'),
                        function () {
                            thisAlert.visible(false);
                        },
                        'btnCancel colored'
                    )
                );
            };

            // callback function
            var closeMe = function (obj) {
                obj = obj || this;
                obj.visible(false);

                if (timer !== null) {
                    clearTimeout(timer);
                    timer = null;
                }

                onCloseAction.Invoke();
            };

            // callback executer
            var closeMeExecutor = function (callback, closeTimeout) {
                if (timer !== null) {
                    clearTimeout(timer);
                }

                timer = setTimeout(callback, closeTimeout);
            };

            return {
                alertName: 'devicealerts/Alert',
                theme: theme,
                visible: visible,
                caller: caller,
                title: title,
                setDefaultTitle: function () {
                    this.title(defaultTitle);
                },
                icon: '',
                body: body,
                messages: messages,
                properties: {},
                DisableThisAlertByCookie: disableThisAlertByCookie,
                NeedToCreateCookie: true,
                cookieName: '',
                buttons: buttons,
                buttonProperties: function (text, click, cssClass) {
                    return {
                        text: text,
                        onclick: click,
                        css_Class: cssClass
                    };
                },
                injectDepositButtons: injectDepositButtons,
                prepareForShow: function () { },
                // virtual override-able
                hide: function () {
                    if (visible()) {
                        visible(false);
                    }
                },
                show: function () {
                    this.theme(this.properties.theme);

                    if (this.prepareForShow) {
                        this.prepareForShow();
                    }
                    visible(true);

                    if (general.isDefinedType(this.properties.closeTimeout)) {
                        var that = this;
                        closeMeExecutor(function () { closeMe(that); }, this.properties.closeTimeout);
                    }
                },
                onCloseAction: onCloseAction,
                onClose: closeMe
            };
        };

        return AlertBase;
    }
);
