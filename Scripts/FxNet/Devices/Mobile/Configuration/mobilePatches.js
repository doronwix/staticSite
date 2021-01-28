define(
    "configuration/mobilePatches",
    [
        'require',
        'jquery'
    ],
    function (require) {
        var $ = require('jquery'),
            deviceAgent = navigator.userAgent.toLowerCase(),
            agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/) || '',
            delayedVar,
            mobile = {
                device: {
                    iphone: agentID.indexOf("iphone") >= 0,
                    ipad: agentID.indexOf("ipad") >= 0,
                    ipod: agentID.indexOf("ipod") >= 0,
                    android: agentID.indexOf("android") >= 0
                },
                type: {
                    galaxy: (deviceAgent.match(/gt\-(i\d\d\d\d)/)) ? deviceAgent.match(/gt\-(i\d\d\d\d)/)[1] : '',
                    nexus: (deviceAgent.match(/nexus (\d)/)) ? deviceAgent.match(/nexus (\d)/)[1] : ''
                },
                system: {
                    ios: (deviceAgent.match(/iphone os (\d+)/)) ? deviceAgent.match(/iphone os (\d+)/)[1] : '',
                    height: $(window).height(),
                    android_4_3: deviceAgent.match(/android 4.3/) || '',
                    android_4_2: deviceAgent.match(/android 4.2/) || ''
                },
                browser: {
                    opera: deviceAgent.match(/opera/) || '',
                    safari: deviceAgent.match(/safari/) || '',
                    firefox: deviceAgent.match(/firefox/) || '',
                    chrome: deviceAgent.match(/chrome/) || ''
                },
                check: {}
            };

        mobile.check.apple = deviceAgent.match(/iphone|ipod|ipad/) || '';
        mobile.check.ios_chrome = mobile.check.apple && deviceAgent.indexOf('crios') > 0;
        mobile.check.s2_default = mobile.device.android && mobile.type.galaxy == 'i9100' && mobile.browser.safari && deviceAgent.match(/version\//);
        mobile.browser.android_default = mobile.device.android && mobile.browser.safari && deviceAgent.match(/version\//);

        window.addEventListener('orientationchange', handleOrientation, false);

        //Firefox orientationchange custom event
        if (mobile.device.android && mobile.browser.firefox && "matchMedia" in window) {
            var ff_orientationchange = window.matchMedia("(orientation: portrait)");
            ff_orientationchange.addListener(function (ori) {
                var active = $('#main').find('input:focus');

                if (active.length == 0) {
                    handleOrientation();
                    ffOrientation(ori);
                }
            });
        }

        function handleOrientation() {
            if (typeof delayedVar !== "undefined") {
                clearTimeout(delayedVar);
            }

            if (mobile.check.apple) {
                hideToolBar();
                loaded();
                Browser.forceRepaintIosRotate();
            }
            else {
                delayedVar = setTimeout(delayedFooter, 2000);

                window.scrollTo(0, 1);
            }
        }

        function ffOrientation(cur_orientation) {
            if (cur_orientation.matches) {
                document.querySelector('body').classList.remove('landscape');
            }
            else {
                document.querySelector('body').classList.add('landscape');
            }
        }

        function getOrientation() {
            var orientation = window.orientation;

            if (orientation == 0) {
                //portrait
                document.querySelector('body').classList.remove('landscape');
            }
            else if (orientation == 90 || orientation == -90) {
                //landscape
                document.querySelector('body').classList.add('landscape');
            }
        }

        function loaded() {
            getOrientation();
        }

        function startFunctions() {
            hideToolBar();

            //Galaxy s 2 input header bug;
            if (mobile.check.s2_default) {
                hiddenHeader();
            }

            //Galaxy s 3 input write bug
            if (mobile.browser.android_default && mobile.type.galaxy == 'i9300') {
                $('#main').addClass('input-write');
            }

            scrollMeDown();
            loaded();
        }

        function hiddenHeader() {
            var is_keyboard = false,
                initial_screen_size = window.innerHeight,
                main = $('#main');

            main.on('input[type=text] , input[type=number]', 'focus', function () {
                window.addEventListener('resize', function () {
                    window.orientation = window.orientation || 0;
                    is_keyboard = window.innerHeight < initial_screen_size;

                    if (window.orientation == 90 || window.orientation == -90) {
                        main.removeClass('input-focus');
                    }

                    (is_keyboard && window.orientation == 0) ? main.addClass('input-focus') : main.removeClass('input-focus');
                }, false);

                main.off('input[type=text] , input[type=number]', 'focus');
            });
        }

        function delayedFooter() {
            hideToolBar();
        }

        function hideToolBar() {
            var height = $(window).height();

            if (mobile.device.iphone) {
                var gaph = height - window.outerHeight;
                height = (gaph < 47 || (gaph < -136)) ? height += 65 : height += 4;
            }
            else if (!(mobile.device.ipad || window.outerHeight - window.innerHeight <= 254)
                && !(deviceAgent.indexOf('gt-i9300') > 0 || mobile.browser.opera)) {
                height += 55;
            }

            $('#splash_page').css('height', height + 'px');
            scrollMeDown();
        }

        function scrollMeDown() {
            setTimeout(function () { window.scrollTo(0, 1); }, 100);
        }

        window.mobile = mobile;

        var module = window.mobilePatches = {
            startFunctions: startFunctions,
            delayedFooter: delayedFooter
        };

        return module;
    }
);

