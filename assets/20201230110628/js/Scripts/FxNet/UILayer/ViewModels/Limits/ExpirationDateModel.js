define(
    'viewmodels/limits/ExpirationDateModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'cachemanagers/CacheManager',
        'cachemanagers/activelimitsmanager',
        'viewmodels/limits/ExpirationDateSelectorModel',
        'viewmodels/dialogs/DialogViewModel'
    ],
    function (require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            CacheManager = require('cachemanagers/CacheManager'),
            ActiveLimitsManager = require('cachemanagers/activelimitsmanager'),
            ExpirationDateSelectorModel = require('viewmodels/limits/ExpirationDateSelectorModel'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel');

        function ExpirationDateModel() {
            var observableObject = {},
                disposables = [],
                instrumentID;

            //-------------------------------------------------------
            var init = function () {
                observableObject.expirationDateSelector = new ExpirationDateSelectorModel();
                observableObject.expirationDateSelector.Init();
                setDefaultObservables();
                setValidators();
                setComputables();
                setSubscribers();
            };

            //-------------------------------------------------------
            var setDefaultObservables = function () {
                observableObject.expirationDate = ko.observable("").extend({ dirty: false });
                observableObject.expirationTime = ko.observable("").extend({ dirty: false });
                observableObject.selectedExpirationDateTime = ko.observable("").extend({ dirty: false });
                observableObject.isDateTimeApplied = ko.observable(false);
                observableObject.maxExpirationDate = ko.observable("");
                observableObject.minExpirationDate = ko.observable("");
                observableObject.hoursList = ko.observableArray([]);
                observableObject.selectedHoursValue = ko.observable("");
            };

            //-------------------------------------------------------
            var setValidators = function () {
                observableObject.expirationDate.extend({
                    validation: {
                        validator: isValidExpirationDateByDay
                    }
                });

                observableObject.selectedHoursValue.extend({
                    validation: {
                        validator: isValidExpirationDateByDayAndHours
                    }
                });
            };

            //-------------------------------------------------------
            var setComputables = function () {
                observableObject.expirationDateTime = ko.computed(function () {
                    return String.format("{0} {1}", general.pad(this.expirationDate(), 2), general.pad(this.expirationTime(), 2));
                }, observableObject);
                disposables.push(observableObject.expirationDateTime);

                observableObject.isDirty = ko.computed(function () {
                    return observableObject.expirationDate.isDirty()
                        || observableObject.expirationTime.isDirty();
                });
                disposables.push(observableObject.isDirty);

                observableObject.isExpirationDateDirty = ko.computed(function () {
                    var selectedDateTime = observableObject.selectedExpirationDateTime();
                    var originalDateTime = observableObject.selectedExpirationDateTime.originalValue();
                    if (!observableObject.isDateTimeApplied()) {
                        return false;
                    }

                    return selectedDateTime !== originalDateTime;
                });
                disposables.push(observableObject.isExpirationDateDirty);
            };

            //-------------------------------------------------------
            var setSubscribers = function () {
                disposables.push(
                    observableObject.expirationDate.subscribe(function (value) {
                        if (!general.isEmptyType(value)) {
                            setExpirationTime();
                        }
                    })
                );

                disposables.push(
                    observableObject.selectedHoursValue.subscribe(function (value) {
                        observableObject.expirationTime(value);
                    })
                );
            };

            //-------------------------------------------------------
            var setOrder = function (_orderID) {
                var selectedLimit = ActiveLimitsManager.limits.GetItem(_orderID);

                if (selectedLimit) {
                    updateMaxAndMinDate(selectedLimit.instrumentID);

                    var today = computeTodayExpirationDate();
                    var defaultExpirationDate = {
                        date: general.SplitDateTime(today.ExtractDate()).date,
                        time: today.ExtractTime()
                    };

                    setExpirationDate(selectedLimit, defaultExpirationDate);

                    // Mark as clean
                    observableObject.expirationDate.markClean();
                    observableObject.expirationTime.markClean();
                }
            };

            function setExpirationDate(selectedLimit, defaultExpirationDate) {
                var expirationDateTimeString;

                if (general.isEmptyValue(selectedLimit.expirationDate)) {
                    observableObject.expirationDate(defaultExpirationDate.date);
                    observableObject.selectedHoursValue(defaultExpirationDate.time);

                    expirationDateTimeString = String.format("{0} {1}", general.pad(observableObject.expirationDate(), 2), general.pad(observableObject.expirationTime(), 2));
                    observableObject.selectedExpirationDateTime(expirationDateTimeString);

                    observableObject.expirationDateSelector.ResetObservables();
                } else {
                    var expirationDateParts = general.SplitDateTime(selectedLimit.expirationDate);
                    observableObject.expirationDate(expirationDateParts.date);
                    observableObject.selectedHoursValue(String.format("{0}:{1}", general.pad(expirationDateParts.hour, 2), general.pad(expirationDateParts.min, 2)));

                    expirationDateTimeString = String.format("{0} {1}", general.pad(observableObject.expirationDate(), 2), general.pad(observableObject.expirationTime(), 2));
                    observableObject.selectedExpirationDateTime(expirationDateTimeString);
                    observableObject.selectedExpirationDateTime.markClean();

                    observableObject.expirationDateSelector.UpdateSelectedDateUI(observableObject.expirationDateTime());
                }
            }

            //-------------------------------------------------------
            var updateSelectedDateWithToday = function (instrumentId) {
                observableObject.expirationDateSelector.ResetObservables();
                updateMaxAndMinDate(instrumentId);

                var today = computeTodayExpirationDate();

                observableObject.expirationDate(general.SplitDateTime(today.ExtractDate()).date);
                observableObject.selectedHoursValue(today.ExtractTime());
            };

            var updateMaxAndMinDate = function (instrumentId) {
                var maxExpirationDateTimeObj = getMaxExpirationDate(instrumentId);
                setMaxExpirationDate(maxExpirationDateTimeObj);
                setMinExpirationDate();
            };

            var computeTodayExpirationDate = function () {
                var defaultExpirationDate = new Date(CacheManager.ServerTime().getTime());
                defaultExpirationDate.setHours(23);
                defaultExpirationDate.setMinutes(59);
                defaultExpirationDate.skipWeekendDays();

                return defaultExpirationDate;
            };

            function setMaxExpirationDate(dateTimeObj) {
                var maxExpirationDateTime = String.format("{0} {1}", dateTimeObj.date, dateTimeObj.time);
                observableObject.maxExpirationDate(general.str2Date(maxExpirationDateTime, "d/m/Y H:M"));
            }

            function setMinExpirationDate() {
                var minExpirationDateTime = String.format("{0} {1}", CacheManager.ServerTime().ExtractDate(), CacheManager.ServerTime().ExtractTime());
                observableObject.minExpirationDate(general.str2Date(minExpirationDateTime, "d/m/Y H:M"));
            }

            //-------------------------------------------------------
            var getMaxExpirationDate = function (_instrumentID) {
                instrumentID = _instrumentID;
                var instrument = $instrumentsManager.GetInstrument(instrumentID);

                var serverTime = new Date(CacheManager.ServerTime().getTime());
                var defaultExpirationDate = serverTime.AddYear(1);
                defaultExpirationDate.setHours(23);
                defaultExpirationDate.setMinutes(59);

                var resultDate;

                if (instrument.isFuture) {
                    resultDate = general.str2Date(instrument.expirationDate, "d/m/Y H:M");
                } else if (instrument.expirationDate) {
                    resultDate = general.str2Date(instrument.expirationDate, "d/m/Y H:M") < defaultExpirationDate ? general.str2Date(instrument.expirationDate, "d/m/Y H:M") : defaultExpirationDate;
                } else {
                    resultDate = defaultExpirationDate;
                }

                if (resultDate)
                    resultDate.skipWeekendDays();
                else
                    resultDate = defaultExpirationDate;

                return {
                    date: general.SplitDateTime(resultDate.ExtractDate()).date,
                    time: resultDate.ExtractTime()
                };
            };

            //-------------------------------------------------------
            var setExpirationTime = function () {
                var maxHour = 23,
                    maxMinute = 59,
                    minHour = 0;

                // compute minHour based on current time
                if (general.SplitDateTime(CacheManager.ServerTime().ExtractDate()).date == observableObject.expirationDate()) {
                    minHour = (CacheManager.ServerTime()).getHours() + 1;
                }

                var instrument = $instrumentsManager.GetInstrument(instrumentID);
                if (instrument && instrument.expirationDate) {
                    var instrumentDate = general.SplitDateTime(instrument.expirationDate);
                    if (instrumentDate.date == observableObject.expirationDate()) {
                        maxHour = parseInt(instrumentDate.hour, 10);
                        maxMinute = parseInt(instrumentDate.min, 10);
                    }
                }

                var expirationTime = observableObject.selectedHoursValue(),
                    expirationTimeValue = 0;

                if (!general.isEmptyType(expirationTime)) {
                    var timeParts = expirationTime.split(":");
                    expirationTimeValue = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
                }

                // Change the expiration time only if it is not between the min and max
                var minTimeValue = minHour * 60,
                    maxTimeValue = maxHour * 60 + maxMinute;

                if (expirationTimeValue < minTimeValue) {
                    observableObject.selectedHoursValue(String.format("{0}:00", general.pad(minHour, 2)));
                } else if (expirationTimeValue > maxTimeValue) {
                    observableObject.selectedHoursValue(String.format("{0}:{1}", general.pad(maxHour, 2), general.pad(maxMinute, 2)));
                }

                var hours = [];
                general.fillHoursList(hours, maxHour, maxMinute, minHour);
                observableObject.hoursList(hours);
            };

            //-------------------------------------------------------
            var isValidExpirationDateByDay = function (val) {
                if (observableObject.expirationDateSelector.IsGoodTillCancelChecked()) {
                    observableObject.isDateTimeApplied(true);
                    observableObject.selectedExpirationDateTime("");
                    return true;
                }

                observableObject.isDateTimeApplied(false);
                var expirationDateTime = getExpirationDateTime(val, observableObject.selectedHoursValue());

                // Added new validation, expiration date cannot exceed max expiration date
                return expirationDateTime > CacheManager.ServerTime() && expirationDateTime <= observableObject.maxExpirationDate();
            };

            //-------------------------------------------------------
            var isValidExpirationDateByDayAndHours = function (val) {
                if (observableObject.expirationDateSelector.IsGoodTillCancelChecked()) {
                    observableObject.isDateTimeApplied(true);
                    observableObject.selectedExpirationDateTime("");
                    return true;
                }

                observableObject.isDateTimeApplied(false);
                var expirationDateTime = getExpirationDateTime(observableObject.expirationDate(), val);

                // Added new validation, expiration date cannot exceed max expiration date
                return expirationDateTime > CacheManager.ServerTime() && expirationDateTime <= observableObject.maxExpirationDate();
            };

            //-------------------------------------------------------
            var getExpirationDateTime = function (expirationDate, selectedHoursValue) {
                var expirationDateTimeString = expirationDate + " " + selectedHoursValue;
                var expirationDateTime = general.str2Date(expirationDateTimeString, "d/m/Y H:M");
                observableObject.selectedExpirationDateTime(expirationDateTimeString);

                return expirationDateTime;
            };

            //-------------------------------------------------------
            var isValid = function () {
                return observableObject.selectedHoursValue.isValid() || observableObject.expirationDateSelector.IsGoodTillCancelChecked();
            };

            //-------------------------------------------------------
            var onExpirationDateTimeSet = function () {
                if (isValid()) {
                    observableObject.expirationDateSelector.UpdateSelectedDateUI(observableObject.expirationDateTime());
                    observableObject.isDateTimeApplied(true);
                    closeDialog();
                }
            };

            //-------------------------------------------------------
            var closeDialog = function () {
                if (general.isDefinedType(DialogViewModel)) {
                    DialogViewModel.close();
                }
            };

            //-------------------------------------------------------

            var dispose = function () {
                if (disposables.length > 0) {
                    for (var i = 0; i < disposables.length; i++) {
                        disposables[i].dispose();
                    }
                }

                disposables.length = 0;
            };

            //-------------------------------------------------------
            return {
                Data: observableObject,
                SetOrder: setOrder,
                UpdateSelectedWithToday: updateSelectedDateWithToday,
                IsValid: isValid,
                Init: init,
                OnExpirationDateTimeSet: onExpirationDateTimeSet,
                dispose: dispose
            };
        }

        return ExpirationDateModel;
    }
);