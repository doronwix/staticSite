define(
    'cachemanagers/NotificationsManager',
    [
        'require',
        'JSONHelper',
        'global/UrlResolver',
        'global/debounce',
        'handlers/Cookie',
        'handlers/Delegate',
        'generalmanagers/ErrorManager',
        'dataaccess/dalNotificationData',
        'enums/DataMembersPositions'
    ],
    function TNotificationManager(require) {
        var JSONHelper = require('JSONHelper'),
            UrlResolver = require('global/UrlResolver'),
            debounce = require('global/debounce'),
            CookieHandler = require('handlers/Cookie'),
            delegate = require('handlers/Delegate'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            dalNotificationData = require('dataaccess/dalNotificationData'),
            onInstrumentsUpdated = new delegate(),
            onMinDealAmountsUpdated = new delegate(),
            notifications = [];

        function processData(data) {
            //loop trough all notications and raise the relevant events
            for (var i = 0, length = data.length; i < length; i++) {
                notifications[data[i][eNotification.NotificationType]].Invoke({ id: data[i][eNotification.ItemId], ver: data[i][eNotification.RelatedItemId], hash: data[i][eNotification.Version] });
            }
        }

        //------------------------------------------------
        // register the relevant delegates to each notification type
        //------------------------------------------------
        function notificationEvents() {
            notifications[eNotificationType.InstrumentEdited] = new delegate();
            notifications[eNotificationType.InstrumentEdited].Add(onInstrumentModified);

            notifications[eNotificationType.MinDealGroupEdited] = new delegate();
            notifications[eNotificationType.MinDealGroupEdited].Add(onMinDealGroupModified);
        }

        var getUpdatedData = debounce(function (url, version, notificationType) {
            var context = getDataTypeToUpdate(notificationType);

            dalNotificationData
                .GetUpdatedCacheElementsData(url)
                .then(function (responseText) {
                    onUpdateDataComplete(version, context, responseText);
                })
                .fail(function () {
                    ErrorManager.onWarning('NotificationsManager/onRetryUpdate' + context.updateditem, context.updateditem + ' version sync retry failed');
                })
                .done();
        }, 5000);

        function onMinDealGroupModified(newVersion) {
            if (newVersion.id !== UrlResolver.getMinDealGroupId()) {
                return;
            }

            if (newVersion.ver !== UrlResolver.getMinDealsVersion()) {
                var url = UrlResolver.getStaticInitialDataMinDealAmountsUrl(newVersion.id, newVersion.ver, newVersion.hash);
                getUpdatedData(url, newVersion, eNotificationType.MinDealGroupEdited);
            }
        }

        function onInstrumentModified(newVersion) {
            if (newVersion.ver !== UrlResolver.getInstrumentsVersion()) {
                var url = UrlResolver.getStaticInitialDataInstrumentsUrl(newVersion.ver, newVersion.hash);
                getUpdatedData(url, newVersion, eNotificationType.InstrumentEdited);
            }
        }

        function onUpdateDataComplete(version, context, responseText) {
            var data = JSONHelper.STR2JSON('NotificationsManager/onUpdate' + context.updateditem + 'Complete', responseText, eErrorSeverity.high);

            if (data) {
                CookieHandler.CreateCookie('B', CookieHandler.ReadCookie('B').replace(context.regex, '$1' + version.ver + '$3' + version.hash + '$5'), (new Date()).AddMonths(6));
                context.callback.Invoke(data);
            }
        }

        function getDataTypeToUpdate(notificationType) {
            var regexstring;
            var callback;
            var prop;

            var enumNameFromValue = function (val) {
                for (prop in eNotificationType) {
                    if (eNotificationType[prop] === val) {
                        return prop;
                    }
                }
            };

            switch (notificationType) {
                case eNotificationType.InstrumentEdited:
                    callback = onInstrumentsUpdated;
                    regexstring = /(.*\|)([\d]+)(-VER\|)([\w]+)(-H)/i;
                    break;

                case eNotificationType.MinDealGroupEdited:
                    regexstring = /(.*\|)([\d]+)(-MVER\|)([\w]+)(-MH)/i;
                    callback = onMinDealAmountsUpdated;
                    break;
            }

            return { updateditem: enumNameFromValue(notificationType), regex: regexstring, callback: callback }
        }

        notificationEvents();

        return {
            ProcessData: processData,
            OnInstrumentsUpdated: onInstrumentsUpdated,
            OnMinDealAmountsUpdated: onMinDealAmountsUpdated
        };
    }
);
