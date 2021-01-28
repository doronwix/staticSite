
(function (factory) {
    if (typeof define === "function" && define.amd) {

        define([
            "jquery",
            "vendor/jquery-ui"
        ], factory);
    } else {

        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.widget("mobile.date", {
        options: {
            defaultDate: null,
            appendText: "",
            buttonText: "...",
            buttonImage: "",
            buttonImageOnly: false,
            hideIfNoPrevNext: false,
            navigationAsDateFormat: false,
            gotoCurrent: false,
            changeMonth: false,
            changeYear: false,
            yearRange: "c-10:c+10",
            showOtherMonths: false,
            selectOtherMonths: false,
            showWeek: false,
            // patch , this line failed on prod mode- uglify:prod (mangled and compressed)
            calculateWeek: $.datepicker.iso8601Week, //: this.iso8601Week,

            shortYearCutoff: "+10",
            minDate: null,
            maxDate: null,
            beforeShowDay: null,
            onSelect: null,
            onChangeMonthYear: null,
            beforeShow: null,
            numberOfMonths: 1,
            showCurrentAtPos: 0,
            stepMonths: 1,
            stepBigMonths: 12,
            altField: "",
            altFormat: "",
            constrainInput: true,
            showButtonPanel: false,
            autoSize: false,
            disabled: false,
            inline: false,
            theme: "a",
            dateFormat: "mm/dd/yy"
        },
        _getCreateOptions: function () {
            $.extend(this.options, $.datepicker._defaults);
            return this._super();
        },
        _create: function () {
            var calendar;

            if (this.options.inline) {
                this.options.altField = this.element;
                calendar = $("<div>").datepicker(this.options);
                this.element.parent().after(calendar);
            } else {
                this.element.datepicker(this.options);
                calendar = this.element.datepicker("widget");
            }

            this.baseWidget = (!this.options.inline) ? this.element : this.calendar;

            if (this.options.inline) {
                this._on({
                    "change": function () {
                        calendar.datepicker("setDate", this.element.val());
                    }
                });
            }
        },
        setOption: function (key, value) {
            this.baseWidget.datepicker("option", key, value);
        },
        getDate: function () {
            return this.baseWidget.datepicker("getDate");
        },
        _destroy: function () {
            return this.baseWidget.datepicker("destroy");
        },
        isDisabled: function () {
            return this.baseWidget.datepicker("isDisabled");
        },
        refresh: function () {
            return this.baseWidget.datepicker("refresh");
        },
        setDate: function (date) {
            return this.baseWidget.datepicker("setDate", date);
        },
        widget: function () {
            return this.element;
        }
    });

    return $.mobile.date;

}));
