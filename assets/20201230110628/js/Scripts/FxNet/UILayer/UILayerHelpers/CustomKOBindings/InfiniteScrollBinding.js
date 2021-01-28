define(
    'helpers/CustomKOBindings/InfiniteScrollBinding',
    [
        'require',
        'knockout',
        'jquery'
    ],
    function (require) {
        var ko = require('knockout'),
            $ = require('jquery');

        ko.bindingHandlers.scrollInfinite = {
            updating: true,
            init: function (element) {
                var self = this;

                self.updating = true;

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(window).off("scroll.ko.scrollHandler");
                    self.updating = false;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var props = allBindingsAccessor().scrollOptions;
                var offset = props.offset ? props.offset : "0";
                var loadFunc = props.loadFunc;
                var load = ko.utils.unwrapObservable(valueAccessor());
                var self = this;

                if (load) {
                    element.style.display = "";
                    $(window).on("scroll.ko.scrollHandler", function () {
                        if ($(window).scrollTop() >= $(document).height() - $(window).height() - offset) {
                            if (self.updating) {
                                loadFunc();
                                self.updating = false;
                            }
                        }
                        else {
                            self.updating = true;
                        }
                    });
                }
                else {
                    $(window).off("scroll.ko.scrollHandler");
                    self.updating = false;
                }
            }
        };
    }
);
