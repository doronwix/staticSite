define(
    'devicehelpers/keyboard-status',
    [
        'knockout'
    ],
    function (ko) {
        var kybOn = ko.observable(),
            maxHeight = -1,
            maxWidth = -1,
            height4calculations,
            deltaHeight = 0.33;

        if (!window.matchMedia) {
            return;
        }

        function isPortretLayout() {
            return window.matchMedia("(orientation: portrait)").matches
        }

        function setMaxSizes() {
            if (isPortretLayout()) {
                maxHeight = Math.max(maxHeight, screen.height);
                maxWidth = Math.max(maxWidth, screen.width);
                height4calculations = maxHeight;
            }
            else {
                maxHeight = Math.max(maxHeight, screen.width);
                maxWidth = Math.max(maxWidth, screen.height);
                height4calculations = maxWidth;
            }
        }

        setMaxSizes();

        function isKeyboardVisible() {
            var currentDeltaHeight = Math.abs((height4calculations - window.innerHeight) / height4calculations);

            var kybIsVisible = (currentDeltaHeight >= deltaHeight);

            return kybIsVisible;
        }

        kybOn(isKeyboardVisible());

        window.addEventListener('resize', function () {
            setMaxSizes();

            if (kybOn() !== isKeyboardVisible()) {
                kybOn(isKeyboardVisible());
            }
        })

        ko.bindingHandlers['kyb-status'] = {
            update: function (element, valueAccessor) {
                var keyboardOnClass = 'kybOn',
                    keyboardOffClass = 'kybOff';

                var subscription = kybOn.subscribe(function (keybOn) {
                    var cNew = keybOn ? keyboardOnClass : keyboardOffClass,
                        cToRemove = keybOn ? keyboardOffClass : keyboardOnClass;

                    element.classList.remove(cToRemove);
                    element.classList.add(cNew);
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    if (subscription) {
                        subscription.dispose();
                        subscription = null;
                    }
                });
            }
        }
    }
);
