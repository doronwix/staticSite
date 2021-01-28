define(
    'cachemanagers/clientstatedataprocessor',
    [
        "require",
        'handlers/general',
        'cachemanagers/NotificationsManager',
        'cachemanagers/ClientStateFlagsManager',
        'cachemanagers/ClientStateHolderManager',
        "cachemanagers/PortfolioStaticManager",
        'cachemanagers/InstrumentVolumeManager',
        'cachemanagers/NetExposureManager',
        'cachemanagers/QuotesManager',
        'cachemanagers/activelimitsmanager',
        'cachemanagers/dealsmanager',
        'cachemanagers/bonusmanager',
        "StateObject!PerformaceEvents"
    ],
    function ClientStateDataProcessor(require) {
        var serverTime = null,
            general = require('handlers/general'),
            quotesManager = require('cachemanagers/QuotesManager'),
            activeLimits = require('cachemanagers/activelimitsmanager'),
            dealsManager = require('cachemanagers/dealsmanager'),
            notificationsManager = require('cachemanagers/NotificationsManager'),
            netExposureManager = require('cachemanagers/NetExposureManager'),
            portfolioStatic = require("cachemanagers/PortfolioStaticManager"),
            csFlags = require('cachemanagers/ClientStateFlagsManager'),
            csHolder = require('cachemanagers/ClientStateHolderManager'),
            instrumentVolumeManager = require('cachemanagers/InstrumentVolumeManager'),
            bonusManager = require('cachemanagers/bonusmanager'),
            stateObject = require("StateObject!PerformaceEvents");

        function processData(data, reinitialize) {
            if (data && data.length > 0) {

                if (data[eClientState.serverTime] && data[eClientState.serverTime].length > 0) {
                    var splitDate = general.SplitDateTime(data[eClientState.serverTime]);
                    serverTime = new Date(splitDate.year, splitDate.month - 1, splitDate.day, splitDate.hour, splitDate.min, splitDate.sec, splitDate.ms);
                }

                if (data[eClientState.portfolioStatic] && data[eClientState.portfolioStatic].length > 0) {
                    portfolioStatic.ProcessData(data[eClientState.portfolioStatic]);
                }

                if (data[eClientState.ohlcs] && data[eClientState.ohlcs].length > 0) {
                    quotesManager.ProcessOhlcData(data[eClientState.ohlcs]);
                }

                if (data[eClientState.ticks] && data[eClientState.ticks].length > 0) {
                    quotesManager.ProcessTickData(data[eClientState.ticks], serverTime);
                }

                if (data[eClientState.flags] && data[eClientState.flags].length > 0) {
                    csFlags.ProcessData(data[eClientState.flags]);
                }

                if (reinitialize || (data[eClientState.limits] && data[eClientState.limits].length > 0)) {
                    activeLimits.ProcessData(data[eClientState.limits], reinitialize);
                }

                if (reinitialize || (data[eClientState.deals] && data[eClientState.deals].length > 0)) {
                    dealsManager.ProcessDeals(data[eClientState.deals], reinitialize);
                }

                if (data[eClientState.portfolioSummary] && data[eClientState.portfolioSummary].length > 0) { //should check that portfolioSummary is not empty before accessing inner collections
                    if (data[eClientState.portfolioSummary][ePortfolioSummary.dealPL].length > 0) {
                        dealsManager.ProcessDealsPL(data[eClientState.portfolioSummary][ePortfolioSummary.dealPL]);
                    }

                    if (data[eClientState.portfolioSummary][ePortfolioSummary.csHolder].length > 0) {
                        csHolder.ProcessData(data[eClientState.portfolioSummary][ePortfolioSummary.csHolder]);
                    }

                    if (data[eClientState.portfolioSummary][ePortfolioSummary.netExposure].length > 0) {
                        netExposureManager.ProcessData(data[eClientState.portfolioSummary][ePortfolioSummary.netExposure]);
                    }

                    if (data[eClientState.portfolioSummary][ePortfolioSummary.instrumentVolumes].length > 0) {
                        instrumentVolumeManager.ProcessData(data[eClientState.portfolioSummary][ePortfolioSummary.instrumentVolumes]);
                    }
                }

                if (data[eClientState.notifications] && data[eClientState.notifications].length > 0) {
                    notificationsManager.ProcessData(data[eClientState.notifications]);
                }

                if (data[eClientState.bonus] && data[eClientState.bonus].length > 0) {
                    bonusManager.ProcessData(data[eClientState.bonus]);
                }
            }
        }

        function getServerTime() {
            return serverTime;
        }
        stateObject.set('InitialDataLoadCompleted', null);
        stateObject.subscribe('InitialDataLoadCompleted', function (initialServerTime) {
            var splitDate = general.SplitDateTime(initialServerTime);
            serverTime = new Date(splitDate.year, splitDate.month - 1, splitDate.day, splitDate.hour, splitDate.min, splitDate.sec);
        });

        return {
            processData: processData,
            ServerTime: getServerTime
        };
    }
);