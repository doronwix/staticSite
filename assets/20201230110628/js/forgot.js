/*!
 Version = 20201230110628 2021-01-27 11:45:06 
*/
function CustomerValidators() {
    var blacklist = [],
        validationMethods = {
            passwordnotinblacklist: 'passwordnotinblacklist',
            passwordnotcustomerfullname: 'passwordnotcustomerfullname'
        };

    function addValidationBlackList() {
        $.validator.unobtrusive.adapters.add(validationMethods.passwordnotinblacklist, ["param"],
            function (options) {
                options.rules[validationMethods.passwordnotinblacklist] = true;
                options.messages[validationMethods.passwordnotinblacklist] = options.message;
            }
        );

        $.validator.addMethod(validationMethods.passwordnotinblacklist,
            function (value) {
                if (!blacklist || !blacklist.length) {
                    return true;
                }
                return blacklist.indexOf(value) === -1;
            }
        );

        $.get(
            getBlackListUrl()
        ).then(function (response) {
            if (Array.isArray(response)) {
                blacklist = response;
            }
        })
        .done();
    }

    function getBlackListUrl() {
        var blacklistUrl = "";

        if (UrlResolver.getAssetsPath) {
            blacklistUrl = UrlResolver.combine(
                UrlResolver.getAssetsPath(),
                "Account",
                "PasswordsBlacklist.js"
            );
        } else {
            var version = UrlResolver.getVersion();

            if (version) {
                blacklistUrl = Model.CdnPath + Model.jsVirtualPath + '/assets/' + version + '/Account/PasswordsBlacklist.js';
            } else {
                blacklistUrl = Model.jsVirtualPath + '/Account/PasswordsBlacklist';
            }
        } 

        return blacklistUrl;
    }

    function addValidationCustomerFullName() {
        if (!window.$customer) {
            return;
        }

        customer = window.$customer;

        var customerData = {
            firstName: customer.prop.firstName,
            lastName: customer.prop.lastName,
            combinations: [
                customer.prop.firstName + customer.prop.lastName,
                customer.prop.firstName + " " + customer.prop.lastName,
                customer.prop.lastName + customer.prop.firstName,
                customer.prop.lastName + " " + customer.prop.firstName
            ]
        };

        $.validator.unobtrusive.adapters.add(validationMethods.passwordnotcustomerfullname, ["param"],
            function (options) {
                options.rules[validationMethods.passwordnotcustomerfullname] = true;
                options.messages[validationMethods.passwordnotcustomerfullname] = options.message;
            }
        );

        $.validator.addMethod(validationMethods.passwordnotcustomerfullname,
            function (value) {
                return (value !== customerData.firstName && value !== customerData.lastName && customerData.combinations.indexOf(value) === -1)
            }
        );
    }

    return {
        addValidationBlackList: addValidationBlackList,
        addValidationCustomerFullName: addValidationCustomerFullName
    };
}
;
function ForgotPasswordReset() {
    var revealNewPassword, revealConfirmPassword;

    function init() {
        addCustomValidators();

        revealNewPassword = new RevealPassword(),
            revealConfirmPassword = new RevealPassword();

        window.externalEventsCallbacks.fire('forgot-password-view');
        setDomEvents();

        if (!CookieHandler.CookiesEnabled()) {
            popupManager.showCookiesDisabledPopUp();
        }

        initializeObjectsForFullsite();
    }

    function addCustomValidators() { 
        var customValidator = new CustomerValidators();

        customValidator.addValidationBlackList();

        jQuery.validator.unobtrusive.parse($('#ForgotPasswordResetForm'));
    }

    function setDomEvents() {
        $(".password-input").on("keyup", function () {
            var $newPasswordError = $('.newPasswordError');

            if ($newPasswordError.is(':visible')) {
                $newPasswordError.hide();
            }
        });

        $(document).click(function () {
            window.externalEventsCallbacks.fire('forgot-password-interaction');
        });

        $('form#ForgotPasswordResetForm input[type="submit"]').click(function () {
            revealNewPassword.HidePasswordText();
            revealConfirmPassword.HidePasswordText();
            window.externalEventsCallbacks.fire('forgot-password-submit');

            var sessionStorage = StorageFactory(StorageFactory.eStorageType.session);
            sessionStorage.setItem('forgotPasswordResetSubmitClicked', true);
        });

        $('#imgRefresh').click(function () {
            $.ajax({
                async: false,
                url: Model.jsVirtualPath + "/CaptchaImage/Generate/",
                type: "POST",
                success: function (data) {
                    $('#captcha').replaceWith(data);
                }
            });
        });

        revealNewPassword.Init({ passwordInput: $('#newPassword'), icon: $('#newPasswordIcon'), form: $('#ForgotPasswordResetForm') });
        revealConfirmPassword.Init({ passwordInput: $('#pwdconfirm'), icon: $('#confirmPasswordIcon'), form: $('#ForgotPasswordResetForm') });
    }

    function initializeObjectsForFullsite() {
        if (typeof ShowPasswordCharacters !== 'undefined') {
            new ShowPasswordCharacters().init();
        }
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
var ShowPasswordCharacters = function () {
    var $passwordWrapper, $passwordInput, $passwordVisibleInput, $eyeLabel;

    var init = function () {
        $passwordWrapper = $('.pwd-wrapper');
        $passwordInput = $passwordWrapper.find('input[type="password"]');
        $passwordVisibleInput = $passwordWrapper.find('input[type="text"]');
        $eyeLabel = $passwordWrapper.find('span.showpwd label');

        $eyeLabel.mousedown(setInputTypeToText);
        $eyeLabel.mouseup(setInputTypeToPassword);
        $eyeLabel.mouseout(setInputTypeToPassword);
    }

    var setInputTypeToText = function () {
        window.additionalPropertiesCallbacks.fire('ViewedPassword');
        if ($passwordInput.val() === '') {
            return;
        }

        $passwordVisibleInput.val($passwordInput.val());

        togglePasswordVisibility();
    };

    var setInputTypeToPassword = function () {
        if ($passwordInput.is(':visible')) {
            return;
        }
        $passwordVisibleInput.val('');
        togglePasswordVisibility();
    };

    var togglePasswordVisibility = function () {
        $passwordVisibleInput.toggle();
        $passwordInput.toggle();
    };

    return {
        init: init
    };
}
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
//# sourceMappingURL=forgot.js.map