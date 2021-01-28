define(
    'devicewidgets/spinner',
    [
        'require',
        'jquery'
    ],
    function(require) {
        var $ = require('jquery');

        var fxspinner = $.widget("fx.fxspinner", $.ui.spinner,
            {
                _events: {
                    blur: function(event) {
                        if (this.cancelBlur) {
                            delete this.cancelBlur;
                            return;
                        }

                        this._stop();
                        this._value(this.element.val(), true);
                        this._refresh();

                        if (this.previous !== this.element.val()) {
                            this._trigger("change", event);
                        }
                    }
                }
            }
        );

        return fxspinner;
    }
);