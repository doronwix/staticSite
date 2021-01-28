/*!
 Version = 20201230110628 2021-01-27 11:45:06 
*/
$(document).ready(function () {
    (new Login()).Init();
});

function Login() {
    var revealPassword,
        cKeyCode = {
            CtrlEnter: 10,
            Enter: 13
		},
		sessionStorage = StorageFactory(StorageFactory.eStorageType.session),
		_apiIM = apiIM(window.jQuery);

    function fxnetCallback() {
        //empty for now
    };

    function init() {
        revealPassword = new RevealPassword();
        window.externalEventsCallbacks.fire('login-view', extractLoginEventData());

        if (window.adjustUiPerDevice) {
            adjustUiPerDevice(document.getElementById('txtUName'));
            adjustUiPerDevice(document.getElementById('txtPass'));
        }
        if (!CookieHandler.CookiesEnabled()) {
            popupManager.showCookiesDisabledPopUp();
        }
        decodeValidation();
        setDomReferences();
        setDomEvents();
        showUserName();
        interactiveMessageIM();
        setSessionStorage();
    }

    function setSessionStorage() {
        sessionStorage.setItem('isCustomerFirstCall', IMRequestIntervalModes.Login);
        sessionStorage.setItem('isAutologin', false);
    }

    function interactiveMessageIM() {
        _apiIM.InitAllFallback(Model.InteractiveMessagesTokenUrl, Model.InteractiveMessagesUrl, Model.InteractiveMessagesLanguage, Model.RequestInterval, fxnetCallback, 0, 'false', '');
    }

    function showUserName() {
        if (StorageFactory.isSupported(StorageFactory.eStorageType.local)) {
            var localStorage = StorageFactory(StorageFactory.eStorageType.local);
            var un = localStorage.getItem('un');
            if (un) {
                $('#txtUName').val(un);
            }
        }
    }

    function setDomReferences() {
    }

    function saveUsername() {
        if (StorageFactory.isSupported(StorageFactory.eStorageType.local)) {
            var localStorage = StorageFactory(StorageFactory.eStorageType.local);

            if ($('#saveusername').is(':checked')) {
                localStorage.setItem('un', $('#txtUName').val());
            } else {
                localStorage.removeItem('un');
            }
        }
    }

    function decodeValidation() {
        var validation = $('.validation-summary-errors li');
        var t = validation.text();
        validation.html(t);
    }

    function extractLoginEventData() {
        function extractLocalParams(searchStr) {
            var urlParams = urlDecode(searchStr);
            var eventData = {};

            for (var prop in urlParams) {
                if (Object.prototype.hasOwnProperty.call(urlParams, prop)) {
                    if (prop === 'evt') {
                        eventData.evt = urlParams[prop];
                    } else if (prop === 'dcid') {
                        eventData.dcid = urlParams[prop];
                    }
                }
            }

            if (isNullOrUndefined(eventData.evt) && isNullOrUndefined(eventData.dcid)) {
                return null;
            }

            return eventData;
        }

        var urlParams = urlDecode(window.location.search);

        if (!isNullOrUndefined(urlParams.returnUrl)) {
            return extractLocalParams(urlParams.returnUrl);
        }

        return extractLocalParams(window.location.search);
    }

    function setDomEvents() {
        $(document).on('click', function () {
            window.externalEventsCallbacks.fire('login-interaction');
        });

        $('#LoginForm').on('keyup.validateField', 'input', function (e) {
            if (e.which === cKeyCode.CtrlEnter || e.which === cKeyCode.Enter) {
                $('#LoginForm').submit();
            } else {
                var validator = $("#LoginForm").validate();
                // FF srcElement is undefined, use target instead
                validator.element(e.target || e.srcElement);
                highlightInvalids();
            }
        });

        $('#imgRefresh').on('click', function () {
            $.ajax({
                async: false,
                url: Model.jsVirtualPath + '/CaptchaImage/Generate/',
                type: 'POST',
                success: function (data) {
                    $('#captcha').replaceWith(data);
                }
            });
        });

        $('#btnOkLogin').on('click', function (e) {
            e.preventDefault();
            revealPassword.HidePasswordText();
            $('#LoginForm').trigger('submit');
        });

        $('#autologin').on('change', function () {
            sessionStorage.setItem('isAutologin', $('#autologin').is(':checked'));
        });

        $('#LoginForm').on('submit', function () {
            if ($('#btnOkLogin').is('.disabled')) {
                return false;
            }

            if ($('#LoginForm').valid()) {
                $('#btnOkLogin').addClass('disabled');
            }

            sessionStorage.setItem('loginSubmitClicked', true);

            window.externalEventsCallbacks.fire('login-submit', {
                isAutologin: sessionStorage.getItem('isAutologin'),
                type: "password"
            });

            $('#txtUName').val($('#txtUName').val().trim());

            saveUsername();
        });

        function highlightInvalids() {
            var form = $("#LoginForm"),
                validator = form.validate();

            $('.userNameLine').removeClass('error');

            $.each(validator.errorList, function (index, error) {
                $(error.element).parent().addClass('error');
            });
        }

        revealPassword.Init({ passwordInput: $('.password-input'), icon: $('#passwordIcon'), form: $('#LoginForm') });
    }

    return {
        Init: init
    };
}
;
function RevealPassword() {
	var passwordInput,
		passwordText,
		icon,
		form,
		classNames = {
			passwordTypeText: 'password-type-text',
			passwordInput: 'password-input',
			icoWbReveal: 'ico-wb-reveal',
			icoWbRevealOff: 'ico-wb-reveal-off',
			icoPassBlue: 'ico-pass-blue'
		},
		keyCodes = {
			enter: 13,
			ctrlEnter: 10
		};

	function init(elements) {
		passwordInput = elements.passwordInput;
		icon = elements.icon;
		form = elements.form;

		setRevealPassword();
	}

	function setRevealPassword() {
		icon.on('click.RevealPassword', togglePasswordField);
		passwordInput.on('keyup.RevealPassword', togglePasswordIcon);
		$(window).on('orientationchange.RevealPassword', onOrientationChange);

		setTimeout(togglePasswordIcon, 100);
	}

	function showPasswordTextInput() {
		passwordText = passwordInput
			.attr("type", "text");

		passwordText.on('keyup.RevealPassword', onPasswordTextKeyUp);
	}

	function onOrientationChange() {
		if (isNullOrUndefined(passwordText)) {
			return;
		}

		passwordInput.val(passwordText.val());
		hidePasswordTextInput();
		icon
		.removeClass(classNames.icoWbRevealOff)
		.addClass(classNames.icoWbReveal);
	}

	function hidePasswordTextInput() {
		if (isNullOrUndefined(passwordText)) {
			return;
		}

		passwordText.off('.RevealPassword');
		passwordText = passwordInput
			.attr("type", "password");
	}

	function onPasswordTextKeyUp(e) {
		if (passwordText.val() !== '') {
			submitOnEnter(e);

			return;
		}

		reinitiliasePasswordField();
	}

	function submitOnEnter(e) {
		if (e.which == keyCodes.ctrlEnter || e.which == keyCodes.enter) {
			e.preventDefault();

			passwordInput.val(passwordText.val());
			hidePasswordTextInput();

			form.submit();
		}
	}

	function reinitiliasePasswordField() {
		hidePasswordTextInput();
		passwordInput
			.val('')
			.prev()
			.removeClass(classNames.icoPassBlue)
			.removeClass(classNames.icoWbRevealOff)
			.addClass(classNames.icoWbReveal);
	}

	function revealPassword() {
		showPasswordTextInput();
		icon
		.removeClass(classNames.icoWbReveal)
		.addClass(classNames.icoWbRevealOff);

		if (passwordTextHasValue()) {
			passwordText.val(passwordInput.val());
		}
	}

	function hidePassword() {
		if (passwordTextHasValue()) {
			passwordInput.val(passwordText.val());
		}

		hidePasswordTextInput();
		icon.removeClass(classNames.icoWbRevealOff).addClass(classNames.icoWbReveal);
	}

	function togglePasswordField() {
		if (passwordInput.val() === '') {
			return;
		}

		if (icon.hasClass(classNames.icoWbReveal)) {
			revealPassword();
		} else {
			hidePassword();
		}
	}

	function togglePasswordIcon() {
		var passwordInputBoxStyle = passwordInput.css("box-shadow");

		if (passwordInput.val() !== '' ||
			(Browser.isChrome() && passwordInputBoxStyle.indexOf('inset') >= 0)) {
			passwordInput.prev().addClass(classNames.icoPassBlue);
		} else {
			passwordInput
				.prev()
				.removeClass(classNames.icoPassBlue)
				.removeClass(classNames.icoWbRevealOff)
				.addClass(classNames.icoWbReveal);
		}
	}

	function passwordTextHasValue() {
		return !isNullOrUndefined(passwordText) &&
			passwordText.length > 0 &&
			passwordText.val() !== '';
	}

	function dispose() {
		icon.off('click.RevealPassword');
		passwordInput.off('keyup.RevealPassword');
		$(window).off('orientationchange.RevealPassword');
	}

	function isNullOrUndefined(value) {
		return value === null || typeof value === 'undefined';
	}

	return {
		Init: init,
		HidePasswordText: hidePassword,
		Dispose: dispose
	}
}
;
var deviceAgent = navigator.userAgent.toLowerCase();
var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/) || '';
var mobile = {
	device: {
		iphone: agentID.indexOf("iphone") >= 0,
		ipad: agentID.indexOf("ipad") >= 0,
		ipod: agentID.indexOf("ipod") >= 0,
		android: agentID.indexOf("android") >= 0
	},
	type: {
		galaxy: (deviceAgent.match(/gt\-(i\d\d\d\d)/)) ? deviceAgent.match(/gt\-(i\d\d\d\d)/)[1] : ''
	},
	browser: {
		opera: deviceAgent.match(/opera/) || '',
		safari: deviceAgent.match(/safari/) || '',
		firefox: deviceAgent.match(/firefox/) || ''
	},
	check: {}
};

mobile.check.apple = deviceAgent.match(/iphone|ipod|ipad/) || '';
mobile.browser.android_default = mobile.device.android && mobile.browser.safari && deviceAgent.match(/version\//);


$(window).on('load', function () {
	calculateHeights();

	//Galaxy S3 input write bug
	if (mobile.browser.android_default && mobile.type.galaxy == 'i9300') $('#main').addClass('input-write');
});

function calculateHeights() {
    var footerH = $('#footer').outerHeight() || 0,
        innerWr = $('.innerWrapper');

    innerWr.css('min-height', 'calc(100% - ' + (footerH + 2) + 'px');
}

window.addEventListener('orientationchange', function () {
	calculateHeights();
}, false);

window.addEventListener('resize', function () {
	calculateHeights();
}, false);

function loginCloseIn() {
	var mainWr = document.getElementById('main');
	if (mainWr) {
		mainWr.style.position = 'fixed';
	}

	if (this.value != '') {
		$(this).next().css('display', 'block');
	}
	else $(this).next().css('display', 'none');
}

function loginCloseOut() {
	var mainWr = document.getElementById('main');
	if (mainWr) {
		mainWr.style.position = '';
	}

	if (this.value == '') {
		$(this).next().css('display', 'none');
	}
}

$("#txtUName, #txtPass").on('keyup', loginCloseIn);
$("#txtUName, #txtPass").on('focus', loginCloseIn);
$("#txtUName, #txtPass").on('blur', loginCloseOut);
;
var smartBanner = {
	show: function(){
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	    var isAndroid = userAgent.match(/Android/i) != null;

		if (isAndroid && (typeof app === 'undefined')) {
            //app comes from phonegap.js and it's only for the native one
		    $('.head-wrapper').slideDown('slow');

		    $('.head-wrapper a.close').on('click', function () {
				$('.head-wrapper').slideUp('slow');
		    });
		}
	}
}

$(document).ready(function(){
	smartBanner.show();
})
;
/*global IMContainer:true*/
/*eslint no-undef: 2*/
var _JSON2 = JSON;
/*	
jQuery pub/sub plugin by Peter Higgins (dante@dojotoolkit.org)
Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
http://dojofoundation.org/license for more information.
*/
function apiIM($) {

    // the topic/subscription hash
    var cache = {};

    $.publish = function (/* String */topic, /* Array? */args) {
        // summary: 
        //		Publish some data on a named topic.
        // topic: String
        //		The channel to publish on
        // args: Array?
        //		The data to publish. Each array item is converted into an ordered
        //		arguments on the subscribed functions. 
        //
        // example:
        //		Publish stuff on '/some/topic'. Anything subscribed will be called
        //		with a function signature like: function(a,b,c){ ... }
        //
        //	|		$.publish("/some/topic", ["a","b","c"]);
        cache[topic] && $.each(cache[topic], function () {
            try {
                this.apply($, args || []);
            } catch (e) {

            }
        });
    };

    $.subscribe = function (/* String */topic, /* Function */callback) {
        // summary:
        //		Register a callback on a named topic.
        // topic: String
        //		The channel to subscribe to
        // callback: Function
        //		The handler event. Anytime something is $.publish'ed on a 
        //		subscribed channel, the callback will be called with the
        //		published array as ordered arguments.
        //
        // returns: Array
        //		A handle which can be used to unsubscribe this particular subscription.
        //	
        // example:
        //	|	$.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
        //
        if (!cache[topic]) {
            cache[topic] = [];
        }
        cache[topic].push(callback);
        return [topic, callback]; // Array
    };

    $.unsubscribe = function (/* Array */handle) {
        // summary:
        //		Disconnect a subscribed function for a topic.
        // handle: Array
        //		The return value from a $.subscribe call.
        // example:
        //	|	var handle = $.subscribe("/something", function(){});
        //	|	$.unsubscribe(handle);

        var t = handle[0];
        cache[t] && $.each(cache[t], function (idx) {
            if (this == handle[1]) {
                cache[t].splice(idx, 1);
            }
        });
    };
    function InitAll(tokenIM, serviceBase, langId, requestInterval, uiActionCallbacks, requestIntervalMode, isAnnoncement, smartBannerCallback) {
        $(document).ready(function () {
            var im = new IMdataService();
            var imLS = new IMlayoutService();

            ConfigureIMDataAndLayoutServices(im, imLS, uiActionCallbacks, isAnnoncement, smartBannerCallback);

            im.init(tokenIM, serviceBase, langId, requestInterval, requestIntervalMode, isAnnoncement);
        });
    }

    function InitAllFallback(tokenIMUrl, serviceBase, langId, requestInterval, uiActionCallbacks, requestIntervalMode, isAnnoncement, smartBannerCallback) {
        $(document).ready(function () {
            var im = new IMdataService();
            var imLS = new IMlayoutService();

            ConfigureIMDataAndLayoutServices(im, imLS, uiActionCallbacks, isAnnoncement, smartBannerCallback);

            var updateCurrentToken = function (currentToken) {
                im.init(currentToken, serviceBase, langId, requestInterval, requestIntervalMode, isAnnoncement);
            };
            im.getTokenIM(tokenIMUrl, updateCurrentToken);
        });
    }

    function ConfigureIMDataAndLayoutServices(im, imLS, uiActionCallbacks, isAnnouncement, smartBannerCallback) {
        im.onErrorIM_Event(onErrorIM);
        im.PopupCssClass.OverlayClass = 'bg_shadow'; //from the CSS file of content
        im.PopupCssClass.PopupClass = 'popupContainer';
        im.PopupCssClass.CloseClass = 'closePopUP';
        if (isAnnouncement == "false") {
            im.onReportIMAction_Event();
            im.onReportIMStatus_Event();
        }

        imLS.init(im);
        imLS.onCompleteShowIM_Subscribe();
        imLS.onPopupClose_Subscribe();
        if (isAnnouncement == "false") {
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.Deposit, uiActionCallbacks.deposit);
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.Accept, uiActionCallbacks.accept);
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.WalkThroughDeal, uiActionCallbacks.walkthrough);
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.PrivacyPolicy, uiActionCallbacks.privacypolicy);
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.imClosedDeals, uiActionCallbacks.imClosedDeals);
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.imOpenDeals, uiActionCallbacks.imOpenDeals);
            imLS.onIMUIAction_Subscribe(imLS.IMUIActionType.imNewDeal, uiActionCallbacks.imNewDeal);
        }
        imLS.onSmartBanner_Subscribe(smartBannerCallback);
    }

    // functions for callback
    var onErrorIM = function (topics, data) {
    };


    $.fn.center = function () {
        this.css("position", "absolute");
        this.css("top", ($(window).height() - this.height()) / 2 + $(window).scrollTop() + "px");
        this.css("left", ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + "px");
        return this;
    };

    $.fn.outerHTML = function (s) {
        return s ? this.before(s).remove() : $("<p>").append(this.eq(0).clone()).html();
    };

    return {
        InitAll: InitAll,
        InitAllFallback: InitAllFallback
    }

};


function removeByValue(arr, property, val) {
    if (arr != null) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][property] == val) {
                arr.splice(i, 1);
            }
        }
    }
    return arr;
}

//-------------------------------------------------------
// AttachEvent
//-------------------------------------------------------
// uglify mangle throw error.
window.IMContainer = {
    currentActiveProposition: null
};

var IMdataService = function () {
    var Token = null;
    var TokenUrl = null;
    var ServiceBase = null;
    var RetryInterval = 1000;
    var LanguageId = null;
    var Req = null;
    var self = this;
    var Current = 0;
    var ItemsCount = 0; // total number of items
    var MaxRetries = 60;
    var CurrentRetry = 0;
    var RequestInterval = 15000;
    var RequestIntervalMode = 1; // 0 Logon, 1 Ongoing
    var Interval = 0;
    var IsAnnoncement = false;
    var CurrentRowVersion = null;
    var currentActiveProposition = null;
    var CustomerTrackingDetailsRetries = 5;

    var PopupCssClass = {
        // CSS Classes
        PopupClass: 'popupContainer',
        CloseClass: 'closePopUP',
        OverlayClass: 'bg_shadow',
        EnvelopePopupClass: '.new-msg-action',
        EnvelopePopupClassMobile: '.envelope a',
        SmartBannerWideClass: 'smartBannerWide',
        SmartBannerSmallClass: 'smartBannerSmall',
        smartBannerWideViewOfferClass: 'details',
        smartBannerSmallViewOfferClass: 'smartBannerSmall'
    };

    var Events = {
        onCompleteGetActiveIM: 'onCompleteGetActiveIM',
        onCompleteShowIM: 'onCompleteShowIM',
        onErrorIM: 'onErrorIM',
        onPopupClose_Event: 'onPopupClose',
        onReportIMAction: 'onReportIMAction',
        onReportIMStatus: 'onReportIMStatus',
        onSmartBanner: 'onSmartBanner',
        stopGetActiveIMCalls: 'onStopGetActiveIMCalls',
        restartGetActiveIMCalls: 'onRestartGetActiveIMCalls'
    };

    var init = function (token, serviceBase, languageId, requestInterval, requestIntervalMode, isAnnoncement) {
        ServiceBase = serviceBase;
        LanguageId = languageId;
        RequestInterval = requestInterval;
        RequestIntervalMode = requestIntervalMode;
        IsAnnoncement = isAnnoncement;

        IMclearInterval(Interval);
        Token = token;

        var isValidToken = false;
        var pat = /^[a-z0-9]+$/i; // alpha-numeric

        if (Token != null) {
            isValidToken = pat.test(Token);
        }

        if (isValidToken == true) {
            getActiveIM(Token, serviceBase, isAnnoncement);
        }

        if (typeof define !== "function" || !define.amd) {
            return;
        }

        require(["StateObject!SystemNotificationEvents"], function setupStateObjectSubscribers(stateObject) {
            stateObject.set(Events.stopGetActiveIMCalls, null);
            stateObject.set(Events.restartGetActiveIMCalls, null);

            stateObject.subscribe(Events.stopGetActiveIMCalls, function () {
                IMclearInterval(Interval);
            });

            stateObject.subscribe(Events.restartGetActiveIMCalls, function () {
                init(token, serviceBase, languageId, requestInterval, requestIntervalMode, isAnnoncement);
            });
        });
    };

    var proceedNextMessage = function () {
        if (Current + 1 < ItemsCount) { // if there are additional messages show next
            ++Current;
            handleActiveIM();
        } else {
            RequestIntervalMode = 1;
            if (Interval != 0) {
                clearInterval(Interval);
            }
            Interval = setInterval(function () {
                getActiveIM(Token, ServiceBase, IsAnnoncement);
            }, RequestInterval);
        }
    };

    var IMclearInterval = function (interval) {
        clearInterval(interval);
    };


    var getTokenIM = function getTokenIM(tokenUrl, callback) {
        $.ajax({
            url: tokenUrl,
            type: 'POST',
            async: true,
            success: callback
        });
    };

    //  Not Explorer or explorer 10 
    var getDataCORS = function (varUrl, varMethod, varData, onComplete) {

        var version = getInternetExplorerVersion();
        // IE8/9 can do cross domain with XDR (we have a different WCF endpoint and method)

        var methodUrl = varUrl + "/" + varMethod;

        var maxRetries = (varMethod == "CustomerTrackingDetailsGet") ? CustomerTrackingDetailsRetries : null;

        // If from winforms browser control window.external has a value
        if (version == -1 || version >= 10) {
            getDataIE10(methodUrl, varData, onComplete, maxRetries);
        } else if (version >= 8) {
            // IE8/9 can do cross domain with XDR (we have a different WCF endpoint and method)
            methodUrl = varUrl + "/xdr/" + varMethod + "XDR";
            getDataIE8(methodUrl, varData, onComplete, maxRetries);
        } else {
            //alert("No support for IE7");
            // if not, IE7 and lower can't do cross domain
            if (window.external) {
                getDataIE8(methodUrl, varData, onComplete, maxRetries);
            } else {
                //alert("No support for IE7");
            }
        }
    }

    // Regular Chrome or IE10
    function getDataIE10(varUrl, varData, onComplete, maxRetries) {
        $.ajax({
            async: true,
            type: 'POST',
            url: varUrl,
            data: varData,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData: true,
            crossDomain: true,
            success: function (data) { //On Successfull service call
                if (onComplete != null) {
                    if (maxRetries && data.Response === "[]" && maxRetries > 0) {
                        maxRetries = maxRetries--;
                        var getData = getDataIE10.bind(this, varUrl, varData, onComplete, maxRetries);
                        setTimeout(getData, RetryInterval);
                    }
                    else {
                        onComplete(data);
                    }
                } else {
                    //alert("empty");
                }
            },
            error: function (xhr) {
            }
        });

    }

    // IE8 & 9 only Cross domain JSON request
    function getDataIE8(varUrl, varData, onComplete, maxRetries) {
        // IE8 & 9 only Cross domain JSON request
        if (window.XDomainRequest) {
            var xdr = new XDomainRequest();
            if (xdr) {
                xdr.onerror = function () {
                    // alert('Error in getDataIE8');
                };
                xdr.ontimeout = function () {
                    //  alert('Timeout in getDataIE8');
                };
                xdr.onprogress = function () {
                    //  alert("XDR onprogress");
                    // alert("Error while getting data");
                };
                xdr.onload = function () {
                    var data = xdr.responseText;
                    if (data == null || data == '') {
                        // alert("Error while getting data");
                    } else {
                        /*eslint no-undef: 2*/
                        var datajson = JSON.parse(data);
                        if (maxRetries && datajson.Response === "[]" && maxRetries > 0) {
                            maxRetries = maxRetries--;
                            var getData = getDataIE8.bind(this, varUrl, varData, onComplete, maxRetries);
                            setTimeout(getData, RetryInterval);
                        }
                        onComplete(datajson);;
                    }
                }
                xdr.timeout = 10000;
                xdr.open("POST", varUrl);
                xdr.send(JSON.stringify(varData));
            }
        }
    }


    // Get Active messages
    var getActiveIM = function (token, serviceBase, isAnnoncement) {
        var myObject =
        {
            RequestToken: token,
            Mode: RequestIntervalMode,
            CurrentRowVersion: CurrentRowVersion
        };

        var json = _JSON2.stringify(myObject);
        var method = "GetActiveIM";
        getDataCORS(serviceBase, method, json, function () {
            if (isAnnoncement == "true")
                onGetActiveIMAnnoncementComplete.apply(self, arguments);
            else
                onGetActiveIMComplete.apply(self, arguments);
        });
    };

    var onGetActiveIMComplete = function (responseText) {

        Req = removeByValue(responseText, 'MessageType', '14');

        if (Req != null && Req != '') {
            ItemsCount = Req.length;
            Current = 0;

            if (Interval != 0) {
                clearInterval(Interval);
                Interval = 0;
            }

            handleActiveIM();
        } else {
            if (Interval == 0) {
                proceedNextMessage();
            }
        }
    };

    var onGetActiveIMAnnoncementComplete = function (responseText) {

        Req = removeByValue(responseText, 'MessageType', '17');
        Req = removeByValue(Req, 'MessageType', '19');
        Req = removeByValue(Req, 'MessageType', '21');
        Req = removeByValue(Req, 'MessageType', '31');
        Req = removeByValue(Req, 'MessageType', '32');
        Req = removeByValue(Req, 'MessageType', '17');

        if (Req != null && Req != '') {
            ItemsCount = Req.length;
            Current = 0;

            if (Req[Current].ErrorCode == 1) {
                if (ItemsCount > 0) {
                    if (systemInfo.clientApplicationParams[eClientParams.Device] === "FullSite") {
                        require(["StateObject!IM"], function (StateObject) {
                            StateObject.update('message', 'new');

                            $(document).on('click', PopupCssClass.EnvelopePopupClass, function () {
                                showIM(Req[Current]);
                                StateObject.update('message', 'no-new');
                            });
                        });
                    }
                    else {
                        $(PopupCssClass.EnvelopePopupClassMobile).addClass('new');

                        $(document).on('click', PopupCssClass.EnvelopePopupClassMobile, function () {
                            showIM(Req[Current]);
                            $(PopupCssClass.EnvelopePopupClassMobile).removeClass('new');
                            $(PopupCssClass.EnvelopePopupClassMobile).addClass('no-new');
                        });
                    }
                }
                RequestIntervalMode = 1;
            }

        }
    };

    var handleActiveIM = function () {
        if (Req[Current].ErrorCode == 1) { // ErrorCode == 1 customer exist
            // Smart banner
            if (Req[Current].MessageType == 17 && Req[Current].State == 0 && Req[Current].CurrentRowVersion != null) {
                CurrentRowVersion = Req[Current].CurrentRowVersion;
                currentActiveProposition = Req[Current];
                IMContainer.currentActiveProposition = Req[Current];
            }

            if (Req[Current].State != 0 || (Req[Current].MessageType == 31 || Req[Current].MessageType == 32))
                showIM(Req[Current]);
            else
                proceedNextMessage();

            RequestIntervalMode = 1;
        } else { // ErrorCode == 0 customer not exist
            if (CurrentRetry + 1 < MaxRetries) {
                setTimeout(function () { getActiveIM(Token, ServiceBase, IsAnnoncement); }, RetryInterval);
                ++CurrentRetry;
            }
        }
    };

    // Show the message
    var showIM = function (Request) {

        if (Request != null) {
            var myObject =
            {
                RequestToken: Token,
                CustomerMessageID: Request.CustomerMessageID,
                LanguageID: LanguageId,
                IMMetaData: Request
            };
            var json = _JSON2.stringify(myObject);
            var method = "ShowIM";
            Req[Current] = Request;
            getDataCORS(ServiceBase, method, json, onShowIMComplete);
        }
    };

    var onShowIMComplete = function (responseText) {
        if (responseText != null && responseText != '' && Req[Current]) {
            $.publish(Events.onCompleteShowIM, [responseText, Req[Current].CustomerMessageID, responseText.Content, PopupCssClass, Current, ItemsCount, { req: Req }]);
        }
    };

    // Report action to service
    var ReportIMAction = function (args) {

        if (Req != null) {
            var myObject =
            {
                RequestToken: Token,
                CustomerMessageID: args[0],
                ActionTypeID: args[1]
            };
            var json = _JSON2.stringify(myObject);
            var method = "ReportIMAction";
            getDataCORS(ServiceBase, method, json, function () { onReportIMActionComplete.apply(self, arguments); });
        }
    };

    var onReportIMActionComplete = function (responseText) {
        if (responseText != null && responseText != '') {

        }
    };

    var onReportIMAction_Event = function () {
        $.subscribe(Events.onReportIMAction, function () { ReportIMAction(arguments); });
    };


    // Report status to service
    var ReportIMStatus = function (args) {

        if (Req != null) {
            var myObject =
            {
                RequestToken: Token,
                CustomerMessageID: args[0],
                StatusID: args[1]
            };
            var json = _JSON2.stringify(myObject);
            var method = "ReportIMStatus";
            getDataCORS(ServiceBase, method, json, function () { onReportIMStatusComplete.apply(self, arguments); });
        }
    };

    var onReportIMStatusComplete = function (responseText) {
        if (responseText != null && responseText != '') {

        }
    };

    var onReportIMStatus_Event = function () {
        $.subscribe(Events.onReportIMStatus, function () { ReportIMStatus(arguments); });
    };



    var onErrorIM_Event = function (callback) {
        if (callback && typeof (callback) === "function") {
            $.subscribe(Events.onErrorIM, callback);
        }
    };

    var onCompleteGetActiveIM_Event = function (callback) {
        if (callback && typeof (callback) === "function") {
            //$.subscribe(Events.onCompleteGetActiveIM, callback);
        }
    };

    var onCompleteShowIM_Event = function (callback) {
        if (callback && typeof (callback) === "function") {
            $.subscribe(Events.onCompleteShowIM, callback);
        }
    };

    // Returns the version of Internet Explorer or -1
    var getInternetExplorerVersion = function ()
    // Returns the version of Internet Explorer or -1
    {
        var rv = -1; // Return value non-explorer.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    return {
        init: init,
        onErrorIM_Event: onErrorIM_Event,
        onCompleteGetActiveIM_Event: onCompleteGetActiveIM_Event,
        onCompleteShowIM_Event: onCompleteShowIM_Event,
        PopupCssClass: PopupCssClass,
        Current: Current,
        ItemsCount: ItemsCount,
        Event_onCompleteShowIM: Events.onCompleteShowIM,
        Events_onPopupClose_Event: Events.onPopupClose_Event,
        showIM: showIM,
        Events_onReportIMAction_Event: Events.onReportIMAction,
        Events_onReportIMStatus_Event: Events.onReportIMStatus,
        onReportIMAction_Event: onReportIMAction_Event,
        onReportIMStatus_Event: onReportIMStatus_Event,
        proceedNextMessage: proceedNextMessage,
        IMclearInterval: IMclearInterval,
        Interval: Interval,
        getTokenIM: getTokenIM,
        Events_onSmartBanner_Event: Events.onSmartBanner,
        IsAnnoncement: IsAnnoncement,
        CurrentActiveProposition: function () { return IMContainer.currentActiveProposition; }
    };
};


var IMlayoutService = function () {
    var imDataService;
    var CustomerCustomerMessageID = 0;

    var init = function (im) { imDataService = im; };

    var IMUIActionType = {
        Deposit: 'deposit',
        Notice: 'notice',
        Accept: 'accept',
        WalkThroughDeal: 'walkthroughdeal',
        PrivacyPolicy: 'privacypolicy',
        imClosedDeals: 'imClosedDeals',
        imOpenDeals: 'imOpenDeals',
        imNewDeal: 'imNewDeal'
    };

    var IMUIStatusType = {
        Pending: 'pending',
        Displayed: 'displayed',
        Dismissed: 'dismissed',
        Expired: 'expired'
    };

    var onCompleteShowIM_Subscribe = function () {
        $.subscribe(imDataService.Event_onCompleteShowIM, function () {
            ShowIMComplete(arguments);
        });
    };

    var onPopupClose_Subscribe = function (callback) {
        if (callback && typeof (callback) === "function") {
            $.subscribe(imDataService.Events_onPopupClose_Event, callback);
        }

        $(document).on('click', ("." + imDataService.PopupCssClass.CloseClass), function (e) {
            e.stopPropagation(); //This stops all propagation of the event in the bubbling phase
            e.preventDefault();
            IMPopupClose();
        });
        $(document).on('click', ("#" + imDataService.PopupCssClass.CloseClass), function (e) {
            e.stopPropagation(); //This stops all propagation of the event in the bubbling phase
            e.preventDefault();
            IMPopupClose();
        });
    };

    var onSmartBanner_Subscribe = function (callback) {
        if (callback && typeof (callback) === "function") {
            $.subscribe(imDataService.Events_onSmartBanner_Event, callback);
        }
    };


    // Report action to service
    var onIMUIAction_Subscribe = function (/* String */IMUIAction, /* Function */callback) {
        if (callback && typeof (callback) === "function") {
            $(document).on('click', "#" + (imDataService.PopupCssClass.PopupClass + " ." + IMUIAction), function () {
                IMUIActionClick(IMUIAction);
                IMPopupClose();
            });

            $.subscribe(IMUIAction, callback);
        }
    };

    var IMUIActionClick = function (IMUIAction) {

        var actionTypeId;
        switch (IMUIAction.toLowerCase()) {
            case IMUIActionType.Deposit:
                actionTypeId = 2;
                break;
            case IMUIActionType.Notice:
                actionTypeId = 3;
                break;
            case IMUIActionType.Accept:
                actionTypeId = 5;
                break;
            case IMUIActionType.WalkThroughDeal:
                actionTypeId = 6;
                break;
            case IMUIActionType.PrivacyPolicy:
                actionTypeId = 7;
                break;
            case IMUIActionType.imClosedDeals:
                actionTypeId = 8;
                break;
            case IMUIActionType.imOpenDeals:
                actionTypeId = 9;
                break;
            case IMUIActionType.imNewDeal:
                actionTypeId = 10;
                break;
            default:
                actionTypeId = 2;
        }

        if (CustomerCustomerMessageID != null && CustomerCustomerMessageID != 0) {
            $.publish(imDataService.Events_onReportIMAction_Event, [CustomerCustomerMessageID, actionTypeId]);
        }

        $.publish(IMUIAction, [IMUIAction]);
    };


    // Report status to service
    var onIMUIStatus_Subscribe = function (/* String */IMUIStatus, /* Function */callback) {
        $(document).on('click', ("#" + imDataService.PopupCssClass.PopupClass + " ." + IMUIStatus), function () {
            IMUIStatusClick(IMUIStatus);
            $(".notice-box").hide();
        });

        $.subscribe(IMUIStatus, callback);
    };

    var IMUIStatusClick = function (IMUIStatus) {

        var statusTypeId;
        switch (IMUIStatus.toLowerCase()) {
            case IMUIStatusType.Pending:
                statusTypeId = 0;
                break;
            case IMUIStatusType.Displayed:
                statusTypeId = 1;
                break;
            case IMUIStatusType.Dismissed:
                statusTypeId = 2;
                break;
            case IMUIStatusType.Expired:
                statusTypeId = 3;
                break;
            default:
                statusTypeId = 1;
        }

        if (CustomerCustomerMessageID != null && CustomerCustomerMessageID != 0) {
            $.publish(imDataService.Events_onReportIMStatus_Event, [CustomerCustomerMessageID, statusTypeId]);
        }
        $.publish(IMUIStatus, [IMUIStatus]);
    };


    var ShowIMComplete = function (responseText) {
        CustomerCustomerMessageID = 0;
        if (responseText != null && responseText != '') {
            var current = responseText[4];
            var itemsCount = responseText[5];

            showWin(responseText[2], responseText[3], responseText[6].req[current]);

            CustomerCustomerMessageID = responseText[6].req[current].CustomerMessageID;

            if (current < itemsCount) {
                ++current;
            } else {

            }
        }
    };

    var IMPopupClose = function (responseText) {
        $.publish(imDataService.Events_onPopupClose_Event, responseText, true);
        $("." + imDataService.PopupCssClass.PopupClass).hide();
        $("#" + imDataService.PopupCssClass.OverlayClass).hide();
        require(["StateObject!IM"], function (StateObject) {
            StateObject.update('IMPopUpVisible', false);
        });
        imDataService.proceedNextMessage();
    };

    var showWin = function (content, popupClass, req) {
        var popup = $("." + popupClass.PopupClass);
        if (content != null && content != '') {

            var cssLink = $(content).filter("link").outerHTML();
            if (cssLink != null && cssLink != '') {
                var css = $('link[href*="' + encodeURI(cssLink) + '"]').attr('id', 'im_css');
                if ($("#im_css").length == 0) {
                    $("head").append(css);
                }
                else {
                    $('#im_css').remove();
                    $("head").append(css);
                }
            }

            if (req.MessageType == 31 || req.MessageType == 32) {
                var smartBannerClass = '';
                if (req.MessageType == 31) {
                    smartBannerClass = popupClass.SmartBannerWideClass;
                }
                else if (req.MessageType == 32) {
                    smartBannerClass = popupClass.SmartBannerSmallClass;
                }

                if (imDataService.IsAnnoncement == false) {
                    var viewOfferCallback = function () { imDataService.showIM(imDataService.CurrentActiveProposition()); };
                    var dateObj = new Date(parseInt(req.ExpirationDate.replace('/Date(', '')));
                    $.publish(imDataService.Events_onSmartBanner_Event, [dateObj, req.State, smartBannerClass, req.ContentKey, content, viewOfferCallback]);
                }
                imDataService.proceedNextMessage();
            } else {
                popup.hide();
                $("#" + popupClass.OverlayClass).hide();
                popup.html(content);

                require(["StateObject!IM"], function (StateObject) {
                    StateObject.update('IMPopUpVisible', { MessageType: req.MessageType });
                });

                setTimeout(function () {
                    popup.show();
                    $("#" + popupClass.OverlayClass).fadeIn(500);
                }, 500);
            }
            imDataService.IMclearInterval(imDataService.Interval);
        } else {
            imDataService.proceedNextMessage();
        }
    };

    return {
        init: init,
        showWin: showWin,
        onCompleteShowIM_Subscribe: onCompleteShowIM_Subscribe,
        onPopupClose_Subscribe: onPopupClose_Subscribe,
        onIMUIAction_Subscribe: onIMUIAction_Subscribe,
        onIMUIStatus_Subscribe: onIMUIStatus_Subscribe,
        IMUIActionType: IMUIActionType,
        IMUIStatusType: IMUIStatusType,
        onSmartBanner_Subscribe: onSmartBanner_Subscribe
    };

};



8
;
(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("adjustUiPerDevice", [], factory);
    } else {
        root.adjustUiPerDevice = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    function adjustUiPerDevice(element) {

        if (element === null)
            return;
        if (element == true) {
            adjustUiPerDeviceOnFocus();
            return;
        }
        if (element == false) {
            adjustUiPerDeviceOnBlur();
            return;
        }
        element.onfocus = adjustUiPerDeviceOnFocus;
        element.onblur = adjustUiPerDeviceOnBlur;
    }

    function adjustUiPerDeviceOnFocus() {
        var i;
        var matches = document.querySelectorAll('[data-ios]');
        for (i = 0; i < matches.length; i++) {
            var att = matches[i].getAttribute('data-ios');
            if (att == 'adjustTop') {
                matches[i].style.top = 0;
                matches[i].style.position = 'absolute';
            } else if (att == 'adjustBottom') {
                matches[i].style.position = 'relative';
                matches[i].style.display = "none";
            }
        }
    }

    function adjustUiPerDeviceOnBlur() {
        var i;
        var matches = document.querySelectorAll('[data-ios]');
        for (i = 0; i < matches.length; i++) {
            var att = matches[i].getAttribute('data-ios');
            if (att == 'adjustTop') {
                matches[i].style.top = 0;
                matches[i].style.position = 'fixed';
            } else if (att == 'adjustBottom') {
                matches[i].style.position = 'fixed';
                matches[i].style.display = "";
            }
        }
    }

    return adjustUiPerDevice;
}));
//# sourceMappingURL=mobilelogin.js.map