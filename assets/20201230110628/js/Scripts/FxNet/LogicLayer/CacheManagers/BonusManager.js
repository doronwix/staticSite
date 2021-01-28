define(
    'cachemanagers/bonusmanager',
    [
        'require',
        'knockout',
        'handlers/general',
        'handlers/Delegate',
        'enums/DataMembersPositions'
    ],
    function BonusManager(require) {
        // model example: {'VolumeUsd': 10000000, 'AmountBase': 500, 'AmountGivenBase': 570, 'StartDate ': '01/01/2017', 'EndDate': '01/01/2018'}
        var ko = require('knockout'),
            general = require('handlers/general'),
            delegate = require('handlers/Delegate');

        var module = {};
        module.onChange = new delegate();

        module.bonus = ko.observable({
            volumeUsd: null,
            amountBase: null,
            amountGivenBase: null,
            startDate: null,
            endDate: null,
            accumulatedVolumeUsd: null
        });

        module.ProcessData = function (bonusData) {
            module.bonus({
                volumeUsd: general.toNumeric(bonusData[eBonus.volumeUsd]),
                amountBase: general.toNumeric(bonusData[eBonus.amountBase]),
                amountGivenBase: general.toNumeric(bonusData[eBonus.amountGivenBase]),
                startDate: bonusData[eBonus.startDate],
                endDate: bonusData[eBonus.endDate],
                accumulatedVolumeUsd: general.toNumeric(bonusData[eBonus.accumulatedVolumeUsd])
            });
            module.onChange.Invoke();
        }

        return module;
    }
);