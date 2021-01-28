(function (window) {

    window.externalEventsCallbacks = $.Callbacks();

    function configTracking() {

        if (typeof window.Model == 'undefined') {
            return;
        }

        var googleTagManagerId = window.Model.GoogleTagManagerId || '';
        var configuration = {}, abTesting = window.ABTestConfiguration;
        var biServiceURL = window.Model.BIServiceURL || '';

        if (abTesting && abTesting.Status === 1) {
            configuration = abTesting.Result.reduce(function (accumulator, ab) {
                var abTests = JSON.parse(ab.Configuration),
                    keys = Object.keys(abTests);
                for (var kIdx = 0; kIdx < keys.length; kIdx++) {
                    accumulator[keys[kIdx]] = abTests[keys[kIdx]];
                }
                return accumulator;
            }, {})
        }

        window.fxTracking.init(googleTagManagerId, configuration, biServiceURL);

        var trackingEvents = TrackingExternalEvents(TrackingEventRaiser());

        window.trackingEventsCollector = new TrackingEventsCollector(null, trackingEvents, true);
        window.trackingEventsCollector.init(window.trackingData);

        new ValidationErrorsTracker().init();
    }

    // on Desktop SC application, not internal external 
    if (window.environmentData && window.environmentData.isDesktop) {
        configTracking();
        return;
    }

    // else for external internal web trader application 

    // todo tracking : why need to document ready?
    // anyway in desktop / we do not need to wait for 
    $(document).ready(function () {
        configTracking();
    });

}(window));