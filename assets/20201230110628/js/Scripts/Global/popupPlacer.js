(function ($) {
    $.fn.dynamicPopup = function (initOptions) {

        /**Default Settings
		 * Can be overriden in each plugin call
		 */
        var self = this;
        var settings = $.extend({
            direction: "ltr",
            arrow: true,
            className: "",
            content: ""

        }, initOptions);
        var arrowSelector = ".arrow";

        var popupConstruct = function () {
            return $(self.selector);
        };

        var openPopupInstance = function (options) {
            var container = $(options.hostingContainer);
            if ($(self.selector).length == 0)
                container.append(popupConstruct());

            // add content before the close button
            $(options.content).prependTo(self.selector);

            setPositions(options);
            setEvents(options);
        };
        
        var setPositions = function (options) {
            
            var popup = { obj: $(self.selector), top: $(self.selector).position().top, left: $(self.selector).position().left, height: $(self.selector).height(), width: $(self.selector).width() }
            var hostingContainer = {obj: $(options.hostingContainer), top: $(options.hostingContainer).position().top, left: $(options.hostingContainer).position().left, height: $(options.hostingContainer).height(), width: $(options.hostingContainer).width() }
            var appearsOn = { obj: $(options.appearOn) , top: $(options.appearOn).position().top, left: $(options.appearOn).position().left, height: $(options.appearOn).height(), width: $(options.appearOn).width() }
            var arrow = {obj: $(arrowSelector), top: $(arrowSelector).position().top, left: $(arrowSelector).position().left, height: $(arrowSelector).height(), width: $(arrowSelector).width() }
            var finalPopupPos = { top: 0, left: 0, right: 0 }
            var finalArrowPos = { top: 0, left: 0, right: 0 }

            if (appearsOn.top > popup.height / 2) {
                // after the middle rpws
                finalPopupPos.top = hostingContainer.top + appearsOn.top - popup.height / 2;
                finalArrowPos.top = popup.height / 2 + arrow.height / 4;
            } else {
                // first rows
                finalPopupPos.top = hostingContainer.top;
                finalArrowPos.top = appearsOn.top + arrow.height / 4;
            }

            finalPopupPos.top += options.popupTopOffset;
            finalArrowPos.top += options.popupTopOffset;
            finalArrowPos.left = -15;

            // dynamic left pos of popup
            var barrierPoints = { windowWidth: window.innerWidth, firstBarrier: appearsOn.left, lastBarrier: hostingContainer.width }

            if (window.innerWidth - (popup.width + hostingContainer.width) > 0) {
                // there is enough space on the right side of the table
                finalPopupPos.left = barrierPoints.lastBarrier;
            }
            else {
                finalPopupPos.left = barrierPoints.firstBarrier;
            }

            if (settings.direction === "ltr") {
                // LTR
                $(self.selector).animate({
                    "top": finalPopupPos.top + "px",
                    "left": finalPopupPos.left + "px"

                }, 0).show();
                
                $(arrowSelector).animate({
                    "top": finalArrowPos.top + "px",
                    "left": finalArrowPos.left + "px"

                }, 0).show();               
            }
            else {
                // RTL
                $(self.selector).hide().animate({
                    "top": finalPopupPos.top  + "px",
                    "right": finalPopupPos.left + "px"
                }, 0).show();

                $(arrowSelector).hide().animate({
                    "top": finalArrowPos.top + "px",
                    "right": finalArrowPos.left + "px"
                }, 0).show();         
            }

            $(options.content).css("visibility", "visible");

        };

        var setEvents = function (options) {
            if (options.closeButton) {
                var closeBtn = $(self.selector).find("a.closePopup");
                closeBtn.show();
                closeBtn.unbind('click');
                closeBtn.on("click", function () {
                    $(self.selector).hide();
                    // add also external callback if exists
                    if (options.onCloseCallback != undefined) {
                        options.onCloseCallback();
                    }
                });

            }
        };

        //return new dynamicPopup(options);
        return {
            open: openPopupInstance
        }
    };


}(jQuery))

