/* globals eDateFilter */
define(
    "FxNet/LogicLayer/EconomicCalendar/EconomicCalendarHandler",
    [
        'enums/enums'
    ],
    function EconomicCalendarHandlerDef() {
        function dateInterval(type) {
            var self = this,
                date = self.GetToday(),
                fromDate,
                toDate;

            switch (type) {
                case eDateFilter.Yesterday:
                    fromDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1));
                    toDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1, 23, 59, 59));
                    break;

                case eDateFilter.Today:
                    fromDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
                    toDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59));
                    break;

                case eDateFilter.Tomorrow:
                    fromDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
                    toDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 23, 59, 59));
                    break;

                case eDateFilter.ThisWeek:
                    fromDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay() + 1));
                    toDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay() + 7, 23, 59, 59));
                    break;

                case eDateFilter.NextWeek:
                    fromDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay() + 8));
                    toDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay() + 14, 23, 59, 59));
                    break;

                default:
                    return;
            }

            return {
                FromDate: fromDate,
                ToDate: toDate
            };
        }

        function getToday() {
            return new Date();
        }

        return {
            DateInterval: dateInterval,
            GetToday: getToday
        };
    }
);
