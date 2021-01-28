define('managers/HelpCenterContentManager',
    [
        'require',
        'devicemanagers/StatesManager',
        'Dictionary',
        'initdatamanagers/Customer',
        'LoadDictionaryContent!HelpCenterWalkthroughs',
        'LoadDictionaryContent!HelpCenterTradingGuide',
    ],
    function (require) {
        var StatesManager = require('devicemanagers/StatesManager'),
            dictionary = require('Dictionary'),
            customer = require('initdatamanagers/Customer'),
            HELPCENTER_WALKTHROUGHS_RESOURCE_NAME = 'HelpCenterWalkthroughs',
            HELPCENTER_GUIDES_RESOURCE_NAME = 'HelpCenterTradingGuide',
            trackElements = {
                'QuickPlatformTour': 'PlatformTour',
                'HowToFoundYourAccount': 'DepositTour',
                'HowToOpenADeal': 'DealTour',
                'HowToUploadADocument': 'UploadTour',
            };

        function setWthroughLabels() {
            var result = {};

            result[eHowtoWthrough.quickTour] = 'QuickPlatformTour';
            result[eHowtoWthrough.foundAccount] = 'HowToFoundYourAccount';
            result[eHowtoWthrough.openDeal] = 'HowToOpenADeal';
            result[eHowtoWthrough.uploadDocument] = 'HowToUploadADocument';

            return result;
        }

        function getContentOrNullIfIsEmpty(contentKey, resourceName) {
            if (dictionary.ValueIsEmpty(contentKey, resourceName)) {
                return null;
            }

            return dictionary.GetItem(contentKey, resourceName);
        }

        function getWalkthKeySuffix() {
            if (customer.prop.isSeamless || customer.prop.isPending) {
                return eCustomerStateSuffix.pending;
            }

            if (customer.prop.isLive ||
                customer.prop.customerType === eCustomerType.TradingBonus ||
                StatesManager.States.Folder() === eFolder.GameFolder) {
                return eCustomerStateSuffix.live;
            }

            if (customer.prop.isDemo) {
                return eCustomerStateSuffix.demo;
            }

            return '';
        }

        function buildWalkthroughsList() {
            var result = [],
                WTHROUGH_LABELS = setWthroughLabels(),
                suffix = getWalkthKeySuffix();

            Object.keys(eHowtoWthrough)
                .forEach(function processKey(key) {
                    var prop = eHowtoWthrough[key],
                        wid = getContentOrNullIfIsEmpty(prop + suffix, HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);

                    if (wid) {
                        result.push({
                            type: prop,
                            text: getContentOrNullIfIsEmpty(WTHROUGH_LABELS[prop], HELPCENTER_WALKTHROUGHS_RESOURCE_NAME),
                            walkthrougId: wid,
                            trackElement: trackElements[WTHROUGH_LABELS[prop]]
                        });
                    }
                });

            return result;
        }

        function buildTradingGuidLink() {
            return getContentOrNullIfIsEmpty('tradingGuideLink',  HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);// HELPCENTER_GUIDES_RESOURCE_NAME);
        }

        function buildWireTransferGuideLink() {
            return getContentOrNullIfIsEmpty('wireTransferGuideLink', HELPCENTER_GUIDES_RESOURCE_NAME);
        }

        function buildSecureTradingGuideLink() {
            return getContentOrNullIfIsEmpty('secureTradingLink',  HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);
        }

        function buildUploadDocsGuideLink() {
            return getContentOrNullIfIsEmpty('uploadDocsVideoLink', HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);
        }

        function getData() {
            return {
                walkthroughList: buildWalkthroughsList(),
                tradingGuideLink: buildTradingGuidLink(),
                wireTransferGuideLink: buildWireTransferGuideLink(),
                secureTradingLink: buildSecureTradingGuideLink(),
                uploadDocsLink: buildUploadDocsGuideLink()
            };
        }

        return {
            GetData: getData
        }
    }
);
