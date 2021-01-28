define(
    'viewmodels/AccountPreferencesViewModel',
    [
        'require',
        'knockout',
        'handlers/Cookie',
        'cachemanagers/CacheManager',
        'handlers/general',
        'managers/CustomerProfileManager',
        'initdatamanagers/SymbolsManager',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer',
        'StateObject!Setting',
        'modules/LanguageSettings',
        'modules/ThemeSettings'
    ],

    function (require) {

        var ko = require('knockout'),
            cacheManager = require('cachemanagers/CacheManager'),
            general = require('handlers/general'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            customer = require('initdatamanagers/Customer'),
            languageSettings = require('modules/LanguageSettings'),
            CookieHandler = require('handlers/Cookie'),
            settingStateObject = require('StateObject!Setting'),
            ThemeSettings = require('modules/ThemeSettings');

        var AccountPreferencesViewModel = function () {
            var info = {},
                currenciesList = ko.observableArray([]),
                isCollapsed = ko.observable(true);

            var init = function () {
                setObservableObject();
                isOpenCollapsed();
            };

            function setObservableObject() {
                var cust = customer.prop || {};

                var sysDefaultSymbolId = 47; // default system symbol USD

                var sysCcy = { ccyId: sysDefaultSymbolId, ccyName: symbolsManager.GetTranslatedSymbolById(sysDefaultSymbolId) };
                var profileCustomer = customerProfileManager.ProfileCustomer();
                currenciesList.push(sysCcy);

                if (!general.isEmptyType(cust.userName)) {
                    info.userName = (cust.userName.length > 18) ? cust.userName.substring(0, 18) + "..." : cust.userName;
                }
                if (!general.isEmptyType(cust.accountNumber)) {
                    info.account = "(" + cust.accountNumber + ")";
                }
                if (!general.isEmptyType(cust.defaultCcy()) && sysCcy.ccyName !== cust.defaultCcy()) {
                    currenciesList.push({ ccyId: cust.baseCcyId(), ccyName: cust.defaultCcy() });
                }
                info.isLoading = ko.observable(false);
                info.currenciesList = currenciesList;

                info.selectedCcyId = ko.observable(profileCustomer.displaySymbol || cust.selectedCcyId());

                info.selectedCcyId.subscribe(function (newValue) {
                    ko.postbox.publish('trading-event', 'change-currency');

                    if (cust.selectedCcyId() !== newValue) {
                        cacheManager.SetDisplaySymbol(newValue);
                        cust.selectedCcyId(newValue);

                        profileCustomer.displaySymbol = newValue;
                        customerProfileManager.ProfileCustomer(profileCustomer);
                    }
                });

                info.selectedCcyName = ko.computed(function () {
                    return symbolsManager.GetTranslatedSymbolById(cust.selectedCcyId());
                });

                info.selectedTheme = ko.observable(ThemeSettings.GetTheme());
                info.themes = ko.observableArray(Object.keys(ThemeSettings.Themes).map(function (value) {
                    return {
                        value: value,
                        label: 'lblTheme_' + value
                    };
                }));
                info.selectedTheme.subscribe(function (newValue) {
                    updateTheme(newValue);
                });
            }

            var setNewLanguage = languageSettings;

            if (!settingStateObject.get("AccountHubSetting")) {
                settingStateObject.set("AccountHubSetting", null);
            }
            settingStateObject.subscribe("AccountHubSetting", function (view) {
                isCollapsed(view !== eViewTypes.vAccountPreferences);
            });

            function isOpenCollapsed() {
                if (viewModelsManager.VManager.GetViewArgs(eViewTypes.vAccountPreferences) === eViewTypes.vAccountPreferences)
                    isCollapsed(false);
            }

            function collapsedToggle() {
                isCollapsed(!isCollapsed());
            }

            var selectedLanguageId = CookieHandler.ReadCookie("LID");

            function updateTheme(newTheme) {
                var to,
                    cb = function () {
                        if (to) {
                            clearTimeout(to);
                        }
                        to = setTimeout(function () {
                            info.isLoading(false);
                        }, 400);
                    };

                info.isLoading(true);
                ThemeSettings.UpdateTheme(newTheme, cb);
            }

            function changeTheme(askedTheme) {
                info.selectedTheme(info.selectedTheme() !== askedTheme ?
                    askedTheme : ThemeSettings.Themes.light);
            }


            return {
                init: init,
                Info: info,
                SetNewLanguage: setNewLanguage,
                ChangeTheme: changeTheme,
                CollapsedToggle: collapsedToggle,
                isCollapsed: isCollapsed,
                selectedLanguageId: selectedLanguageId
            };
        };


        var createViewModel = function (params) {
            var viewModel = new AccountPreferencesViewModel();
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
