/* global eStartSpinFrom */
define(
    'viewmodels/limits/RateFieldModel',
    [
        'require',
        'knockout'
    ],
    function (require) {
        var ko = require('knockout');

        function RateFieldModel() {
            var self = this,
                minPips1 = ko.observable(Number.MIN_VALUE),
                maxPips1 = ko.observable(Number.MAX_VALUE),
                minPips2 = ko.observable(Number.MIN_VALUE),
                maxPips2 = ko.observable(Number.MAX_VALUE);

            self.minValidation = self.minValidation1 = ko.observable(Number.MIN_VALUE);
            self.maxValidation = self.maxValidation1 = ko.observable(Number.MAX_VALUE);
            self.minValidation2 = ko.observable(Number.MIN_VALUE);
            self.maxValidation2 = ko.observable(Number.MAX_VALUE);

            self.precision = ko.observable(0);
            self.pipDigit = ko.observable(0);
            self.startSpinFrom = ko.observable(eStartSpinFrom.None);
            self.near = ko.observable();
            self.far = ko.observable();

            self.min = self.min1 = ko.pureComputed({
                read: minPips1,
                write: function(rawValue) {
                    var value = Format.roundToPip(rawValue, self.pipDigit(), self.precision(), ">");

                    if (value === false) {
                        minPips1(Number.MIN_VALUE);
                    }

                    minPips1(Number(value));
                    self.minValidation1(rawValue);
                },
                owner: self
            });

            self.max = self.max1 = ko.pureComputed({
                read: maxPips1,
                write: function(rawValue) {
                    var value = Format.roundToPip(rawValue, self.pipDigit(), self.precision(), "<");

                    if (value === false) {
                        maxPips1(Number.MAX_VALUE);
                    }

                    maxPips1(Number(value));
                    self.maxValidation1(rawValue);
                },
                owner: self
            });

            self.min2 = ko.pureComputed({
                read: minPips2,
                write: function(rawValue) {
                    var value = Format.roundToPip(rawValue, self.pipDigit(), self.precision(), ">");

                    if (value === false) {
                        minPips2(Number.MIN_VALUE);
                    }

                    minPips2(Number(value));
                    self.minValidation2(rawValue);
                },
                owner: self
            });

            self.max2 = ko.pureComputed({
                read: maxPips2,
                write: function(rawValue) {
                    var value = Format.roundToPip(rawValue, self.pipDigit(), self.precision(), "<");

                    if (value === false) {
                        maxPips2(Number.MAX_VALUE);
                    }

                    maxPips2(Number(value));
                    self.maxValidation2(rawValue);
                },
                owner: self
            });

            self.format = ko.pureComputed(function() {
                var precision = parseInt(self.precision(), 10);
                if (!isNaN(precision) && precision >= 0) {
                    return "n" + precision;
                } else {
                    return "n";
                }
            });

            self.step = ko.pureComputed(function() {
                var pipDigit = parseInt(self.pipDigit(), 10);
                if (isNaN(pipDigit)) {
                    return 1;
                }

                return 1 / Math.pow(10, pipDigit);
            });
        }

        return RateFieldModel;
    }
);