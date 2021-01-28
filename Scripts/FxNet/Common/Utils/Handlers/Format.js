/* global General */
var Format = {
    //--------------------------------------------------------------------
    // If ‘digit’ param exists, return the number with 'digit' decimal digits, else floor it
    //--------------------------------------------------------------------
    toAmount: function (num, digit) {
        if (!General.isNumber(num)) {
            return "NA";
        }

        num = Math.abs(Number(num));

        if (digit) {
            return num.toFixed(digit);
        }
        else {
            return Math.floor(num);
        }
    },

    //--------------------------------------------------------------------
    // Return a whole number and round it if needed 
    //--------------------------------------------------------------------
    toFixedAmount: function (num) {
        var amount = General.roundedNumberFromAmount(num);

        if (!General.isNumber(amount)) {
            return "NA";
        }

        return General.formatNumberWithThousandsSeparator(amount);
    },

    //--------------------------------------------------------------------
    // Return number with Thousands Separator 
    //--------------------------------------------------------------------
    toNumberWithThousandsSeparator: function (num, decimals, displayToken) {
        var amount = General.toNumeric(num);

        displayToken = !General.isDefinedType(displayToken) ? "NA" : displayToken;

        if (!General.isNumber(amount)) {
            return displayToken;
        }

        if (decimals >= 0) {
            amount = amount.toFixed(decimals);
        }

        return General.formatNumberWithThousandsSeparator(amount);
    },

    //--------------------------------------------------------------------
    // Return sign for a symbol id
    //--------------------------------------------------------------------
    toSign: function (symbolId) {
        var formatCurrency = {
                "signNumber symbol": function (arr, symbol) { arr.push(' ' + symbol); return arr.join(''); },
                "sign number symbol": function (arr, symbol) { arr.splice(1, 0, ' '); arr.push(' ' + symbol); return arr.join(''); },
                "symbol signNumber": function (arr, symbol) { arr.splice(0, 0, symbol + ' '); return arr.join(''); },
                "signSymbol number": function (arr, symbol) { arr.splice(1, 0, symbol + ' '); return arr.join(''); },
                "symbolSignNumber": function (arr, symbol) { arr.splice(0, 0, symbol); return arr.join(''); },
            },
            otherSymbol = $symbolsManager.GetSymbol(symbolId),
            defaultSignObj = { sign: otherSymbol ? otherSymbol.name : "", isWithSpace: true, format: formatCurrency["symbol signNumber"] },
            currencySignsMap = {
                '4': { currency: 'CHF', sign: '&#70;&#114;&#46;', isWithSpace: true, format: formatCurrency["symbol signNumber"] },
                '9': { currency: 'CZK', sign: '&#75;&#269;', isWithSpace: true, format: formatCurrency["sign number symbol"] },
                '14': { currency: 'EUR', sign: '&#8364;', isWithSpace: false, format: formatCurrency["symbol signNumber"] },
                '16': { currency: 'GBP', sign: '&#163;', isWithSpace: false, format: formatCurrency["signSymbol number"] },
                '18': { currency: 'HKD', sign: '&#36;', isWithSpace: false, format: formatCurrency["signSymbol number"] },
                '19': { currency: 'HUF', sign: '&#70;&#116;', isWithSpace: false, format: formatCurrency["sign number symbol"] },
                '20': { currency: 'ILS', sign: '&#8362;', isWithSpace: false, format: formatCurrency["symbol signNumber"] },
                '23': { currency: 'JPY', sign: '&#165;', isWithSpace: false, format: formatCurrency["signSymbol number"] },
                '24': { currency: 'MXN', sign: '&#36;', isWithSpace: false, format: formatCurrency["signSymbol number"] },
                '33': { currency: 'PLN', sign: '&#122;&#322;', isWithSpace: true, format: formatCurrency["sign number symbol"] },
                '34': { currency: 'LEI', sign: '&#108;&#101;&#105;', isWithSpace: true, format: formatCurrency["sign number symbol"] },
                '40': { currency: 'SEK', sign: '&#107;&#114;', isWithSpace: true, format: formatCurrency["sign number symbol"] },
                '46': { currency: 'TRY', sign: '&#8378;', isWithSpace: true, format: formatCurrency["sign number symbol"] },
                '47': { currency: 'USD', sign: '&#36;', isWithSpace: false, format: formatCurrency["symbol signNumber"] },
                '69': { currency: 'KRW', sign: '&#8361;', isWithSpace: false, format: formatCurrency["symbol signNumber"] },
                '77': { currency: 'RUB', sign: '&#8381;', isWithSpace: false, format: formatCurrency["signNumber symbol"] },
                '78': { currency: 'SAR', sign: '&#65020;', isWithSpace: false, format: formatCurrency["signNumber symbol"] },
            };

        if (symbolId in currencySignsMap) {
            defaultSignObj = currencySignsMap[symbolId];
        }

        return defaultSignObj;
    },

    //--------------------------------------------------------------------
    // Returns an formated number with the currency Sign
    //--------------------------------------------------------------------
    toNumberWithCurrency: function (value, formatOptions) {
        formatOptions = formatOptions || {};
        var maximumFractionDigits = 2,
            minimumFractionDigits = 0;

        if (!(General.isNumber(General.toNumeric(value)) && General.isDefinedType(formatOptions.currencyId))) {
            return '';
        }

        if (General.isNumberType(formatOptions.decimals)) {
            maximumFractionDigits = minimumFractionDigits = formatOptions.decimals;
        }

        var options = {
                style: 'decimal',
                useGrouping: General.isBooleanType(formatOptions.useGrouping) ? formatOptions.useGrouping : true,
                maximumFractionDigits: General.isNumberType(formatOptions.maximumFractionDigits) ? formatOptions.maximumFractionDigits : maximumFractionDigits,
                minimumFractionDigits: General.isNumberType(formatOptions.minimumFractionDigits) ? formatOptions.minimumFractionDigits : minimumFractionDigits
            },
            strNum = General.toNumeric(value).toString();

        if (strNum.indexOf('.') < 0) {
            strNum += '.00000000';
        }

        var retNumWithCurrecy = Number(strNum.substring(0, strNum.indexOf('.') + options.maximumFractionDigits + 1)).toLocaleString("en-GB", options);

        return Format.addCurrencyToNumber(retNumWithCurrecy, formatOptions.currencyId, value);
    },

    //--------------------------------------------------------------------
    // Adds the currency to the specified number
    //--------------------------------------------------------------------
    addCurrencyToNumber: function (formatedNumber, currencyId, originalNumberValue) {
        var symbol = Format.toSign(currencyId);

        var arr = formatedNumber.split('-');

        var sign = '';
        if (General.isNumber(originalNumberValue)) {
            sign = (0 <= Number(originalNumberValue)) ? '' : '-';
        } else {
            sign = (0 <= formatedNumber.indexOf('-')) ? '-' : '';
        }
        arr.splice(0, 0, sign);
        formatedNumber = symbol.format(arr, symbol.sign);

        return formatedNumber.trim().replace(' ', '&nbsp;');
    },

    //--------------------------------------------------------------------
    // Returns an ammount formatted with the specified function (Format.toAmount for example)
    // followed by the specified currency (if any).
    //--------------------------------------------------------------------
    toAmountWithCurrency: function (formatter, value, currency, isCurrencyBeforeValue) {
        if (!formatter) {
            formatter = Format.toAmount;
        }

        var formattedAmount = formatter(value);

        if (currency && formattedAmount !== "NA") {
            formattedAmount = isCurrencyBeforeValue
                ? currency + ' ' + formattedAmount
                : formattedAmount + ' ' + currency;
        }

        return formattedAmount;
    },

    //--------------------------------------------------------------------
    // Returns a number as rate, add zero's at the end if needed according to precision.
    // If it gets instrumentId, it checks the decimal length of the specific rate, 
    // and according to that it calculates the total length of the rate,
    // else, rate precision default is 7.
    //--------------------------------------------------------------------
    toRate: function (rateValue, needRound, instrumentId, decimals) {
        if (!General.isNumber(rateValue)) {
            return "NA";
        }

        var ratePrecision = 7; // Default rate length
        var rateStr = rateValue.toString();
        var isNegative = rateStr[0] === '-';
        var ratePos = isNegative ? rateStr.substring(1, rateStr.length) : rateStr;

        if (!General.isDefinedType(decimals)) {
            var instrument = $instrumentsManager.GetInstrument(instrumentId);
            if (instrument) {
                ratePrecision = General.lenBeforeDelimiter(ratePos.toString()) + instrument.DecimalDigit + 1;
            }
        } else {
            ratePrecision = General.lenBeforeDelimiter(ratePos.toString()) + decimals + 1;
        }

        var rate = needRound ? General.RateRound(ratePos, ratePrecision).toString() : ratePos.toString();
        rate = General.trailingZeros(rate, ratePrecision);

        return isNegative ? '-' + rate : rate;
    },

    roundToPip: function (value, pipDigit, precision, dir) {
        pipDigit = pipDigit || 0;
        precision = precision || pipDigit > 0 ? pipDigit : 0;

        var floatValue = parseFloat(value),
            multiplier = Math.pow(10, pipDigit),
            coefficient = (dir == ">" ? 0.59 : -0.59),
            pipsValue,
            roundedToPip,
            formattedToDecimals;

        if (isNaN(floatValue)) {
            return false;
        }

        pipsValue = floatValue * multiplier;

        if (dir == ">" || dir == "<") {
            roundedToPip = Math.round(pipsValue + coefficient) / multiplier;
        } else {
            roundedToPip = Math.round(pipsValue) / multiplier;
        }

        formattedToDecimals = parseFloat(roundedToPip).toFixed(precision);

        return formattedToDecimals;
    },

    //--------------------------------------------------------------------
    // Returns the average rate between bid and ask parameters given
    //--------------------------------------------------------------------
    toMidRate: function (bid, ask) {
        if (!General.isNumber(bid) || !General.isNumber(ask)) {
            return "NA";
        }

        var midRate = (General.toNumeric(bid) + General.toNumeric(ask)) * 10 * 0.05; // Middle rate value calculation
        var midRtPrecision = General.lenBeforeDelimiter(midRate) + // Middle rate length calculation
            General.lenAfterDelimeter(bid) + parseInt(General.lenBeforeDelimiter(bid) < 0 ? 0 : 1);
        var midRtRounded = General.RateRound(midRate, midRtPrecision); // Round rate

        return General.trailingZeros(midRtRounded, midRtPrecision);
    },

    //--------------------------------------------------------------------
    // Returns time '01:00:00' from date '13/12/2015 01:00:00'
    //--------------------------------------------------------------------
    toTime: function (date) {
        if (General.isNullOrUndefined(date)) {
            return "";
        }

        var timeVector = date.split(" ");
        var time = timeVector[1];

        if (!General.isDefinedType(time)) {
            time = '00:00:00';
        }

        return time;
    },

    //--------------------------------------------------------------------
    // Shorten the year to 2 digits. Example: for 'August 2016' will 
    // return '(August 16) '
    //--------------------------------------------------------------------
    toShortYear: function (monthAndYear) {
        if (General.isNullOrUndefined(monthAndYear) || monthAndYear.trim().length === 0) {
            return "";
        }

        var monthAndYearVector = monthAndYear.split(/\s+/);
        var year = monthAndYearVector[1];
        var month = monthAndYearVector[0];

        if (General.isNullOrUndefined(year) || !General.isDefinedType(month)) {
            return "(" + monthAndYear + ") ";
        }

        return "(" + month + " " + year.substring(2) + ") ";
    },

    //--------------------------------------------------------------------
    // Returns the rounded number without any decimals
    //--------------------------------------------------------------------
    toRoundNumber: function (num) {
        if (!General.isNumber(num)) {
            return "NA";
        }

        return Math.round(num);
    },

    //--------------------------------------------------------------------
    // Returns the number with 2 decimal digits and % sign
    //--------------------------------------------------------------------
    toPercent: function (num, hideNA) {
        if (!General.isNumber(num)) {
            return (hideNA) ? num : "NA";
        }

        num = Math.round(num * 100) / 100;

        var sNum = String(num),
            t = sNum.split('.');

        if (t.length == 1) {
            t[0] = t[0] == '-0' ? '0' : t[0];
            return t[0] + '.00%';
        }
        if (t[1].length == 1) {
            return t[0] + '.' + t[1] + '0%';
        }

        return t[0] + '.' + t[1].substring(0, 2) + '%';
    },

    //--------------------------------------------------------------------
    // Returns the number with precision decimal digits and % sign
    //--------------------------------------------------------------------
    toPercentWithPrecision: function (num, precision) {
        if (!General.isNumber(num)) {
            return "NA";
        }

        precision = precision || 2;

        num = num.toFixed(precision);

        return String(num) + "%";
    },

    //--------------------------------------------------------------------
    // Returns the number the +/- sign and with 2 decimal digits and % sign
    //--------------------------------------------------------------------
    toSignedPercent: function (num, resultWhenValueIsInvalid) {
        if (!General.isNumber(num)) {
            return General.isNullOrUndefined(resultWhenValueIsInvalid) ? 'NA' : resultWhenValueIsInvalid;
        }

        var formattedNum = Format.toPercent(num);

        return ((formattedNum === "0.00%" || formattedNum.indexOf('-') >= 0) ? '' : '+') + Format.toPercent(num);
    },

    //--------------------------------------------------------------------
    // Returns the CC number in CC number format, as described(international or local)
    //--------------------------------------------------------------------
    toCCNumber: function (first6, last4) {
        //' International cards format:   <first 6 digits>-XXXX-<last 4 digits>
        //' Local cards format:           XXXX-<last 4 digits>

        if (last4.length !== 4) {
            return "NA";
        }
        if ((first6.length > 0) && (first6.length !== 6)) {
            return "NA";
        }

        return first6 + (first6.length > 0 ? '-' : '') + 'XXXX-' + last4;
    },

    //--------------------------------------------------------------------
    //  Add dot in case a value is in the right range
    //--------------------------------------------------------------------
    addDotInRange: function (value, rangeArray) {
        var newVal = value,
            inRange;

        for (var i = 0; i < rangeArray.length; i++) {
            var range = rangeArray[i];
            var nearIsSmall = range.near() < range.far();
            var low = nearIsSmall ? range.near() : range.far();
            var high = nearIsSmall ? range.far() : range.near();
            var lowFloor = Math.floor(low);
            var highFloor = Math.floor(high);
            inRange = newVal >= lowFloor && newVal <= highFloor;
            if (inRange) {
                return (newVal + '.');

            }
        }
        return newVal;
    },

    //--------------------------------------------------------------------
    // Return the value given with sign (+/-)
    //--------------------------------------------------------------------
    toSignedNumericWithDecimals: function (amount, formatOptions) {
        formatOptions = formatOptions || {};
        formatOptions.decimals = General.isDefinedType(formatOptions.decimals) ? formatOptions.decimals : 2;
        formatOptions.showThousandSeparator = !!formatOptions.showThousandSeparator;

        var numericValue = General.toNumeric(amount);

        if (!General.isNumber(numericValue)) {
            return 'NA';
        }

        var stringValue = numericValue.toFixed(formatOptions.decimals),
            signedValue = stringValue.indexOf("-") !== -1 ? stringValue : "+" + stringValue;

        if (formatOptions.showThousandSeparator) {
            return General.formatNumberWithThousandsSeparator(signedValue);
        }

        return signedValue;
    },

    //--------------------------------------------------------------------
    // Return the number divided by 10,000
    //--------------------------------------------------------------------
    toKAmount: function (amount) {
        if (!General.isNumber(amount)) {
            return "NA";
        }
        return (Math.round((amount / 1000) * 10000) / 10000).toString();
    },

    //--------------------------------------------------------------------
    // Returns milliseconds converted to second   
    //--------------------------------------------------------------------
    secToMil: function (sec) {
        if (!General.isNumber(sec)) {
            return "NA";
        }
        return (sec * 1000).toString();
    },

    //--------------------------------------------------------------------
    // Returns the rate as it should be displayed  as 10th of pips,
    // both for button display(first, middle, last) and for label display(first, last).
    //--------------------------------------------------------------------
    tenthOfPipSplitRate: function (sRate, instrumentId, specialFontStart, specialFontLength) {
        var retVal = {
            label: { first: '0', last: '0' },
            button: { first: '0', middle: '0', last: '0' }
        };

        if (!General.isDefinedType(specialFontStart) || !General.isDefinedType(specialFontLength)) {
            var instrument = $instrumentsManager.GetInstrument(instrumentId);

            if (General.isNullOrUndefined(instrument)) {
                return retVal;
            }

            specialFontStart = instrument.SpecialFontStart;
            specialFontLength = instrument.SpecialFontLength;
        }

        var sNum = sRate.toString(),
            SpecialFontStartPositionfromLeft = sNum.length - specialFontStart,
            first = sNum.substring(0, SpecialFontStartPositionfromLeft),
            second = sNum.substring(SpecialFontStartPositionfromLeft, SpecialFontStartPositionfromLeft + specialFontLength),
            third = sNum.substring(SpecialFontStartPositionfromLeft + specialFontLength);


        retVal.label.first = first + second;
        retVal.label.last = third;

        retVal.button.first = first;
        retVal.button.middle = second;
        retVal.button.last = third;

        return retVal;
    },

    //--------------------------------------------------------------------
    //   Returns the given value rounded with thousands separator. 
    //   if smaller then 10, returns with 1 decimal, if its zero returns “”.
    //--------------------------------------------------------------------
    formatDealAmount: function (value) {
        var valueAsNumber = General.toNumeric(value);

        if (!General.isNumber(valueAsNumber)) {
            return "NA";
        }

        if (valueAsNumber == 0) {
            return "";
        }

        if (valueAsNumber < 10) {
            return valueAsNumber.toFixed(1);
        }

        return General.formatNumberWithThousandsSeparator(Math.round(valueAsNumber));
    },

    toDateTimeUTC: function (eventTime) {
        var eventDate = new Date(eventTime);
        return eventDate.ExtractDateShortYearUTC() + ' ' + eventDate.ExtractTimeUTC();
    },

    toDateTime: function (eventTime) {
        if (!eventTime) {
            return "";
        }

        var eventDate = new Date(eventTime);
        return eventDate.ExtractDateShortYear() + ' ' + eventDate.ExtractTime();
    },

    toTimehhmm: function (eventTime) {
        var eventDate = new Date(eventTime);
        return eventDate.ExtractTimeUTC();
    },

    toLocaleDate: function (eventTime, lcid) {
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var eventDate = new Date(eventTime.split("T")[0]);
        return eventDate.toLocaleDateString(lcid, options);
    },

    rateWithPipTemplate: function (rate, instrumentId, smallFontClass) {
        smallFontClass = smallFontClass || 'tenths';
        if (General.isNullOrUndefined(rate) || General.isNullOrUndefined(instrumentId)) {
            return 'N/A';
        }
        return '<span>' + Format.tenthOfPipSplitRate(rate, instrumentId).label.first
            + '</span>'
            + '<span class="' + smallFontClass + '">'
            + Format.tenthOfPipSplitRate(rate, instrumentId).label.last + '</span>';
    },

    toFullDateTimeUTC: function (time) {
        var date = new Date(time);
        return date.ExtractUTCDateLongYear() + ' ' + date.ExtractFullTimeUTC();
    },

    numberAddThousandSeparator: function (num, decimals, displayToken) {
        var amount = General.toNumeric(num);

        displayToken = !General.isDefinedType(displayToken) ? "NA" : displayToken;
        decimals = General.isNumber(General.toNumeric(decimals)) ? General.toNumeric(decimals) : 0;

        if (!General.isNumber(amount)) {
            return displayToken;
        }

        amount = decimals > 0 ? amount.toFixed(decimals) : Math.floor(amount);

        return General.formatNumberWithThousandsSeparator(amount);
    }
};