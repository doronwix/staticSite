define('helpers/CustomKOBindings/PrintBinding',
    [
        'require',
        'knockout',
        'managers/PrintExportManager'
    ],
    function (require) {
        var ko = require('knockout'),
            printExportManager = require('managers/PrintExportManager');

        // will add to element class "cssClass" when is in process of print
        ko.bindingHandlers.printing = {
            init: function (element) {
                var cssClass = 'fx-is-printing';

                function addRemovePrintClass(isProcessing) {
                    if (isProcessing) {
                        element.classList.add(cssClass);
                    } else {
                        element.classList.remove(cssClass);
                    }
                }

                var subscriber = printExportManager.IsPrintingNow.subscribe(addRemovePrintClass);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    if (subscriber) {
                        subscriber.dispose();
                    }
                });
            }
        }
    });