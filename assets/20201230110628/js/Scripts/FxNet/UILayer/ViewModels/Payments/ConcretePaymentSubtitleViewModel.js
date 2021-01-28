define(
    'viewmodels/Payments/ConcretePaymentSubtitleViewModel',
    [
        "require",
        "knockout",
        'handlers/general',
    ],
    function (require) {
        var ko = require("knockout"),
            general = require('handlers/general');

        function concretePaymentSubtitleViewModel() {
            var subscribers = [],
                infoObs = {};

            function init() {
                setObservables();
                setComputables();
                setSubscribers();
            }

            function setObservables() {
                infoObs.subtitleContentKey = ko.observable(null);
            }

            function setComputables() {
                infoObs.hasSubtitle = ko.pureComputed(function () { return !general.isEmptyValue(infoObs.subtitleContentKey()); });
            }

            function setSubscribers() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, function (data) {
                    infoObs.subtitleContentKey(data.subtitleContentKey);
                }, true));
            }

            function dispose() {
                subscribers.forEach(function (s) { s.dispose(); });
                subscribers.length = 0;
            }

            init();

            return {
                Info: infoObs,
                dispose: dispose
            };
        }

        return concretePaymentSubtitleViewModel;
    }
);
