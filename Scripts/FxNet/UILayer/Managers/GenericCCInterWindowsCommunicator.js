define(
    "managers/GenericCCInterWindowsCommunicator",
    [
        "JSONHelper",
        'handlers/general',
        'dataaccess/dalCommon',
        'dataaccess/dalDeposit'
    ],
    function () {
        var jsonHelper = require("JSONHelper"),
            general = require('handlers/general'),
            dalCommon = require('dataaccess/dalCommon'),
            dalDeposit=  require('dataaccess/dalDeposit');

        var allowedSourceOfMessagesUrl;
        var messageHandler;

        if (window.addEventListener) {
            window.addEventListener("message", receiveMessage, false);
        }

        function receiveMessage(event) {

            if (!allowedSourceOfMessagesUrl || !messageHandler) {
                return;
            }

            if (event.origin.replace(/\/$/, "") !== allowedSourceOfMessagesUrl.replace(/\/$/, "")) {
                return;
            }

            if (general.isStringType(event.data) && !jsonHelper.IsValid(event.data)) {
                return;
            }

            var message = jsonHelper.STR2JSON("GenericCCInterWindowsCommunicator/receiveMessage", event.data, eErrorSeverity.medium);

            if (general.isNullOrUndefined(message)) {
                return;
            }

            dalDeposit.LogGenericCCDepositCommunication(message.msg, event.data, "received");

            if (!messageHandler.hasOwnProperty(message.msg)) {
                dalCommon.WriteInfoLog(message.msg, "[Not a function] Message object: " + objectToString(message) + ",\nEvent object:" + objectToString(event) + ",\nEvent origin:" + objectToString(event.origin) + ",\nEvent data:" + objectToString(event.data));
            } else {
                messageHandler[message.msg](message.value);
            }
        }

        function unregisterMessageHandler() {
            messageHandler = null;
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

        function setMessageHandler(messageSourceUrl, handler) {
            logHandlerRegistration(messageSourceUrl, handler);

            allowedSourceOfMessagesUrl = messageSourceUrl;
            messageHandler = handler;

        }

        function postMessage(destination, action, targetOrigin) {
            if (isDestinationLoaded(destination, targetOrigin)) {
                destination.postMessage(action, targetOrigin);
                dalDeposit.LogGenericCCDepositCommunication(action.msg, JSON.stringify(action), "sent");
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
            registerMessageHandler: setMessageHandler,
            unregisterMessageHandler: unregisterMessageHandler,
            postMessage: postMessage
        };
    });