Number.toStr = function(number) {
	var sNum = number.toString(); 

	sNum += '';

	var x = sNum.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';

	var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1 + x2.substr(0,5);
};

Number.fromStr = function (numberStr) {
    var multiplier = 1;

    if (!numberStr) {
        return Number.NaN;
    }

    if (numberStr.indexOf(',') >= 0) {
        numberStr = numberStr.replace(/,/g, '');
    }
    
    if (numberStr.indexOf('M') >= 0) {
        multiplier = 1000000;
        numberStr = numberStr.replace(/M/g, '');
    }
    
    if (numberStr.indexOf('K') >= 0) {
        multiplier = 1000;
        numberStr = numberStr.replace(/K/g, '');
    }

    return Number(numberStr) * multiplier;
}

Number.prototype.sign = function () {
    return Math.round(this);
};

if (typeof Number.MIN_SAFE_INTEGER !== 'number') {
    Number.MIN_SAFE_INTEGER = -9007199254740991; //-(Math.pow(2, 53) - 1)  // 
}

if (typeof Number.MAX_SAFE_INTEGER !== 'number') {
    Number.MAX_SAFE_INTEGER = 9007199254740991; //Math.pow(2, 53) - 1 
}

if (typeof Number.MAX_INT32_SAFE_INTEGER !== 'number') {
    Number.MAX_INT32_SAFE_INTEGER = 2147483647;
}