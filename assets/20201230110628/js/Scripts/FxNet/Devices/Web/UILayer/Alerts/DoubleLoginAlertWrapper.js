define(
    'devicealerts/DoubleLoginAlertWrapper',
    [
        'require',
        'devicealerts/Alert',
        'knockout',
        'Dictionary',
        'initdatamanagers/Customer',
        'devicealerts/DoubleLoginAlert',
        'dataaccess/dalCommon'
    ],
    function DoubleLoginAlertWrapperDef(require) {
        var AlertBase = require('devicealerts/Alert'),
            customer = require('initdatamanagers/Customer'),
            doubleLoginAlert = require('devicealerts/DoubleLoginAlert'),
            dictionary = require('Dictionary'),
            dalCommon = require('dataaccess/dalCommon');

        var DoubleLoginAlertWrapper = function DoubleLoginAlertWrapperClass() {
            var inheritedAlertInstance = new AlertBase();
            var exitInProcess = false;
            var alertBody = customer.isAutologin() ? dictionary.GetItem('loginDoubleLogin') + ' ' + dictionary.GetItem('loginDoubleLogin_Qus2') : dictionary.GetItem('loginDoubleLogin');

            function init() {
                inheritedAlertInstance.alertName = 'DoubleLoginAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.body = alertBody;
                inheritedAlertInstance.title = dictionary.GetItem('loginDoubleLoginTitle');
                createButtons();
            }

            function clearTimer() {
                if (doubleLoginAlert.LogoutTimer) {
                    clearTimeout(doubleLoginAlert.LogoutTimer);
                }
            }

            function exit() {
                if (exitInProcess) {
                    return;
                }

                exitInProcess = true;
                clearTimer();

                dalCommon.Exit(eLoginLogoutReason.web_doubleLogin3);
            }

            function goToLogin() {
                clearTimer();
                window.location = 'Account/Login/' + '?reason=' + eLoginLogoutReason.web_doubleLogin2;
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();
                inheritedAlertInstance.hide = exit;
                inheritedAlertInstance.onCloseAction.Add(exit);

                if (customer.isAutologin()) {
                    inheritedAlertInstance.buttons.push(
                        new inheritedAlertInstance.buttonProperties(
                            dictionary.GetItem('doubleLoginReconnect'),
                            goToLogin,
                            'btnLogin'
                        ));

                    inheritedAlertInstance.buttons.push(
                        new inheritedAlertInstance.buttonProperties(
                            dictionary.GetItem('exit'),
                            exit,
                            'btnOk'
                        ));
                }
                else {
                    inheritedAlertInstance.buttons.push(
                        new inheritedAlertInstance.buttonProperties(
                            dictionary.GetItem('doubleLoginReconnect'),
                            exit,
                            'btnOk'
                        ));
                }
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return DoubleLoginAlertWrapper;
    }
);