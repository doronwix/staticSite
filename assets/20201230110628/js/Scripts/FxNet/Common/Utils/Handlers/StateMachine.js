function TStateMachine() {
    var machineStates;
    var indexes = {}; //just for convinience
    var currentState;

    function init(states) {
        machineStates = states;

        for (var i = 0, length = machineStates.length; i < length; i++) {
            indexes[machineStates[i].name] = i;

            if (machineStates[i].initial) {
                currentState = states[i];
            }
        }
    }

    function consumeEvent(e) {
        if (currentState.events[e]) {
            currentState = machineStates[indexes[currentState.events[e]]];
        }
    }

    function getStatus() {
        return currentState.name;
    }

    return {
        Init: init,
        ConsumeEvent: consumeEvent,
        GetStatus: getStatus
    };
}