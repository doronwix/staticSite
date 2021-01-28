var CountDownModel = function (ko) {
    var countDownObject = {},
        countDownLoop = '';

    var init = function () {
        setDefaultObservables();
    };

    var setDefaultObservables = function () {
        countDownObject.expirationDate = ko.observable("");

        countDownObject.expired = ko.observable(true);

        countDownObject.counterValueLeft = ko.observable("");
        countDownObject.counterValueRight = ko.observable("");

        countDownObject.counterTextLeft = ko.observable("");
        countDownObject.counterTextRight = ko.observable("");

        countDownObject.seconds = ko.observable(0);
    };

    var start = function (isCustom) {
        countDownObject.expired(false);

        if (isCustom) {
            bannerLoop();
            countDownLoop = setInterval(function () { bannerLoop(); }, 1000);
        }
        else {
            regularLoop();
            countDownLoop = setInterval(function () { regularLoop(); }, 1000);
        }
    };

    var bannerLoop = function () {
        var countdown = countDownTimer(countDownObject.expirationDate());

        if (countdown.totalTicks > 60000) {
            if (countdown.days > 0) {
                countDownObject.counterValueLeft(countdown.days);
                countDownObject.counterValueRight(countdown.hours);

                countDownObject.counterTextLeft('d');
                countDownObject.counterTextRight('h');
            }
            else {
                countDownObject.counterValueLeft(countdown.hours);
                countDownObject.counterValueRight(countdown.minutes);

                countDownObject.counterTextLeft('h');
                countDownObject.counterTextRight('m');
            }
        }
        else {
            stop();
        }
    }

    var regularLoop = function () {
        var countdown = countDownTimer(countDownObject.expirationDate());

        if (countdown.totalTicks > 0) {
            countDownObject.seconds(countdown.seconds);
        }
        else {
            stop();
        }
    }

    var countDownTimer = function (endTime) {
        var target = endTime;
        var today = new Date();

        var milliseconds = target - today;
        var seconds = Math.floor(milliseconds / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);

        return {
            totalTicks: milliseconds,
            milliseconds: milliseconds % 1000,
            seconds: seconds % 60,
            minutes: minutes % 60,
            hours: hours % 24,
            days: Math.floor(hours / 24)
        };
    }

    var getText = function () {
        return countDownObject.counterValueLeft() +
            countDownObject.counterTextLeft() +
            ':' +
            countDownObject.counterValueRight() +
            countDownObject.counterTextRight();
    };

    var stop = function () {
        countDownObject.expired(true);
        clearInterval(countDownLoop);
    };

    return {
        Init: init,
        CountDownObject: countDownObject,
        Start: start,
        Stop: stop,
        GetText: getText
    };
};
