define(
    'helpers/CustomKOBindings/NumericFieldBinding',
    [
        'require',
        'knockout',
        'jquery'
    ],
    function(require) {
        var ko = require('knockout'),
            $ = require('jquery');

        ko.bindingHandlers.numericField = {
            init: function(element, valueAccessor) {
                var numericOptions = ko.utils.unwrapObservable(valueAccessor()),
                    defaults = {
                        negative: true
                    },
                    options = $.extend(defaults, numericOptions);

                $(element).numeric(options);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function(elementToDispose) {
                    $(elementToDispose).removeNumeric();
                });
            }
        };
    }
);
