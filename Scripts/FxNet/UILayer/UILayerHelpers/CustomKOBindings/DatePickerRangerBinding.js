define(
    'helpers/CustomKOBindings/DatePickerRangerBinding',
    [
        'require',
        'knockout',
        'jquery',
        "vendor/jquery.mobile.datepicker",
        "vendor/jquery.datepicker.extension.range"
    ],
    function(require) {
        var ko = require('knockout'),
            $ = require('jquery');

        ko.bindingHandlers.datePickerRange = {
            init: function(element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    startDate = options.startDate() || '-1w',
                    endDate = options.endDate() || 'now',
                    maxDate = options.maxDate || 'now',
                    onSelectSteps= {
                        firstStep: 1,
                        secondStep: 0
                    };

                $(element).datepicker({
                    dateFormat: 'dd/mm/yy',
                    range: 'period',
                    numberOfMonths: 1,
                    showOtherMonths: true,
                    onSelect: function (dateText, inst, extensionRange) {
                        $(options.startDateInput).val(extensionRange.startDateText);
                        $(options.endDateInput).val(extensionRange.endDateText);
                        options.startDate(extensionRange.startDateText);
                        options.endDate(extensionRange.endDateText);

                        if (extensionRange.step === onSelectSteps.firstStep) {
                            $('.focus').removeClass('focus');
                            $(options.endDateInput).addClass('focus');
                        }

                        if (extensionRange.step === onSelectSteps.secondStep) {
                            $('.focus').removeClass('focus');
                            $(element).toggle();
                        }
                    }
                });

                $(element).datepicker("option", "maxDate", maxDate);
                $(element).datepicker('setDate', [startDate, endDate]);

                $(options.startDateControl).on('click', function() {
                    if ($(this).hasClass('focus')) {
                        $(element).toggle();
                    } else {
                        $(element).show();
                    }

                    $('.focus').removeClass('focus');
                    $(this).addClass('focus');
                    $(element).removeClass('end').addClass('start');
                });

                $(options.endDateControl).on('click', function() {
                    if ($(this).hasClass('focus')) {
                        $(element).toggle();
                    } else {
                        $(element).show();
                    }

                    $('.focus').removeClass('focus');
                    $(this).addClass('focus');
                    $(element).removeClass('start').addClass('end');
                });

                var extensionRange = $(element).datepicker('widget').data('datepickerExtensionRange');

                if (extensionRange.startDateText) {
                    $(options.startDateInput).val(extensionRange.startDateText);
                }

                if (extensionRange.endDateText) {
                    $(options.endDateInput).val(extensionRange.endDateText);
                }
            }
        };
    }
);