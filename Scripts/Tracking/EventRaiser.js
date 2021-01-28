(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/EventRaiser',
            [
                'jquery'
            ], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // running in browser
        root.TrackingEventRaiser = factory;
    }
})(typeof self !== 'undefined' ? self : this,
    function TrackingEventRaiser() {
        // IE<9 Date.now() fix
        Date.now = Date.now || function () { return + new Date(); };

        /**
         * Adds a leading zero to a number
         * @param {Number} number 
         * @returns {String}
         */
        function padNumber(number) {
            return ('0' + number).slice(-2);
        }

        /**
         * Formats a Date object as a `dd/mm/yyyy hh:mm:ss` string
         * @param {Date} date 
         * @returns {String} 
         */
        function formatEventDate(date) {
            var formattedDateString = padNumber(date.getDate()) + '/' +
                padNumber(date.getMonth() + 1) + '/' +
                date.getFullYear() + ' ' +
                padNumber(date.getHours()) + ':' +
                padNumber(date.getMinutes()) + ':' +
                padNumber(date.getSeconds());

            return formattedDateString;
        }

        function getEventTime() {
            var eventTime;

            if (typeof $cacheManager !== 'undefined') {
                eventTime = formatEventDate($cacheManager.ServerTime());
            }
            else {
                eventTime = formatEventDate(new Date(Date.now() + (new Date().getTimezoneOffset() * 60 * 1000)));
            }

            return eventTime;
        }

        var eventData = {};

        function addEventTime() {
            eventData.EventTime = getEventTime();
        }

        function callGoogleApi() {
            try {
                window.dataLayer.push(getEventDataClone());
            }
            catch (ex) {
                ErrorManager.onError('callGoogleApi', 'Google Tag Manager has failed for event: ' + eventData.event, eErrorSeverity.high);
            }
        }

        function getEventDataClone() {
            return $.extend(true, {}, eventData);
        }

        function clean() {
            for (var prop in eventData) {
                if (eventData.hasOwnProperty(prop)) {
                    delete eventData[prop];
                }
            }
        }

        function raiseEvent() {
            addEventTime();
            callGoogleApi();
            clean();
        }

        return {
            eventData: eventData,
            raiseEvent: raiseEvent,
            formatEventDate: formatEventDate
        };
    }
);
