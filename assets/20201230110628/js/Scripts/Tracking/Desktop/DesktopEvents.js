function TrackingDesktopEvents(eventRaiser) {
    this.raiseEvent = function (name) {

        eventRaiser.eventData.event = name;
        eventRaiser.raiseEvent();
    };

 
    this.getCurrentEventData = function() {
        return eventRaiser.eventData;
    };
}