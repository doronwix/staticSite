function TrackingEventsCollector(ko, eventsCollection, externalPages) {
    var uiLoaded = false, scmmDataLoaded = false,
        customerDataLoaded = false, eventsQueue = [], trackingGlobalData = {};;

    function init(trackingData, evCollection) {
        trackingGlobalData = trackingData;
        eventsCollection = evCollection || eventsCollection;

        if (externalPages) {
            uiLoaded = true;
            scmmDataLoaded = true;
            customerDataLoaded = true;

            // desktop specific elimination :
            if (!window.environmentData || !window.environmentData.isDesktop) {
                window.externalEventsCallbacks.add(consumeEvent);
            }
        }
        else {
            ko.postbox.subscribe('trading-event', consumeEvent);
            ko.postbox.subscribe('ui-loaded', onUiFinishedLoading);
            ko.postbox.subscribe('scmm-data-loaded', onScmmDataLoaded);
            ko.postbox.subscribe('customer-data-loaded', onCustomerDataLoaded);
        }
    }

    function onUiFinishedLoading() {
        uiLoaded = true;

        if (eventsResourcesLoaded()) {
            executeAllQueuedEvents();
        }

        consumeEvent("exposeUI");
    }

    function onScmmDataLoaded() {
        scmmDataLoaded = true;

        if (eventsResourcesLoaded()) {
            executeAllQueuedEvents();
        }
    }

    function onCustomerDataLoaded() {
        customerDataLoaded = true;

        if (eventsResourcesLoaded()) {
            executeAllQueuedEvents();
        }
    }

    function executeAllQueuedEvents() {
        while( eventsQueue.length > 0){
            var element = eventsQueue.shift();
            consumeEvent(element.eventName, element.additionalData);

        }
        
    }

    function consumeEvent(eventName, additionalData) {
        if (!eventsResourcesLoaded()) { // push events to queue if resources for the events did not load yet
            eventsQueue.push({ eventName: eventName, additionalData: additionalData });
            return;
        }

        addGlobalPropertiesToCurrentEvent();

        //on smart client tracking
        if (window.environmentData && window.environmentData.isDesktop) {
            Object.assign(eventsCollection.getCurrentEventData(), additionalData);
            eventsCollection.raiseEvent(eventName);
            return;
        }

        eventsCollection[eventName](additionalData);
    }

    function eventsResourcesLoaded() {
        return uiLoaded && scmmDataLoaded && customerDataLoaded;
    }

    function addGlobalPropertiesToCurrentEvent() {
        Object.assign(eventsCollection.getCurrentEventData(), trackingGlobalData.getProperties());
    }

    return {
        init: init,
        consumeEvent: consumeEvent
    };
};