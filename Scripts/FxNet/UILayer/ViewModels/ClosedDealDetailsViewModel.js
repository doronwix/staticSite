define(
    'viewmodels/ClosedDealDetailsViewModel',
    [
        'require',
        'knockout',
        'StateObject!ClosedDeals',
        'managers/CollectionNavigateManager',
        'initdatamanagers/Customer',
        'helpers/ObservableHelper'
    ],
    function (require) {
        var ko = require('knockout'),
            stateObject = require('StateObject!ClosedDeals'),
            collectionManagerManager = require('managers/CollectionNavigateManager'),
            customer = require('initdatamanagers/Customer'),
            vmHelpers = require('helpers/ObservableHelper'),
            dealPermission;

        var observableclosedDealDetailsObject = {},
            navigate = collectionManagerManager;

        function init(DealPermissions) {
            dealPermission = DealPermissions;
            initClosedDealDetailsObject();
            registerObservableStartUpEvent();
        }

        function registerObservableStartUpEvent() {
            $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vClosedDealDetails).visible.subscribe(function (isVisible) {
                if (!isVisible) {
                    stop();
                } else {
                    start();
                }
            });
        }

        function start() {
            setStaticInfo($viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vClosedDealDetails, 'selectedDeal'));
            setNavigator();
        }

        function stop() {
            vmHelpers.CleanKoObservableSimpleObject(observableclosedDealDetailsObject);
            stateObject.update(eStateObjectTopics.ClosedDealsUseFilters, true);
        }

        function setNavigator() {
            var args = $viewModelsManager.VManager.GetViewArgs(eViewTypes.vClosedDealDetails);
            navigate.Init(args.closedDeals, args.selectedIndex, observableclosedDealDetailsObject);
        }

        function initClosedDealDetailsObject() {
            observableclosedDealDetailsObject.orderID = ko.observable('');
            observableclosedDealDetailsObject.positionNumber = ko.observable('');
            observableclosedDealDetailsObject.instrumentID = ko.observable('');
            observableclosedDealDetailsObject.buyAmount = ko.observable('');
            observableclosedDealDetailsObject.sellAmount = ko.observable('');
            observableclosedDealDetailsObject.orderDir = ko.observable('');
            observableclosedDealDetailsObject.dealAmount = ko.observable(''); //by orderDir
            observableclosedDealDetailsObject.dealType = ko.observable('');
            observableclosedDealDetailsObject.valueDate = ko.observable('');
            observableclosedDealDetailsObject.executionTime = ko.observable('');
            observableclosedDealDetailsObject.positionStart = ko.observable('');
            observableclosedDealDetailsObject.forwardPips = ko.observable('');
            observableclosedDealDetailsObject.dealRate = ko.observable('');
            observableclosedDealDetailsObject.orderRateOpen = ko.observable('');
            observableclosedDealDetailsObject.orderRateClosed = ko.observable('');
            observableclosedDealDetailsObject.plSign = ko.observable('');
            observableclosedDealDetailsObject.pl = ko.observable('');
            observableclosedDealDetailsObject.originalPosNum = ko.observable('');
            observableclosedDealDetailsObject.buySymbol = ko.observable('');
            observableclosedDealDetailsObject.sellSymbol = ko.observable('');
            observableclosedDealDetailsObject.plSymbol = ko.observable('');
            observableclosedDealDetailsObject.rowNumber = ko.observable('');
            observableclosedDealDetailsObject.isPlNotLikeDefaultCcy = ko.observable('');
            observableclosedDealDetailsObject.plCCY = ko.observable('');
            observableclosedDealDetailsObject.plCCYAsNumber = ko.observable('');
            observableclosedDealDetailsObject.isFirst = ko.observable();
            observableclosedDealDetailsObject.isLast = ko.observable();
            observableclosedDealDetailsObject.adj = ko.observable();
            observableclosedDealDetailsObject.isStock = ko.observable(false);
            observableclosedDealDetailsObject.hasAdditionalPL = ko.observable();
            observableclosedDealDetailsObject.commission = ko.observable('');
            observableclosedDealDetailsObject.spreadDiscount = ko.observable('');
            observableclosedDealDetailsObject.grossPL = ko.observable('');
            observableclosedDealDetailsObject.hasZeroSpread = ko.observable(false);
            observableclosedDealDetailsObject.hasSpreadDiscount = ko.observable(false);
        }

        function updateObject(selectedDeal) {
            setStaticInfo(selectedDeal);
        }

        function setStaticInfo(selectedDeal) {
            observableclosedDealDetailsObject.customerCcyName = customer.prop.defaultCcy();
            observableclosedDealDetailsObject.orderID(selectedDeal.orderID);
            observableclosedDealDetailsObject.positionNumber(selectedDeal.positionNumber);
            observableclosedDealDetailsObject.instrumentID(selectedDeal.instrumentID);
            observableclosedDealDetailsObject.buyAmount(selectedDeal.buyAmount);
            observableclosedDealDetailsObject.sellAmount(selectedDeal.sellAmount);
            observableclosedDealDetailsObject.orderDir(selectedDeal.orderDir);
            observableclosedDealDetailsObject.dealAmount(selectedDeal.dealAmount);
            observableclosedDealDetailsObject.dealType(selectedDeal.dealType);
            observableclosedDealDetailsObject.valueDate(selectedDeal.valueDate);
            observableclosedDealDetailsObject.executionTime(selectedDeal.executionTimeFormatted);
            observableclosedDealDetailsObject.positionStart(selectedDeal.positionStartFormatted);
            observableclosedDealDetailsObject.forwardPips(selectedDeal.forwardPips);
            observableclosedDealDetailsObject.dealRate(selectedDeal.dealRate);
            observableclosedDealDetailsObject.orderRateOpen(selectedDeal.orderRateOpen);
            observableclosedDealDetailsObject.orderRateClosed(selectedDeal.orderRateClosed);
            observableclosedDealDetailsObject.plSign(selectedDeal.plSign);
            observableclosedDealDetailsObject.pl(selectedDeal.pl);
            observableclosedDealDetailsObject.originalPosNum(selectedDeal.originalPosNum);
            observableclosedDealDetailsObject.buySymbol(selectedDeal.buySymbol);
            observableclosedDealDetailsObject.sellSymbol(selectedDeal.sellSymbol);
            observableclosedDealDetailsObject.plSymbol(selectedDeal.plSymbol);
            observableclosedDealDetailsObject.rowNumber(selectedDeal.rowNumber);
            observableclosedDealDetailsObject.isPlNotLikeDefaultCcy(observableclosedDealDetailsObject.customerCcyName != selectedDeal.plSymbol);
            observableclosedDealDetailsObject.plCCY(selectedDeal.plCCY);
            observableclosedDealDetailsObject.plCCYAsNumber(selectedDeal.plCCYAsNumber);
            observableclosedDealDetailsObject.adj(selectedDeal.adj);
            observableclosedDealDetailsObject.isStock(selectedDeal.isStock);
            observableclosedDealDetailsObject.hasAdditionalPL(selectedDeal.hasAdditionalPL);
            observableclosedDealDetailsObject.commission(selectedDeal.commission);
            observableclosedDealDetailsObject.spreadDiscount(selectedDeal.spreadDiscount);
            observableclosedDealDetailsObject.grossPL(selectedDeal.grossPL);
            observableclosedDealDetailsObject.hasZeroSpread(dealPermission.CustomerDealPermit() === eDealPermit.ZeroSpread);
            observableclosedDealDetailsObject.hasSpreadDiscount(dealPermission.HasSpreadDiscount());
        }

        return {
            Init: init,
            Data: observableclosedDealDetailsObject,
            UpdateObject: updateObject,
            Navigate: navigate
        };
    }
);
