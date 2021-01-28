define(
    'devicemanagers/HelpCenterMenuPersonalGuideManager',
    [
        'require',
        'handlers/general',
        'tracking/loggers/datalayer',
        'StateObject!HelpcHub',
        'devicemanagers/StatesManager',
        'fxnet/uilayer/Modules/WalkthroughsModule',
        'managers/viewsmanager',
        'managers/HelpCenterContentManager',
        'generalmanagers/ErrorManager',
        'StateObject!IM',
        'FxNet/UILayer/ChatBot/PersonalGuideManager',
        'Dictionary',
        'configuration/initconfiguration'
    ],
    function (require) {
        var general = require('handlers/general'),
            dataLayer = require('tracking/loggers/datalayer'),
            stateObjectHelpc = require('StateObject!HelpcHub'),
            statesManager = require('devicemanagers/StatesManager'),
            walkthrough = require('fxnet/uilayer/Modules/WalkthroughsModule'),
            viewsManager = require('managers/viewsmanager'),
            contentManager = require('managers/HelpCenterContentManager'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            stateObjectIM = require('StateObject!IM'),
            personalGuideManager = require('FxNet/UILayer/ChatBot/PersonalGuideManager'),
            userIsActive = statesManager.States.IsActive,
            storageFactory = StorageFactory(StorageFactory.eStorageType.local),
            helpCenterStorageKey = 'help-center-states',
            usubscribeRewardClose = null,
            configuration = require('configuration/initconfiguration').PersonalGuideConfiguration;

        function getPGSeenStatus() {
            var obj = JSON.parse(storageFactory.getItem(helpCenterStorageKey)) || { pgSeen: false };

            return obj.pgSeen;
        }

        function getPGInteractedStatus() {
            var obj = JSON.parse(storageFactory.getItem(helpCenterStorageKey)) || { pgInteracted: false };

            return obj.pgInteracted;
        }

        function _start() {
            if (userIsActive() || stateObjectHelpc.get('pg-present')) {
                return;
            }

            setSubscriptions();

            setHidePersonalGuideStatus();

            var bubbleMessages = personalGuideManager.getBubbleNessage();

            enablePersonalGuide(bubbleMessages);
        }

        function enablePersonalGuide(bubbleMessages, hidePersonalGuide) {
            if (hidePersonalGuide || stateObjectHelpc.get('pg-present')) {
                return;
            }

            stateObjectHelpc.update('pg-present', true);
            if (bubbleMessages !== null && !(getPGSeenStatus() || getPGInteractedStatus())) {
                stateObjectHelpc.update('showBubble', bubbleMessages);
            }
        }

        function disablePersonalGuideWhenBecameActive(mustDisable) {
            if (mustDisable === true) {
                stateObjectHelpc.update('pg-present', false);
            }
        }

        function walkthroughPlay(data) {
            var qptContent,
                wtPlay,
                INTRO = 'introduction';

            if (userIsActive() || data.event !== 'personalguide4helpcenter-play') {
                return;
            }

            qptContent = contentManager.GetData().walkthroughList.find(
                function (item) { return item.type === eHowtoWthrough.quickTour }
            ) || {};

            wtPlay = data.walkthroughToPlay !== INTRO ? data.walkthroughToPlay : qptContent.walkthrougId;
            stateObjectHelpc.update('visible', false);

            if (wtPlay) {
                walkthrough.walkthroughWidget.play(wtPlay);
            }
            else if (data.walkthroughToPlay === INTRO && !qptContent) {
                ErrorManager.onError(
                    'HelpCenterMenuPersonalGuideManager/WalkthroughPlay',
                    'Invalid walkthrough id: ' + data.walkthroughToPlay,
                    eErrorSeverity.low
                );
            }
        }

        function showPersonalGuideOnRewardClose() {
            if (!usubscribeRewardClose) {
                return;
            }

            usubscribeRewardClose();
            usubscribeRewardClose = null;

            if (!stateObjectHelpc.get('pg-present')) {
                return;
            }

            stateObjectHelpc.update('visible', true);
        }

        function setHidePersonalGuideStatus() {
            var mustHide = (0 <= configuration.DoNotShowForms.indexOf(viewsManager.ActiveFormType()))
                || ((stateObjectIM.get('IMPopUpVisible') || {}).MessageType === 17);

            if (stateObjectHelpc.get('HidePersonalGuide') !== mustHide) {
                stateObjectHelpc.update('HidePersonalGuide', mustHide);
            }

            if (mustHide && stateObjectHelpc.get('visible')) {
                stateObjectHelpc.update('visible', false);
                if ((stateObjectIM.get('IMPopUpVisible') || {}).MessageType === 17) {
                    usubscribeRewardClose = stateObjectIM.subscribe('IMPopUpVisible', showPersonalGuideOnRewardClose);
                }
            }
        }

        function setBubblePersonalGuideStatus(interacted) {
            if (interacted == true) {
                stateObjectHelpc.update('showNotification', false);
            }
        }

        function setSubscriptions() {
            userIsActive.subscribe(disablePersonalGuideWhenBecameActive);
            dataLayer.subscribers.push(walkthroughPlay);
            viewsManager.ActiveFormType.subscribe(setHidePersonalGuideStatus);
            stateObjectIM.subscribe('IMPopUpVisible', setHidePersonalGuideStatus);

            stateObjectHelpc.set('pg-interacted', false);
            stateObjectHelpc.subscribe('pg-interacted', setBubblePersonalGuideStatus);
        }

        function init() {
            personalGuideManager.enabled
                .then(function (isEnabled) {
                    if (isEnabled) {
                        personalGuideManager.start({});
                        _start();
                    }
                });
        }

        function scroll() {
            if (window.emilyScrollContainer && general.isFunctionType(window.emilyScrollContainer)) {
                window.emilyScrollContainer();
            }
        }

        return {
            Init: init,
            Show: personalGuideManager.show,
            Scroll: scroll
        };
    }
);
