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