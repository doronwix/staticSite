define(
    'FxNet/LogicLayer/Withdrawals/LastWithdrawalRequest',
    [
        'handlers/general'
    ],
    function (general) {
        var lastValue = null;

        function storeValue(newValue) {
            lastValue = newValue;

            return lastValue;
        }

        function readValue() {
            return lastValue;
        }

        function hasValue() {
            return !general.isEmptyType(lastValue);
        }

        function clearValue() {
            lastValue = null;
        }

        return {
            storeValue: storeValue,
            readValue: readValue,
            hasValue: hasValue,
            clearValue: clearValue
        };
    }
);
