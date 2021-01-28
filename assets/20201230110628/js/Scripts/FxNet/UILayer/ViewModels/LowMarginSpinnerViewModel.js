define(
    'viewmodels/LowMarginSpinnerViewModel',
    [
        'require',
        'knockout'
    ],
    function (require) {
        var ko = require('knockout');

        function LowMarginSpinnerViewModel(params) {
            var valueSubscriber,
                optionsSubscriber,
                isValidSubscriber;

            var step = ko.observable(1),
                minValue = ko.observable(),
                maxValue = ko.observable(),
                showAmountTooltip = ko.observable(false),
                isSelectedAmountValid = ko.observable(true),
                enabled = ko.observable(true);

            function extendObservables() {
                params.value.extend({
                    toNumericLength: {
                        ranges: [
                            { from: 0, to: 10, decimalDigits: 2 },
                            { from: 10, to: Number.MAX_SAFE_INTEGER, decimalDigits: 0 }
                        ]
                    }
                });

                params.value.extend({
                    incremental: {
                        ranges: [
                            { from: 0, to: 10, step: 0.25 }
                        ]
                    }
                });
                step(params.step);

                if (ko.isObservable(params.enabled))
                    enabled = params.enabled;

                if (ko.isObservable(params.amountValidSubscriber))
                    isSelectedAmountValid = params.amountValidSubscriber;
            }

            function buildValidation(minMaxValues) {
                minMaxValues = minMaxValues || [];

                minValue(minMaxValues[0] || 0);
                maxValue(minMaxValues[1] || 10000000000);
            }

            function setSubscribers() {
                optionsSubscriber = params.options.subscribe(function () {
                    buildValidation(this._target());
                }, null, 'arrayChange');

                valueSubscriber = params.value.subscribe(function () {
                    showAmountTooltip(false);
                });

                isValidSubscriber = params.value.isValid.subscribe(function (isValid) {
                    isSelectedAmountValid(isValid);
                });
            }

            function dispose() {
                valueSubscriber.dispose();
                isValidSubscriber.dispose();

                params.value.extend({ toDealAmount: false });
                params.value.extend({ incremental: false });

                optionsSubscriber.dispose();
            }

            extendObservables();
            buildValidation(ko.utils.unwrapObservable(params.options));
            setSubscribers();

            return {
                id: params.id,
                name: params.name,
                value: params.value,
                isSelectedAmountValid: isSelectedAmountValid,
                min: minValue,
                max: maxValue,
                step: step,
                dispose: dispose,
                enabled: enabled
            };
        }

        return LowMarginSpinnerViewModel;
    }
);