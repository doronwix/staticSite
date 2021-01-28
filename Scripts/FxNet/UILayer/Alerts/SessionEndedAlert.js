define(
    'alerts/SessionEndedAlert',
    [
        'devicealerts/Alert',
        "Dictionary",
        'handlers/general'
    ],
    function (AlertBase, Dictionary, general) {
        function SessionEndedAlert() {
            var inheritedAlertInstance = new AlertBase();

            function doCloseAction() {
                if (general.isFunctionType(inheritedAlertInstance.properties.onCloseAction)) {
                    inheritedAlertInstance.properties.onCloseAction();
                }
            }

            function onOk() {
                inheritedAlertInstance.onClose();
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem("sessionEndedReconnectBtn"),
                        onOk,
                        'btnOk'
                    )
                );
            }

            function init() {
                inheritedAlertInstance.alertName = "SessionEndedAlert";
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.onCloseAction.Add(doCloseAction);

                createButtons();
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            }
        }

        return SessionEndedAlert;
    }
);
