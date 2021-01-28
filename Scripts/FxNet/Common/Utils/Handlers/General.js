var General = (function General() {
    var self = {};

    //-------------------------------------------------------------
    // functionName
    //-------------------------------------------------------------
    self.functionName = function (CallerObject) {
        var fn = CallerObject.toString();
        var fname = fn.substring(fn.indexOf("function") + 9, fn.indexOf("(")) || "anonymous";

        return fname;
    };

    //-------------------------------------------------------------
    // ref
    //-------------------------------------------------------------
    self.ref = function (id) {
        return document.getElementById(id);
    };

    //-------------------------------------------------------------
    // refByName
    //-------------------------------------------------------------
    self.refByName = function (name) {
        return document.getElementsByName(name);
    };

    //-------------------------------------------------------------
    // ArithmeticRound
    //-------------------------------------------------------------
    self.pow10cache = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];

    self.RateRound = function (_rate, _precision) {
        if (!self.isNumber(_rate))
            return "NA";

        var rateStr = _rate.toString();
        var isNegative = rateStr[0] === '-';
        var ratePos = isNegative ? rateStr.substring(1, rateStr.length) : rateStr;
        var precision = _precision || 7;

        if (self.lenAfterDelimeter(ratePos) == 0)
            return isNegative ? 0 - parseInt(ratePos, 10) : parseInt(ratePos, 10);

        var fractionLength = precision - self.lenBeforeDelimiter(ratePos) - 1;
        var base = Math.pow(10, fractionLength);
        var rounded = Math.round(self.toNumeric(ratePos) * base) / base;

        return isNegative ? 0 - rounded : rounded;
    };

    //-------------------------------------------------------------
    // Trailing zeros
    //-------------------------------------------------------------
    self.trailingZeros = function (number, precision) {
        if (!self.isNumber(number)) {
            return "NA";
        }

        if (number.toString().length < precision) {
            var numFormated = number.toString().split('');

            // add point/trailing zeroes
            for (var i = numFormated.length; i < precision; i++) {
                numFormated[i] = numFormated.join('').indexOf('.') < 0 ? '.' : '0';
            }

            // trim right point (.)
            var numFrmStr = numFormated.join('');
            number = numFrmStr.split('.')[1].length == 0 ? numFrmStr.replace('.', '') : numFrmStr;
        }

        return number.toString();
    };

    //-------------------------------------------------------------
    // InRange
    //-------------------------------------------------------------
    self.InRange = function (rate, range) {
        return (rate > range.far() && rate < range.near()) || (rate > range.near() && rate < range.far());
    };

    //-------------------------------------------------------------
    // RateAndPipsAndLastClosePip
    //-------------------------------------------------------------
    self.RateAndPipsAndLastClosePip = function (rate, pips, lastPip) {
        return { rate: rate, pips: pips, lastPip: lastPip };
    };

    //-------------------------------------------------------------
    // Get length of the integer part number. Support negotive numbers.
    //-------------------------------------------------------------
    self.lenBeforeDelimiter = function (number) {
        if (!self.isNumber(number)) {
            return "NA";
        }

        return Math.floor(Math.abs(number)).toString().length;
    };

    //-------------------------------------------------------------
    // Get length of the fractional part number
    //-------------------------------------------------------------
    self.lenAfterDelimeter = function (number) {

        if (!self.isNumber(number)) {
            return "NA";
        }
        var sNum = number.toString(),
            x = sNum.split('.');

        if (x.length == 1) // whole number
            return 0;

        return x[1].length;
    };

    //-------------------------------------------------------------
    // isInt
    //-------------------------------------------------------------
    self.isInt = function (x) {
        var y = parseInt(x, 10);

        if (isNaN(y))
            return false;

        return x == y;
    };

    //-------------------------------------------------------------
    // isEmpty
    //-------------------------------------------------------------
    self.isEmpty = function (x) {

        if (x.length == 0 || x == '')
            return true;

        return false;
    };

    //-------------------------------------------------------------
    // isNumber
    //-------------------------------------------------------------
    self.isNumber = function (x) {
        var y = parseFloat(x);

        if (isNaN(y))
            return false;

        return x == y;
    };

    //-------------------------------------------------------------
    // isPos
    //-------------------------------------------------------------
    self.isPos = function (x) {
        var y = 0;

        if (self.isNumber(x))
            y = parseFloat(x);

        return y > 0;
    };

    //-------------------------------------------------------------
    // toInt
    //-------------------------------------------------------------
    self.toInt = function (str) {
        var y = parseInt(str.replace(/,/g, ""), 10);

        if (isNaN(y))
            return "NA";

        return y;
    };

    //-------------------------------------------------------------
    //toNumeric
    //-------------------------------------------------------------
    self.toNumeric = function (str) {
        if (!self.isDefinedType(str)) {
            return;
        }

        if (self.isNullType(str)) {
            return;
        }

        if (self.isNumberType(str)) {
            return str;
        }

        var newstr = [];
        for (var i = 0; i < str.length; i++) {
            var s = str.substr(i, 1);

            if (s !== ",") {
                newstr.push(s);
            }
        }

        var strParse = parseFloat(newstr.join(""));

        if (isNaN(strParse)) {
            return "NA";
        }

        return strParse;
    };

    //-------------------------------------------------------------
    // toBoolean
    //-------------------------------------------------------------
    self.toBoolean = function (value) {
        if (self.isStringType(value)) {
            if (value.toLowerCase() == "false") {
                return false;
            }
        }

        return Boolean(value);
    };

    //-------------------------------------------------------------
    // getPageScroll ***********************
    //-------------------------------------------------------------
    self.PageYScroll = function () {
        if (self.pageYOffset) {
            return self.pageYOffset;
        }

        if (document.documentElement && document.documentElement.scrollTop) {
            return document.documentElement.scrollTop;
        }

        return document.body.scrollTop;
    };

    //-------------------------------------------------------------
    // WinInfo
    //-------------------------------------------------------------
    self.WindowInfo = function () {
        var win = { height: 0, width: 0, innerHeight: 0, yScroll: 0 };

        win.height = Math.max($(document).height(),
            $(window).height(), /* For opera: */
            document.documentElement.clientHeight);

        win.width = Math.max($(document).width(),
            $(window).width(),  /* For opera: */
            document.documentElement.clientWidth);

        win.innerHeight = window.innerHeight || document.documentElement.offsetHeight;

        win.yScroll = self.PageYScroll();

        return win;
    };

    //-------------------------------------------------------------
    // BlockNonInteger
    //-------------------------------------------------------------
    self.BlockNonInteger = function (e) {
        var key = "", reg = /\d/;

        e = e || window.event;

        if (e.keyCode) {
            key = e.keyCode;
        }
        else if (e.which) {
            key = e.which;
        }

        //--------------------------------------

        if (isNaN(key))
            return true;

        if (key == 8) // check for backspace
            return true;

        //--------------------------------------

        var keychar = String.fromCharCode(key);
        return reg.test(keychar);
    };

    //-------------------------------------------------------------
    // pad
    //-------------------------------------------------------------
    self.pad = function (number, length) {
        var str = String(number);

        while (str.length < length) {
            str = '0' + str;
        }

        return str;
    };

    //-------------------------------------------------------------
    // SplitDateTime  dd/mm/yy hh:mm:ss
    //-------------------------------------------------------------
    self.SplitDateTime = function (sDate) {
        var fullDateStr,
            fullTimeStr,
            ddStr = "01",
            mmStr = "01",
            yyStr = "1900",
            hhStr = "00",
            minStr = "00",
            ssStr = "00",
            msStr = "000",
            dateTimeParts = sDate.split(" "),
            chunk = dateTimeParts.shift();

        if (chunk) {
            if (chunk.indexOf("/") != -1) {
                var dateParts = chunk.split("/");

                ddStr = dateParts[0] ? (dateParts[0].length == 2 ? dateParts[0] : "0" + dateParts[0]) : "01";
                mmStr = dateParts[1] ? (dateParts[1].length == 2 ? dateParts[1] : "0" + dateParts[1]) : "01";
                yyStr = dateParts[2] ? (dateParts[2].length == 4 ? dateParts[2] : "20" + dateParts[2]) : "1900";

                // get next chunk
                dateTimeParts.push(chunk);
                chunk = dateTimeParts.shift();
            }
        }

        //fullDateStr = ddStr + "/" + mmStr + "/" + ((yyStr.length > 2) ? yyStr : "20" + yyStr);
        fullDateStr = ddStr + "/" + mmStr + "/" + yyStr;

        if (chunk) {
            if (chunk.indexOf(":") != -1) {
                var timeParts = chunk.split(":");

                hhStr = timeParts[0] ? (timeParts[0].length == 2 ? timeParts[0] : "0" + timeParts[0]) : "00";
                minStr = timeParts[1] ? (timeParts[1].length == 2 ? timeParts[1] : "0" + timeParts[1]) : "00";
                ssStr = timeParts[2] ? (timeParts[2].length == 2 ? timeParts[2] : "0" + timeParts[2]) : "00";
                msStr = timeParts[3] ? timeParts[3] : "000";

                dateTimeParts.push(chunk);
            }
        }

        fullTimeStr = hhStr + ":" + minStr + ":" + ssStr;

        return {
            day: ddStr,
            month: mmStr,
            year: yyStr,
            date: fullDateStr,
            time: fullTimeStr,
            hour: hhStr,
            min: minStr,
            sec: ssStr,
            ms: msStr
        };
    };

    //-------------------------------------------------------------
    //  fillHoursList - create an array of hours, from minimum to maximum
    //-------------------------------------------------------------
    self.fillHoursList = function (ddlHours, maxHour, maxMin, minHour) {
        if (ddlHours) {
            ddlHours.length = 0;

            minHour = minHour || 0;

            for (var i = minHour; i <= maxHour; i++) {
                var item = ((i < 10) ? "0" + i : i) + ":00";
                ddlHours.push({ "value": item, "text": item });
            }
        }

        if (maxMin != 0) {
            var lastItem = ((maxHour < 10) ? "0" + maxHour : maxHour) + ":" + ((maxMin < 10) ? "0" + maxMin : maxMin);
            ddlHours.push({ "value": lastItem, "text": lastItem });
        }
    };

    //-------------------------------------------------------------
    //  str2Date
    //-------------------------------------------------------------
    self.str2Date = function (date, format) {
        if (!date) {
            return null;
        }

        format = format || 'd/m/Y';

        var parts = date.split(/\W+/);

        var against = format.split(/\W+/), d, m, y, h, min, now = new Date();

        for (var i = 0; i < parts.length; i++) {
            switch (against[i]) {
                case 'd': case 'e':
                    d = parseInt(parts[i], 10);
                    break;

                case 'm':
                    m = parseInt(parts[i], 10) - 1;
                    break;

                case 'Y': case 'y':
                    y = parseInt(parts[i], 10);
                    y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
                    break;

                case 'H': case 'I': case 'k': case 'l':
                    h = parseInt(parts[i], 10);
                    break;

                case 'P': case 'p':
                    if (/pm/i.test(parts[i]) && h < 12) {
                        h += 12;
                    } else if (/am/i.test(parts[i]) && h >= 12) {
                        h -= 12;
                    }
                    break;

                case 'M':
                    min = parseInt(parts[i], 10);
                    break;
            }
        }

        return new Date(
            typeof y === "undefined" ? now.getFullYear() : y,
            typeof m === "undefined" ? now.getMonth() : m,
            typeof d === "undefined" ? now.getDate() : d,
            typeof h === "undefined" ? now.getHours() : h,
            typeof min === "undefined" ? now.getMinutes() : min,
            0
        );
    };

    //-------------------------------------------------------------
    //  addSign < or > according to limit type and deal direction
    //-------------------------------------------------------------
    self.addSign = function (orderDir, limitType) {
        if (orderDir !== eOrderDir.Sell && orderDir !== eOrderDir.Buy && orderDir !== eOrderDir.None) {
            return "NA";
        }

        if (limitType === eLimitType.StopLoss)
            return (orderDir == eOrderDir.Sell) ? ">" : "<";

        return (orderDir === eOrderDir.Sell) ? "<" : ">";
    };

    //-------------------------------------------------------------
    //Compare two values with numeric or alphabetic order
    //-------------------------------------------------------------
    self.CompareValues = function (left, right, asc) {
        if (self.isNumber(left) && self.isNumber(right))
            return left == right ? 0 : (Number(left) < Number(right) ? -1 : 1) * (asc ? 1 : -1);
        else
            return left.toString().localeCompare(right);
    };

    //-------------------------------------------------------------
    //  return string according to limit type SL: or TP:
    //-------------------------------------------------------------
    self.setrDirectionMessageText = function (limitType) {

        if (limitType == eLimitType.StopLoss)
            return Dictionary.GetItem("limtype1_short") + ": ";
        else if (limitType == eLimitType.TakeProfit)
            return Dictionary.GetItem("limtype2_short") + ": ";

        return "";

    };

    //---------------------------------------------------------------
    // divide the number given according to its size, return it with 2 decimal digits
    // (in K case 1 decimal digit) and add B\M\K 
    //---------------------------------------------------------------
    self.formatNumber = function (str, format) {
        var noComma = str.replace(/,/g, '');

        var r = Math.round(noComma * 10) / 10;
        var abs = Math.abs(r);

        if (abs > 999999999)
            r = (r / 1000000000).toFixed(2) + Dictionary.GetItem("roundB");
        else if (abs > 999999)
            r = (r / 1000000).toFixed(2) + Dictionary.GetItem("roundM");
        else if (format == "K" && abs > 9999) {
            if (r % 1000 == 0)
                r = (r / 1000);
            else
                r = (r / 1000).toFixed(1);
            r += Dictionary.GetItem("roundK");
        }

        return self.formatNumberWithThousandsSeparator(r);
    };

    //---------------------------------------------------------------
    // return the number given according to its size, return it with 2 decimal digits and add B\M\K 
    //---------------------------------------------------------------
    self.formatRoundM = function (str) {
        return self.formatNumber(str, "M");
    };

    //---------------------------------------------------------------
    // return the number given according to its size, return it with 2 decimal digits and add B\M\K 
    //---------------------------------------------------------------
    self.formatWithThresholdAndDecimals = function (str, format) {
        var noComma = str.replace(/,/g, '');
        var r = Number(noComma).toFixed(2);
        var abs = Math.abs(r);

        if (abs > 999999999)
            r = (r / 1000000000).toFixed(2) + Dictionary.GetItem("roundB");
        else if (abs > 999999)
            r = (r / 1000000).toFixed(2) + Dictionary.GetItem("roundM");
        else if (format == "K" && abs > 9999) {
            if (r % 1000 == 0)
                r = (r / 1000);
            else
                r = (r / 1000).toFixed(1);
            r += Dictionary.GetItem("roundK");
        }

        return self.formatNumberWithThousandsSeparator(r);
    };

    //---------------------------------------------------------------
    // if the passed number is above the threshold, the old rounding self.
    // is applied. If not, we round to the second digit.
    //---------------------------------------------------------------
    self.formatRoundBasedOnThreshold = function (str, format) {
        if (Math.abs(Number(str)) > cConfig.AmountRoundingThreshold) {
            return self.formatWithThresholdAndDecimals(str, format);
        }

        var noComma = str.replace(/,/g, '');
        var r = Number(noComma).toFixed(2);
        return self.formatNumberWithThousandsSeparator(r);
    };

    //---------------------------------------------------------------
    // if the passed number is above the threshold, the old rounding self.
    // is applied. If not, we round to the second digit.
    //---------------------------------------------------------------
    self.formatRoundMBasedOnThreshold = function (str) {
        return self.formatRoundBasedOnThreshold(str, "M");
    };

    //---------------------------------------------------------------
    // add Thousands Separator 
    //---------------------------------------------------------------
    self.formatNumberWithThousandsSeparator = function (value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    //---------------------------------------------------------------
    // 
    //---------------------------------------------------------------
    self.roundedNumberFromAmount = function (number) {
        var noComma = number.toString().replace(/,/g, '');
        var noDecimals = Math.round(noComma);
        return noDecimals;
    };

    /////////////////////////////////////////////////////
    // for old browsers

    self.isNullType = function (value) {
        return value === null;
    };

    self.isDefinedType = function (value) {
        return typeof value !== 'undefined';
    };

    // TO DO: refactor the name, the method returns object not a true or false value
    self.isDefinedNotNullTypeReturnType = function (value) {
        if (value !== null && typeof value !== 'undefined')
            return value;
        else
            return {};
    };

    self.isArrayType = function (value) {
        // return typeof (value) == 'object' && (value instanceof Array);
        return Object.prototype.toString.apply(value) == '[object Array]';
    };

    self.isStringType = function (value) {
        return typeof (value) === 'string';
    };

    self.isBooleanType = function (value) {
        return typeof (value) === 'boolean';
    };

    self.isNumberType = function (value) {
        return typeof (value) === 'number' && isFinite(value);
    };

    self.isIntType = function (value) {
        return self.isNumberType(value) && parseInt(value, 10) == value;
    };

    self.isNullOrUndefined = function (value) {
        if (!self.isDefinedType(value)) {
            return true;
        }

        if (self.isNullType(value)) {
            return true;
        }

        return false;
    };

    self.isEmptyType = function (value) {
        return self.isEmptyValue(value);
    };

    self.isEmptyValue = function (value) {
        if (!self.isDefinedType(value)) {
            return true;
        }

        if (self.isNullType(value)) {
            return true;
        }

        if (self.isArrayType(value) && value.length < 1) {
            return true;
        }

        if (self.isStringType(value) && value.length < 1) {
            return true;
        }

        return false;
    };

    self.isPrimitiveType = function (value) {
        return self.isStringType(value) || self.isNumberType(value) || self.isBooleanType(value);
    };

    self.isObjectType = function (value) {
        return !!value && Object.prototype.toString.apply(value) === '[object Object]';
    };

    self.isDateType = function (value) {
        return Object.prototype.toString.apply(value) === '[object Date]';
    };

    self.isRegExpType = function (value) {
        return Object.prototype.toString.apply(value) == '[object RegExp]';
    };

    self.isFunctionType = function (value) {
        // return Object.prototype.toString.apply(value) === '[object Function]';
        return typeof value === "function"; // faster (http://jsperf.com/comparing-underscore-js-isfunction-with-typeof-function/2)
    };

    self.isIterableType = function (value) {
        if (self.isArrayType(value) || value.callee) {
            return true;
        }

        if (/NodeList|HTMLCollection/.test(Object.prototype.toString.call(value))) {
            return true;
        }

        return ((typeof value.nextNode != 'undefined' || value.item) && self.isNumberType(value.length)) || false;
    };

    self.eachType = function (array, fn, scope) {
        if (self.isEmptyValue(array)) {
            return;
        }

        if (!self.isIterableType(array) || self.isPrimitiveType(array)) {
            array = [array];
        }

        for (var i = 0, len = array.length; i < len; i++) {
            if (fn.apply(scope || array[i], [array[i], i, array]) === false) {
                return;
            }
        }
    };

    self.iterateType = function (obj, fn, scope) {
        if (self.isEmptyValue(obj)) {
            return;
        }

        if (self.isIterableType(obj)) {
            self.eachType(obj, fn, scope);
            return;
        }
        else if (self.isObjectType(obj)) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (fn.apply(scope || obj, [prop, obj[prop], obj]) === false) {
                        return;
                    }
                }
            }
        }
    };

    ///////////////////////////////////////////////
    // Extend an object
    /**
     * Copies all the properties of config to obj.
     * @param {Object} target The receiver of the properties
     * @param {Object} source The source of the properties
     * @param {Object} defaults A different object that will also be applied for default values
     * @return {Object} returns obj
     */
    self.extendType = function (target, source, defaults) {
        if (defaults) {
            self.extendType(target, defaults);
        }

        if (target && source && typeof source == 'object') {
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) {
                    target[propName] = source[propName];
                }
            }
        }

        return target;
    };

    /**
     * Copies all the properties of config to obj if they don't already exist.
     * @param {Object} target The receiver of the properties
     * @param {Object} source The source of the properties
     * @return {Object} returns obj
     */
    self.extendIfType = function (target, source) {
        if (target) {
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) {
                    if (!self.isDefinedType(target[propName])) {
                        target[propName] = source[propName];
                    }
                }
            }
        }

        return target;
    };

    /**
     * from JQGeneral.js
     */
    self.cloneHardCopy = function (object) {
        return $.extend(true, {}, object);
    };

    ///////////////////////////////////////////////
    //
    // URL functions
    //
    /**
     * Takes an object and converts it to an encoded URL. e.g. Ext.urlEncode({foo: 1, bar: 2}); would return "foo=1&bar=2".  Optionally, property values can be arrays, instead of keys and the resulting string that's returned will contain a name/value pair for each array value.
     * @param {Object} obj
     * @param {String} prefix (optional) A prefix to add to the url encoded string
     * @return {String}
     */
    self.urlEncode = function (obj, prefix) {
        var empty,
            buffer = [],
            encode = encodeURIComponent;

        self.iterateType(obj, function (key, item) {
            empty = self.isEmptyValue(item);
            self.eachType(empty ? key : item, function (value) {
                buffer.push('&', encode(key), '=', (!self.isEmptyValue(value) && (value != key || !empty)) ? (self.isDateType(value) ? encode(value).replace(/"/g, '') : encode(value)) : '');
            });
        });

        if (!prefix) {
            buffer.shift();
            prefix = '';
        }
        else if (prefix.lastIndexOf('?') == -1) {
            buffer.shift();
            prefix += '?';
        }

        return prefix + buffer.join('');
    };

    /**
     * Takes an encoded URL and and converts it to an object. 
     * @param {String} urlString
     * @param {Boolean} overwrite (optional) Items of the same name will overwrite previous values instead of creating an an array (Defaults to false).
     * @return {Object} A literal with members
     */
    self.urlDecode = function (urlString, overwrite) {
        if (urlString.length < 1) {
            return {};
        }

        urlString = urlString.split("#")[0];

        var obj = {},
            pairs = urlString.slice(urlString.indexOf('?') + 1).split('&'),
            decode = decodeURIComponent,
            name,
            value;

        for (var i = 0, len = pairs.length; i < len; i++) {
            var pair = pairs[i].split('=');
            name = pair[0];
            value = decode(pair[1]);
            obj[name] = overwrite || !obj[name] ? value : [].concat(obj[name]).concat(value);
        }

        return obj;
    };

    ///////////////////////////////////////////////
    /**
     * @param {String} str The string to escape
     * @return (String) The escaped string
     */
    self.escapeRe = function (str) {
        return str.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    };

    self.emptyFn = function () { };

    /* eslint no-extend-native: 0 */
    Function.prototype.override = function (func) {
        if (!self.isFunctionType(func)) {
            throw new SyntaxError("self.is required");
        }

        var superFunction = self;

        return function () {
            self.superFunction = superFunction;

            return func.apply(self, arguments);
        };
    };

    Boolean.parse = function (str) {
        if (self.isStringType(str)) {
            str = String(str).toLowerCase();

            var boolmap = {
                "no": false,
                "false": false,
                "yes": true,
                "true": true
            };

            if (str in boolmap) {
                return boolmap[str];
            }
        }

        return !!str;
    };

    self.simulatedContentStringLegth = function (text, font) {
        var f = font || '23px arial',
            o = $('<div>' + text + '</div>')
                .css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f })
                .appendTo($('body')),
            w = o.width();

        o.remove();

        return w;
    };

    /**
     * Determines if two objects or two values are equivalent. Supports value types, regular expressions, arrays and
     * objects.
     *
     * Two objects or values are considered equivalent if at least one of the following is true:
     *
     * * Both objects or values pass `===` comparison.
     * * Both objects or values are of the same type and all of their properties pass `===` comparison.
     * * Both values are NaN. (In JavasScript, NaN == NaN => false. But we consider two NaN as equal)
     * * Both values represent the same regular expression (In JavasScript,
     *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
     *   representation matches).
     *
     * During a property comparison, properties of `function` type are ignored.
     *
     * @param {*} o1 Object or value to compare.
     * @param {*} o2 Object or value to compare.
     * @returns {boolean} True if arguments are equal.
     */
    self.equals = function (o1, o2) {
        if (o1 === o2) {
            return true;
        }

        if (o1 === null || o2 === null) {
            return false;
        }

        /* eslint no-self-compare: 0 */
        if (o1 !== o1 && o2 !== o2) {
            return true; // NaN === NaN
        }

        var t1 = typeof o1,
            t2 = typeof o2,
            length,
            key,
            keySet;

        if (t1 == t2) {
            if (t1 == 'object') {
                if (self.isArrayType(o1)) {
                    if (!self.isArrayType(o2)) {
                        return false;
                    }

                    if ((length = o1.length) == o2.length) {
                        for (key = 0; key < length; key++) {
                            if (!self.equals(o1[key], o2[key])) {
                                return false;
                            }
                        }

                        return true;
                    }
                } else if (self.isDateType(o1)) {
                    return self.isDateType(o2) && o1.getTime() == o2.getTime();
                } else if (self.isRegExpType(o1) && self.isRegExpType(o2)) {
                    return o1.toString() == o2.toString();
                } else if (self.isArrayType(o2)) {
                    return false;
                } else {
                    keySet = {};

                    for (key in o1) {
                        if (self.isFunctionType(o1[key])) {
                            continue;
                        }

                        if (!self.equals(o1[key], o2[key])) {
                            return false;
                        }

                        keySet[key] = true;
                    }

                    for (key in o2) {
                        if (!keySet.hasOwnProperty(key) && typeof o2[key] !== "undefined" && !self.isFunctionType(o2[key])) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        }

        return false;
    };

    self.argsToArray = function (input) {
        var args = [];

        for (var i = 0, length = input.length; i < length; i++) {
            args[i] = input[i];
        }

        return args;
    };

    self.getKeyByValue = function (object, value) {
        for (var key in object) {
            if (object.hasOwnProperty(key) && object[key] === value) {
                return key;
            }
        }

        return null;
    };

    self.padNumber = function (number) {
        return ('0' + number).slice(-2);
    };

    self.extractNumberFromString = function (str) {
        if (self.isEmptyValue(str)) {
            return "NA";
        }

        var arrayOfStrings = str.match(/[+-]?\d+(\.\d+)?/g);

        if (typeof arrayOfStrings === "undefined" || arrayOfStrings === null) {
            return "NA";
        }

        return parseFloat(arrayOfStrings.join(''));
    };

    self.createGuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    self.extractGuid = function (url) {
        var hashPos = url.indexOf('#');
        var guid = "";

        if (hashPos !== -1) {
            var hashStrArray = url.substring(hashPos, url.length).split('&');

            for (var i = 0; i < hashStrArray.length; i++) {
                if (hashStrArray[i].indexOf('guid') !== -1) {
                    guid = hashStrArray[i].split('=')[1];
                    break;
                }
            }
        }

        return guid;
    };

    self.objectFirst = function (container, filterCallback) {
        if (!container || !filterCallback || !self.isFunctionType(filterCallback)) {
            return null;
        }

        if (self.isArrayType(container)) {
            for (var i = 0, j = container.length; i < j; i++)
                if (filterCallback(container[i], i)) {
                    return container[i];
                }

            return null;
        }

        for (var item in container) {
            if (!container.hasOwnProperty(item)) {
                continue;
            }

            if (filterCallback(container[item])) {
                return container[item];
            }
        }

        return null;
    };

    self.objectFilter = function (container, filterCallback) {
        if (!container || !filterCallback || !self.isFunctionType(filterCallback)) {
            return null;
        }

        if (self.isArrayType(container)) {
            return container.filter(filterCallback);
        }

        var result = [];

        for (var item in container) {
            if (!container.hasOwnProperty(item)) {
                continue;
            }

            if (filterCallback(container[item])) {
                result.push(container[item]);
            }
        }

        return result;
    };

    self.objectContainsKey = function (container, key) {
        if (!container) {
            return null;
        }

        for (var item in container) {
            if (!container.hasOwnProperty(item)) {
                continue;
            }

            if (item == key) {
                return true;
            }
        }

        return false;
    };

    self.objectContainsValue = function (container, value) {
        if (!container) {
            return null;
        }

        for (var item in container) {
            if (!container.hasOwnProperty(item)) {
                continue;
            }

            if (container[item] == value) {
                return true;
            }
        }

        return false;
    };

    self.objectMap = function (container, mapCallback) {
        if (!container || !mapCallback || !self.isFunctionType(mapCallback)) {
            return null;
        }

        if (self.isArrayType(container)) {
            return container.map(mapCallback);
        }

        var result = [];

        for (var item in container) {
            if (!container.hasOwnProperty(item)) {
                continue;
            }

            result.push(mapCallback(container[item]));
        }

        return result;
    };

    self.objectToArray = function (container) {
        if (!container) {
            return null;
        }

        if (self.isArrayType(container)) {
            return container;
        }

        var result = [];

        for (var item in container) {
            if (!container.hasOwnProperty(item)) {
                continue;
            }

            result.push(container[item]);
        }

        return result;
    };

    self.disposeArray = function (disposablesArray) {
        if (!self.isArrayType(disposablesArray)) {
            throw new Error('Input parameter is not an array');
        }

        var disposableObject;

        for (var i = 0, j = disposablesArray.length; i < j; i++) {
            disposableObject = disposablesArray[i];

            if (disposableObject && self.isFunctionType(disposableObject.dispose)) {
                disposableObject.dispose();
            }
        }

        disposablesArray.length = 0;
    };

    self.containsHtmlTags = function (inputString) {
        return /<[a-z][\s\S]*>/i.test(inputString);
    };

    self.isPromiseFulfilled = function (promise) {
        return promise.inspect().state === "fulfilled";
    };

    self.addGMTSuffix = function (inputString) {
        return inputString + ' GMT';
    };

    self.clone = function (object) {
        function F() { }
        F.prototype = object;
        return new F();
    };

    self.extendClass = function (parentClass, inheritedClass) {
        /* eslint no-proto: 0 */
        if (typeof parentClass !== "function") {
            throw new Error("Argument exception: parentClass is not a function.");
        }

        if (typeof inheritedClass !== "function") {
            throw new Error("Argument exception: inheritedClass is not a function.");
        }

        var Class = function () {
            var args = self.argsToArray(arguments);
            var obj = {};
            var parent = new (Function.prototype.bind.apply(parentClass, [null].concat(args)))();

            obj.parent = parent;
            obj.__proto__ = parent;

            var child = inheritedClass.apply(obj, args);

            Object.assign(obj, child);

            return obj;
        };

        return Class;
    };

    return self;
}());
