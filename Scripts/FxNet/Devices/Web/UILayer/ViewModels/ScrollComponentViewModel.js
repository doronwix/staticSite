define(
    'deviceviewmodels/ScrollComponentViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel');

        var scrollComponentViewModel = general.extendClass(koComponentViewModel, function scrollComponentViewClass(params) {
            var parent = this.parent, // inherited from KoComponentViewModel
                self = this,
                config = params;

            function scrollToIndex(newStartIdx) {
                scroll.scrollContext.startIndex(newStartIdx);
            }

            function omMouseWeel(wheelEvent) {
                var view = config.element.querySelector('div.scrolling-div');

                if (view && wheelEvent.deltaY !== 0) {
                    view.scrollTop += wheelEvent.deltaY;
                }

                if (wheelEvent.preventDefault) {
                    wheelEvent.preventDefault();
                }
                wheelEvent.returnValue = false;
            }

            function syncScrollData(recordsCount) {
                var newArrayLength = Math.min(scroll.scrollContext.maxVisibles, recordsCount);
                if (scroll.scrollContext.scrollData().length !== newArrayLength) {
                    if (scroll.scrollContext.startIndex() !== 0) {
                        scroll.scrollContext.startIndex(0);
                    }
                    scroll.scrollContext.scrollData(new Array(newArrayLength));
                }
            }

            function setSubscribers() {
                self.subscribeTo(scroll.scrollContext.recordsCount, syncScrollData);

                if (config.refScrollAreaElementId) {
                    var refScrollAreaElement = document.getElementById(config.refScrollAreaElementId);
                    if (refScrollAreaElement) {
                        refScrollAreaElement.addEventListener('wheel', omMouseWeel);
                    }
                }
            }

            function divWithScrollOnScroll(nop, event) {
                var divElement = event.srcElement || event.target,
                    newIdx = Math.round(((divElement.scrollTop + divElement.clientHeight) / divElement.scrollHeight) * scroll.scrollContext.recordsCount());

                newIdx = Math.min(scroll.scrollContext.recordsCount() - scroll.scrollContext.maxVisibles, newIdx - scroll.scrollContext.maxVisibles);

                if (!(isNaN(newIdx) || newIdx === scroll.scrollContext.startIndex())) {
                    scroll.scrollContext.startIndex(newIdx);
                }
            }

            function afterContentRendered() {
                setSubscribers();
            }

            function dispose() {
                if (config.refScrollAreaElementId) {
                    var refScrollAreaElement = document.getElementById(config.refScrollAreaElementId);
                    if (refScrollAreaElement) {
                        refScrollAreaElement.removeEventListener("wheel", omMouseWeel);
                    }
                }

                parent.dispose.call(self);
            }

            function init() {
                syncScrollData(scroll.scrollContext.recordsCount());
            }

            var scroll = {
                scrollContext: {
                    startIndex: ko.observable(0),
                    maxVisibles: config.maxVisibles,
                    recordsCount: config.recordsCount,
                    onScroll: scrollToIndex,
                    scrollData: ko.observable([]),
                    divWithScrollOnScroll: divWithScrollOnScroll
                },
                afterContentRendered: afterContentRendered,
                contentTemplate: config.contentTemplate,
                contentContext: config.contentContext,
                dispose: dispose
            }

            init();

            return scroll;
        });

        return scrollComponentViewModel;
    });