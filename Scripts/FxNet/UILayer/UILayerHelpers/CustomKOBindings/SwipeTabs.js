define(
    'helpers/CustomKOBindings/SwipeTabs',
    [
        'knockout'
    ],
    function (ko) {
        ko.bindingHandlers.swipeTabs = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor());

                if (!options) {
                    return;
                }

                swipe(element, 150, function (currentX, startX) {
                    var swiped;

                    if (currentX > startX && typeof options.toRight === "function") {
                        swiped = options.toRight();
                    }

                    if (currentX < startX && typeof options.toLeft === "function") {
                        swiped = options.toLeft();
                    }

                    if (swiped) {
                        window.scrollTo(0, 1);
                    }
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    swipeDestroy(elementToDispose);
                });
            }
        };
    }
);
