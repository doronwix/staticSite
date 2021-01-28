define(
    "FxNet/UILayer/Managers/InterWindowsCommunicator",
    [
        "require",
        'handlers/general',
        "JSONHelper",
        'dataaccess/dalCommon'
    ],
    function(require) {
        var JSONHelper = require("JSONHelper"),
            general = require('handlers/general'),
            dalCommon = require('dataaccess/dalCommon');

        function InterWindowsCommunicator(source, sourceId) {
            var allowedSourceOfMessages;
            var messageHandler;

            function receiveMessage(event) {
                if (!allowedSourceOfMessages || !messageHandler) {
                    return;
                }

                if (event.origin.replace(/\/$/, "") !== allowedSourceOfMessages.replace(/\/$/, "")) {
                    return;
                }

                if (general.isStringType(event.data) && !JSONHelper.IsValid(event.data)) {
                    return;
                }

                var message = JSONHelper.STR2JSON("InterWindowsCommunication/receiveMessage", event.data, eErrorSeverity.medium);
                if (general.isNullOrUndefined(message) || (sourceId && (!message.id || message.id !== sourceId))) {
                    return;
                }
                
                if (!messageHandler.hasOwnProperty(message.msg)) {
                    dalCommon.WriteInfoLog(message.msg, "[Not a function] Message object: " + objectToString(message) + ",\nEvent object:" + objectToString(event) + ",\nEvent origin:" + objectToString(event.origin) + ",\nEvent data:" + objectToString(event.data));
                } else {
                    messageHandler[message.msg](message.value);
                }
            }

            function logHandlerRegistration(sourceOfMessages, handler) {
                var handlerMembers = "";

                for (var member in handler) {
                    if (handler.hasOwnProperty(member)) {
                        handlerMembers += "\t" + member + "\n";
                    }
                }

                dalCommon.WriteInfoLog("RegisterHandler", "Registered handler for source: " + sourceOfMessages + "\nHandler members:\n" + handlerMembers.slice(0, -1));
            }

            function objectToString(object) {

                var objectMembers = object.toString() + "\n";

                for (var member in object) {
                    if (object.hasOwnProperty(member)) {
                        objectMembers += "\t" + member + "\n";
                    }
                }

                return objectMembers;
            }

            function registerMessageHandler(sourceOfMessages, handler) {
                logHandlerRegistration(sourceOfMessages, handler);

                allowedSourceOfMessages = sourceOfMessages;
                messageHandler = handler;

                if (source.addEventListener) {
                    source.addEventListener("message", receiveMessage, false);
                } else {
                    source.attachEvent("onmessage", receiveMessage);
                }
            }

            function unregisterMessageHandler() {
                if (source.removeEventListener) {
                    source.removeEventListener("message", receiveMessage);
                } else {
                    source.detachEvent("onmessage", receiveMessage);
                }
            }

            function postMessage(destination, action, targetOrigin) {
                if (isDestinationLoaded(destination, targetOrigin)) {
                    destination.postMessage(JSON.stringify(action), targetOrigin);
                }
            }

            function isDestinationLoaded(destination, targetOrigin) {
                if (!destination || !destination.postMessage) {
                    return false;
                }

                var loaded = false;

                try {
                    if (destination.location && destination.location.href.indexOf(targetOrigin) >= 0) {
                        loaded = true;
                    }
                } catch (ex) {
                    loaded = true;
                }

                return loaded;
            }

            return {
                registerMessageHandler: registerMessageHandler,
                unregisterMessageHandler: unregisterMessageHandler,
                postMessage: postMessage
            };
        }

        return InterWindowsCommunicator;
    }
);