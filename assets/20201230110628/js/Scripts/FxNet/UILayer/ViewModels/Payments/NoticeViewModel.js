'use strict';
define(
    'viewmodels/Payments/NoticeViewModel',
    [
        "require",
        "knockout",
        'devicemanagers/StatesManager'
    ],
    function (require) {
        var ko = require("knockout"),
            statesManager = require('devicemanagers/StatesManager');
            
        function NoticeViewModel() {
            var viewOptions = {};

            function init() {
                viewOptions.showNoAmlDeclaration = ko.pureComputed(function () {
                    return statesManager.States.IsAmlPending();
                });

                viewOptions.showView = ko.pureComputed(function () {
                    return viewOptions.showNoAmlDeclaration();
                });
            }

            init();

            return {
                ViewOptions: viewOptions
            };
        }

        return NoticeViewModel;
    });