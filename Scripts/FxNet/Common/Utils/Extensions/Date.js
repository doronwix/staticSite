var eDayOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
};

function timeStamp() {
    return (new Date).getTime();
}

Date.prototype.toDotNetString = function() {
    return "/Date(" + this.getTime() + ")/";
};

Date.prototype.AddSeconds = function(s) {
    var miliSeconds = s * 1000;

    this.setTime(this.getTime() + miliSeconds);

    return this;
};

Date.prototype.AddDays = function (d) {
    this.setDate(this.getDate() + d);

    return this;
};

Date.prototype.AddWeeks = function (w) {
    this.setDate(this.getDate() + w * 7);

    return this;
};

Date.prototype.AddMonths = function (m) {
    this.setMonth(this.getMonth() + m);

    return this;
};

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);

    return this;
};

Date.prototype.Clone = function() {
    return new Date(this.getTime());
};

Date.prototype.ExtractDate = function () {
    return this.getDate() + "/" + (this.getMonth() + 1) + "/" + this.getFullYear();
};

Date.prototype.ExtractDateUTC = function () {
    return this.getUTCDate() + "/" + (this.getUTCMonth() + 1) + "/" + this.getUTCFullYear();
};

Date.prototype.ExtractDateShortYear = function () {
    return General.pad((this.getDate()), 2) + "/" + General.pad((this.getMonth() + 1), 2) + "/" + this.getFullYear().toString().substr(2,2);
};

Date.prototype.ExtractDateLongYear = function () {
    return General.pad((this.getDate()), 2) + "/" + General.pad((this.getMonth() + 1), 2) + "/" + this.getFullYear();
};

Date.prototype.ExtractUTCDateLongYear = function () {
    return General.pad((this.getUTCDate()), 2) + "/" + General.pad((this.getUTCMonth() + 1), 2) + "/" + this.getFullYear();
};

Date.prototype.ExtractDateShortYearUTC = function () {
    return  General.pad((this.getUTCDate()), 2) + "/" + General.pad((this.getUTCMonth() + 1), 2) + "/" + this.getUTCFullYear().toString().substr(2, 2);
};

Date.prototype.ExtractNextYearDate = function () {
    return this.getDate() + "/" + (this.getMonth() + 1) + "/" + (this.getFullYear() + 1);
};

Date.prototype.ExtractHour = function () {

    return this.getHours();
};

Date.prototype.ExtractTime = function () {
    return General.pad(this.getHours(), 2) + ":" + General.pad(this.getMinutes(), 2);
};

Date.prototype.ExtractTimeUTC = function () {
    return General.pad(this.getUTCHours(), 2) + ":" + General.pad(this.getUTCMinutes(), 2);
};

Date.prototype.ExtractFullTime = function () {
    return General.pad(this.getHours(), 2) + ":" + General.pad(this.getMinutes(), 2) + ":" + General.pad(this.getSeconds(), 2);
};

Date.prototype.ExtractFullTimeUTC = function () {
    return General.pad(this.getUTCHours(), 2) + ":" + General.pad(this.getUTCMinutes(), 2) + ":" + General.pad(this.getUTCSeconds(), 2);
};

Date.prototype.shortDateTime = function () {
    return this.getDate() + "/" + (this.getMonth() + 1) + "/" + this.getFullYear() + "  " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
};

Date.prototype.ExtractDateShortMonthYear = function () {
    return General.pad((this.getMonth() + 1), 2) + "/" + this.getFullYear().toString().substr(-2);
};

Date.prototype.AddYear = function (y) {
    this.setFullYear(this.getFullYear() + y);
    return this;
};

Date.prototype.compareTo = function (_date) {
    if (typeof (_date) === 'string') {
        _date = new Date(_date);
    }

    return this.valueOf() > _date.valueOf() ? 1 : 0;
};

Date.prototype.isWeekend = function () {
    var day = this.getDay();

    return day === eDayOfWeek.Sunday || day === eDayOfWeek.Saturday;
};

function datePad(number) {
    if (number < 10) {
        return '0' + number;
    }

    return number;
}

if (!Date.prototype.toISOString) {
    (function () {
        Date.prototype.toISOString = function () {
            return this.getUTCFullYear() +
                '-' + datePad(this.getUTCMonth() + 1) +
                '-' + datePad(this.getUTCDate()) +
                'T' + datePad(this.getUTCHours()) +
                ':' + datePad(this.getUTCMinutes()) +
                ':' + datePad(this.getUTCSeconds()) +
              '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
              'Z';
        };
    }());
}

(function () {
    Date.prototype.toShortISOString = function () {
        return this.getUTCFullYear() +
            '-' + datePad(this.getUTCMonth() + 1) +
            '-' + datePad(this.getUTCDate());
    };
}());

Date.prototype.skipWeekendDays = function () {
    if (this.getDay() === eDayOfWeek.Saturday) {
        this.AddDays(2);
        this.setHours(23);
        this.setMinutes(59);
    }

    if (this.getDay() === eDayOfWeek.Sunday) {
        this.AddDays(1);
        this.setHours(23);
        this.setMinutes(59);
    }

    return this;
}

Date.prototype.toLaterDate = function () {
    this.AddDays(14);
    this.setHours(23);
    this.setMinutes(59);
    this.setSeconds(0);

    return this;
}

Date.prototype.getPureUTCDate = function() {
    return new Date(this.getUTCDate(), this.getUTCMonth(), this.getUTCFullYear());
}

Date.prototype.isValid = function (y, m, d) {
    this.setYear(y);
    this.setDate(d);
    this.setMonth(m - 1);

    if (this.getDate() !== d || this.getMonth()+1 !== m || this.getFullYear() !== y) {
        return false;
    } else {
        return true;
    }
}