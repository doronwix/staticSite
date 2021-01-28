define(
    'fxnet/uilayer/Modules/WalkthroughsModule',
    [
        'require',
        'Q',
        'handlers/general',
        'global/UrlResolver'
    ],
    function (require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            urlResolver = require('global/UrlResolver');

        var deferer = Q.defer(),
            language = urlResolver.getLanguage(),
            inlineManuallanguage = {
                Arabic: 'ar',
                Chinese: 'zh',
                Czech: 'cs',
                Dutch: 'nl',
                English: 'en',
                Francais: 'fr',
                German: 'de',
                Greek: 'el',
                Hindi: 'hi',
                Hungarian: 'hu',
                Indonesian: 'id',
                Italian: 'it',
                Korean: 'ko',
                Japanese: 'ja',
                Polish: 'pl',
                Romanian: 'ro',
                Russian: 'ru',
                Spanish: 'es',
                Thai: 'th'
            };

        function loadPlayer() {
            window.inlineManualOptions = { language: inlineManuallanguage[language] || 'en' };

            var sc = document.createElement('script');

            sc.type = 'text/javascript';
            sc.async = true;
            sc.src = 'https://inlinemanual.com/embed/player.dad7f32ce6cc61cea346bf8ae2c7216e.js';

            var done = false;

            sc.onload = sc.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    deferer.resolve();
                }
            };

            var s = document.getElementsByTagName('script')[0];

            s.parentNode.insertBefore(sc, s);
        }

        function playWalkthrough(id, title) {
            deferer.promise
                .then(function () {
                    window.inline_manual_player.activateTopic(id);
                })
                .done();
        }

        function hideFlowAvailable() {
            var wPlayer = window.inline_manual_player;

            return wPlayer &&
                wPlayer.hasOwnProperty('ui_elements') &&
                wPlayer.ui_elements.hasOwnProperty('popover_close_button') &&
                wPlayer.ui_elements.popover_close_button.hasOwnProperty('attributes') &&
                wPlayer.ui_elements.popover_close_button.attributes.hasOwnProperty('class') &&
                wPlayer.ui_elements.popover_close_button.hasOwnProperty('events') &&
                wPlayer.ui_elements.popover_close_button.events.hasOwnProperty('click');
        }

        function hideWalkthrough() {
            if (!hideFlowAvailable()) {
                return;
            }

            var hideActionClass, hideEls;

            hideActionClass = window.inline_manual_player.ui_elements.popover_close_button.attributes.class;
            hideEls = document.getElementsByClassName(hideActionClass);

            if (!general.isEmptyValue(hideActionClass) && hideEls && hideEls.length > 0) {
                window.inline_manual_player.ui_elements.popover_close_button.events.click();
            }
        }

        function initModule() {
            loadPlayer();

            deferer.promise
                .then(function () {
                    window.addEventListener('popstate', function () {
                        hideWalkthrough();
                    });
                })
                .done();
        }

        initModule();

        return {
            walkthroughWidget: {
                play: playWalkthrough,
            }
        };
    }
);
