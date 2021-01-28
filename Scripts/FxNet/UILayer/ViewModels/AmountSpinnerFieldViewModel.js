define(
    'viewmodels/AmountSpinnerFieldViewModel',
    [
        'require',
        'knockout',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            Dictionary = require('Dictionary');

        function AmountSpinnerFieldViewModel(params) {
            var stepSubscriber,
                valueSubscriber,
                optionsSubscriber,
                tooltipSubscriber,
                isValidSubscriber,
                tooltipClosedSubscriber,
                forceNonFractionalValueSubscriber;

            var step = ko.observable(1),
                format = ko.pureComputed(function() {
                    var numberOfDecimalDigits = (step().toString().split(".")[1] || "").length;

                    return numberOfDecimalDigits;
                }),
                minValue = ko.observable(),
                maxValue = ko.observable(),
                showAmountTooltip = ko.observable(false),
                isSelectedAmountValid = ko.observable(true);

            function extendObservables() {
                // Tooltip validation
                params.value.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip",null,""),
                        notify: 'always',
                        showTooltip: function () {
                            return  showAmountTooltip() }
                    }
                });

                setRanges(false);
            }


            function setRanges(reset) {
                var nonFractionalValue = params.forceNonFractionalValue()
                if (reset) {
                    stepSubscriber.dispose();
                    params.value.extend({ toNumericLength: false });
                    params.value.extend({ incremental: false });
                }

                params.value.extend({
                    toNumericLength: {
                        ranges: [
                            { from: 0, to: 10, decimalDigits: (nonFractionalValue ? 0 : 1) },
                            { from: 10, to: Number.MAX_SAFE_INTEGER, decimalDigits: 0 }
                        ]
                    }
                });

                // make it incremental
                params.value.extend({
                    incremental: {
                        ranges: [
                            { from: 0, to: 10, step: (nonFractionalValue ? 1 : 0.1) },
                            { from: 10, to: 100, step: 1 },
                            { from: 100, to: 1000, step: 10 },
                            { from: 1000, to: 10000, step: 100 },
                            { from: 10000, to: 100000, step: 1000 },
                            { from: 100000, to: 1000000, step: 10000 },
                            { from: 1000000, to: 10000000, step: 100000 },
                            { from: 10000000, to: 100000000, step: 1000000 },
                            { from: 100000000, to: 1000000000, step: 10000000 },
                            { from: 1000000000, to: 10000000000, step: 100000000 },
                            { from: 10000000000, to: 100000000000, step: 1000000000 }
                        ]
                    }
                });

                step(params.value.step());

                stepSubscriber = params.value.step.subscribe(function (value) {
                    step(value);
                });
            }

            function buildValidation(minMaxValues) {
                minMaxValues = minMaxValues || [];

                minValue(minMaxValues[0] || 0);
                maxValue(minMaxValues[1] || 10000000000);
            }

            function setSubscribers() {
                optionsSubscriber = params.options.subscribe(function (values) {
                    var actualValues = values.map(function (item) {
                        return item.value;
                    });
                    
                    buildValidation(actualValues);
                }, null, 'arrayChange');

                tooltipClosedSubscriber = params.value.tooltipClosed.subscribe(function (isClosed) {
                    if (isClosed) {
                        showAmountTooltip(false);
                    }
                });

                valueSubscriber = params.value.subscribe(function () {
                    showAmountTooltip(false);
                });

                tooltipSubscriber = ko.postbox.subscribe('deal-slip-show-validation-tooltips', function () {
                    params.value.resetTooltip();
                    showAmountTooltip(true);
                });

                isValidSubscriber = params.value.isValid.subscribe(function (isValid) {
                    isSelectedAmountValid(isValid);
                });

                forceNonFractionalValueSubscriber = params.forceNonFractionalValue.subscribe(function () {
                    setRanges(true);
                });
            }

            function dispose() {
                format.dispose();
                stepSubscriber.dispose();
                tooltipClosedSubscriber.dispose();
                valueSubscriber.dispose();
                tooltipSubscriber.dispose();
                isValidSubscriber.dispose();
                params.value.extend({ incremental: false });
                params.value.extend({ tooltipValidation: false });
                params.value.extend({ toDealAmount: false });

                optionsSubscriber.dispose();
                forceNonFractionalValueSubscriber.dispose();
            }

            extendObservables();
            buildValidation(ko.utils.unwrapObservable(params.options));
            setSubscribers();

            return {
                id: params.id,
                name: params.name,
                label: params.label || null,
                value: params.value,
                isSelectedAmountValid: isSelectedAmountValid,
                min: minValue,
                max: maxValue,
                step: step,
                format: format,
                dispose: dispose
                
            };
        }

        return AmountSpinnerFieldViewModel;
    }
);