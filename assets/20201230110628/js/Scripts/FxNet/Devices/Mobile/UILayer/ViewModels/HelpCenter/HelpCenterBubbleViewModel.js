define(
    'deviceviewmodels/helpcenter/HelpCenterBubbleViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!HelpcHub'
    ],
    function (require) {
        var ko = require('knockout'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            general = require('handlers/general'),
            stateObjectHelpc = require("StateObject!HelpcHub");

        var HelpCenterBubbleViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                soSubscriptions = [],
                hidePersonalGuide = ko.observable(stateObjectHelpc.get('HidePersonalGuide') || false);

            function init() {
                parent.init.call(self, params);
                setStatesObject();

                data.showBubble = ko.observable(false);
                data.bubbleVisible = ko.pureComputed(function () {
                    var v = data.showBubble() && params.visible() && !hidePersonalGuide();
                    return v;
                });

                setSubscriptions();
            }

            function setStatesObject() {
                if (general.isNullOrUndefined(stateObjectHelpc.get('visible'))) {
                    stateObjectHelpc.set('visible', false);
                }

                if (general.isNullOrUndefined(stateObjectHelpc.get('showBubble'))) {
                    stateObjectHelpc.set('showBubble', false);
                }
            }

            function setSubscriptions() {
                soSubscriptions.push({
                    unsubscribe: stateObjectHelpc.subscribe('showBubble', function (value) {
                        if (!general.isEmptyValue(value)) {
                            data.showBubble(value);
                            if (value) {
                                stateObjectHelpc.update('showNotification', true);
                            }
                        }
                    })
                },
                    {
                        unsubscribe: stateObjectHelpc.subscribe('HidePersonalGuide', function (value) {
                            hidePersonalGuide(!!value);
                        })
                    });
            }

            function showHelpCenter() {
                hideBubble();
                stateObjectHelpc.update('visible', true);
                stateObjectHelpc.update('showBubble', false);
            }

            function hideBubble() {
                stateObjectHelpc.update('showNotification', true);
            }

            function dispose() {
                while (soSubscriptions.length > 0) {
                    soSubscriptions.pop().unsubscribe();
                }

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                data: data,
                showHelpCenter: showHelpCenter,
                hideBubble: hideBubble
            };
        });

        var createViewModel = function (params) {
            var viewModel = new HelpCenterBubbleViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
