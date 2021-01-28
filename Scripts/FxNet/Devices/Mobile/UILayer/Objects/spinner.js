define(
    'devicewidgets/spinner',
    [
        'require',
        'jquery'
    ],
    function (require) {
        var $ = require('jquery');

        var fxspinner = $.widget("fx.fxspinner", $.ui.spinner,
            {
                _events: {
                    blur: function (event) {
                        this._delay(function () {
                            var isBecauseOfSpinButtons = this.element.parent().find(document.activeElement).length > 0;

                            if (!isBecauseOfSpinButtons) {
                                this._stop();
                                this._value(this.element.val(), true);
                                this._refresh();

                                if (this.previous !== this.element.val()) {
                                    this._trigger("change", event);
                                }
                            }
                        });
                    },

                    mousewheel: function (event) {
                        event.preventDefault();
                    },
                    "mousedown .ui-spinner-button": function (event) {
                        event.preventDefault();

                        if (this._start(event) === false) {
                            return;
                        }

                        this._repeat(null, $(event.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, event);

                        $(event.currentTarget).trigger('focus');
                    },
                    "touchstart .ui-spinner-button": function (event) {
                        event.preventDefault();

                        if (this._start(event) === false) {
                            return;
                        }

                        this._repeat(null, $(event.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, event);

                        $(event.currentTarget).trigger('focus');
                    },
                    "touchend .ui-spinner-button": function (event) {
                        event.preventDefault();

                        this._stop(event);
                    },
                    "touchenter .ui-spinner-button": function (event) {
                        event.preventDefault();

                        // button will add ui-state-active if mouse was down while mouseleave and kept down
                        if (!$(event.currentTarget).hasClass("ui-state-active")) {
                            return;
                        }

                        if (this._start(event) === false) {
                            return false;
                        }

                        this._repeat(null, $(event.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, event);

                        $(event.currentTarget).trigger('focus');
                    },
                    "touchleave .ui-spinner-button": function (event) {
                        event.preventDefault();

                        this._stop(event);
                    }
                }
            }
        );

        return fxspinner;
    }
);