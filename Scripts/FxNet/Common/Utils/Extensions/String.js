String.empty = '';

//---------------------------------------------------

String.format = function() {
    var i,
        exp1,
        exp2;

    if (typeof (arguments[1]) == 'object') {
        //-- String.Format("{0} x {1}", [12,13])
        for (i = 0; i < arguments[1].length; i++) {
            exp1 = new RegExp('\\{' + (i) + '\\}', 'gm');
            arguments[0] = arguments[0].replace(exp1, arguments[1][i]);
        }
    } else {
        //-- String.Format("{0} x {1}", 12, 13) 
        for (i = 1; i < arguments.length; i++) {
            exp2 = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            arguments[0] = arguments[0].replace(exp2, arguments[i]);
        }
    }

    return arguments[0];
};

String.prototype.round = function() {
    var str = this;
    if (str && str.length > 0) {
        var noComma = str.replace(/,/g, '');
        var rounded = Math.round(noComma);
        if (!isNaN(rounded)) {
            str = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
    return str;
};

String.prototype.sign = function () {
    var noComma = this.replace(/,/g, ''),
        integer = Math.round(noComma);
    
    if (isNaN(integer)) {
        return 0;
    }

    return integer;
};

String.prototype.cleanComma = function () {
    var noComma = this.replace(/,/g, '');

    if (isNaN(noComma)) {
        return 0;
    }

    return noComma;
};


/**
* ReplaceAll by Fagner Brack (MIT Licensed)
* Replaces all occurrences of a substring in a string
*/
String.prototype.replaceAll = function (token, newToken, ignoreCase) {
    var str, i = -1, _token;
    if ((str = this.toString()) && typeof token === "string") {
        _token = ignoreCase === true ? token.toLowerCase() : undefined;
        while ((i = (
            _token !== undefined ?
                str.toLowerCase().indexOf(
                            _token,
                            i >= 0 ? i + newToken.length : 0
                ) : str.indexOf(
                            token,
                            i >= 0 ? i + newToken.length : 0
                )
        )) !== -1) {
            str = str.substring(0, i)
                    .concat(newToken)
                    .concat(str.substring(i + token.length));
        }
    }
    return str;
};

String.prototype.toNumeric = function () {
    var str = this;
    if (General.isNumberType(str))
        return str;

    var newstr = [];

    for (var i = 0; i < str.length; i++) {
        var s = str.substr(i, 1);

        if (s !== ",") {
            newstr.push(s);
        }
    }

    return parseFloat(newstr.join(""));
};

if (!String.prototype.containsNotEmpty) {
    String.prototype.containsNotEmpty = function () {
        if (arguments && arguments[0].length > 0)
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        else
            return false;
    };
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

if (!String.prototype.capitalizeFirstLetter) {
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
}

String.prototype.isRtlText = function () {
    return cArabicChars.test(this);
}