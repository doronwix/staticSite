$(document).ready(function () {
    Tooltip.init();
});

var Tooltip = {
    init: function () {
        this.setDomEvents();
    },
    setDomEvents: function () {
        var options = {
            tooltipClass: 'tooltip tooltipBottom',
            position: {
                my: 'center bottom',
                at: 'center top-10'
            }
        };

        $.extend(options.position, {
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>").addClass("arrow")
	                .addClass(feedback.vertical)
	                .addClass(feedback.horizontal)
                    .appendTo(this);
            }
        });

        $('.ask')
            .tooltip(options,
            {
            	show: false,
                hide: false,
                content: function () {
                    return $(this).attr('title');
                },
                close: function () {
                    $(".ui-helper-hidden-accessible").remove();
                }
            });
    }
};