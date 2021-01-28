/*global timeStamp, setTimeout, clearTimout, systemInfo*/
define(
    "generalmanagers/ActivitySupervisor", 
    [
        "require",
        "dataaccess/dalorder",
        'handlers/general',
        "dataaccess/dalCommon",
        'devicealerts/MaxIdleTimeAlert',
        'extensions/Date',
        'initdatamanagers/Customer',
    ],
    function (require) {
        var 
            dalOrders = require("dataaccess/dalorder"),
            customer = require('initdatamanagers/Customer'),
            general = require('handlers/general'),
            dalCommon = require("dataaccess/dalCommon"),
            MaxIdleTimeAlert = require('devicealerts/MaxIdleTimeAlert');
          

        function ActivitySupervisor() {
            var settingsMaxIdleTime = null,
                settingsAlertTime = null,
                checkActivityTimer = null,
                lastCheckTime = timeStamp(),
                stayAlertTimer = null,
                settingTotalMaxIdleTime;

            function check() {
                // initialization:  wait till setting gets from server ////////////////
                if (settingsMaxIdleTime === null && !general.isDefinedType(systemInfo.clientApplicationParams)) {
                    setTimeout(check, 1000);
                    return false;
                }

                // setting from server available: initialize
                if (settingsMaxIdleTime === null) {
                    settingsMaxIdleTime = parseInt(systemInfo.clientApplicationParams[eClientParams.MaxIdleTime], 10);
                    settingsAlertTime = parseInt(systemInfo.clientApplicationParams[eClientParams.IdleTimer], 10);
                    settingTotalMaxIdleTime = settingsMaxIdleTime + settingsAlertTime;
                }
                // initialization done ///////////

                var isActive = checkActivity();

                if (isActive) {
                    checkActivityTimer = setTimeout(check, 30000);
                    return true;
                } else {
                    var logoutTimeout = timeTillLogout()<0 ? 0: timeTillLogout();
                    stayAlertTimer = setTimeout(logout, logoutTimeout);
                    MaxIdleTimeAlert.Show();

                    return false;
                }
            }

            function logout() {
                if (checkActivityTimer) {
                    clearTimeout(checkActivityTimer);
                    checkActivityTimer = null;
                }

                if (stayAlertTimer) {
                    clearTimeout(stayAlertTimer);
                    stayAlertTimer = null;
                }
                
                if (customer.isAutologin()) {
                    dalCommon.Exit(eLoginLogoutReason.activitySupervisor_logout);
                } else {
                    dalCommon.Logout(eLoginLogoutReason.MaxIdleTimeAlert);
                }
            }

            function exit() {
                dalCommon.Exit(eLoginLogoutReason.activitySupervisor_exit);
            }

            function checkActivity() {
                lastCheckTime = timeStamp();

                return getIdleTime() < settingsMaxIdleTime;
            }

            function resetTimeRequest() {
                if (timeStamp() - lastCheckTime > settingTotalMaxIdleTime) {
                    logout();
                }

                dalOrders.resetTimeRequest();
            }

            function resumeChecking() {
                dalOrders.resetTimeRequest();
                check();
            }

            function updateAsStay() {
                if (stayAlertTimer) {
                    clearTimeout(stayAlertTimer);
                    stayAlertTimer = null;
                } else {
                    dalCommon.Login(eLoginLogoutReason.activitySupervisor_updateAsStay);
                }

                resumeChecking();
            }

            function start() {
                check();
            }

            function getIdleTime() {
                return timeStamp() - dalOrders.lastTimeRequest();
            }

            // if positive than time has passed and need to logout, if negative time has not passed yet
            function timeTillLogout() {
                return settingTotalMaxIdleTime - getIdleTime();
            }

            //------------------------------------------------------
            return {
                Start: start,
                ResetTimeRequest: resetTimeRequest,
                UpdateStay: updateAsStay,
                Logout: logout,
                Exit: exit
            };
        }

        var module = window.ActivitySupervisor = new ActivitySupervisor();

        return module;
    }
);