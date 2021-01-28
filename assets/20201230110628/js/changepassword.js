/*!
 Version = 20201230110628 2021-01-27 11:45:06 
*/
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
(function (root, factory) {
	"use strict";
	if (typeof define === "function" && define.amd) {
		define("registration/ChangePasswordModule", [
			"jquery",
			"Global/RevealPassword",
			"Registration/Common/CustomerValidators",
			"dataaccess/dalCommon",
			"devicehelpers/adjustUiPerDevice",
			"global/UrlResolver",
			"initdatamanagers/Customer",
		], factory);
	} else {
		root.ChangePassword = factory(
			root.$,
			root.RevealPassword,
			root.CustomerValidators,
			null,
			root.adjustUiPerDevice,
			root.UrlResolver,
			root.$customer
		);
	}
})(typeof self !== "undefined" ? self : this, function (
	$,
	RevealPassword,
	CustomerValidators,
	dalCommon,
	adjustUiPerDevice,
	urlResolver,
	customer
) {
	var eLoginLogoutReasonChangePassword = {
		changePassword_NoToken: 7770108,
	};
	var resultTypes = {
		None: 0,
		Success: 1,
		ChangeSuccess: 2,
		ResetSuccess: 3,
		OldPasswordDoesNotMatch: 4,
		NewPasswordsDoNotMatch: 5,
		InvalidNewPassword: 6,
		PreviousPasswordRecurrence: 7,
		InternalError: 8,
		UserLockedOut: 9,
		UserNotFound: 10,
		MinDaysPassword: 11,
		TokenNotValid: 12,
		WeakPassword: 13,
	};

	var customerValidators = new CustomerValidators();

	function init(avoidDoubleHandlers) {
		addCustomValidators();

		decodeValidation();

		if (avoidDoubleHandlers) {
			unsetDomEvents();
		}

		unsetDomEvents();
		setDomEvents();
		setDomElements();
	}

	function addCustomValidators() {
		customerValidators.addValidationBlackList();
		customerValidators.addValidationCustomerFullName();

		jQuery.validator.unobtrusive.parse($("#ChangePasswordForm"));
	}

	function decodeValidation() {
		var validation = $(".validation-summary-errors li");
		var text = validation.text();
		validation.html(text);
	}

	function setDomEvents() {
		$("#oldPassword").on("keyup", function (e) {
			if (e.target.value.length > 0) {
				$("#oldPasswordIcon").addClass("ico-pass-blue");
			} else {
				$("#oldPasswordIcon").removeClass("ico-wb-reveal-off");
				$("#oldPasswordIcon").removeClass("ico-pass-blue");
				$("#oldPasswordIcon").addClass("ico-wb-reveal");
				e.target.type = "password";
			}
		});
		$("#oldPasswordIcon").on("click", function (e) {
			var pass = document.getElementById("oldPassword");
			if (pass.value.length > 0) {
				if (pass.type == "password") {
					pass.type = "text";
					e.target.classList.add("ico-wb-reveal-off");
					e.target.classList.remove("ico-wb-reveal");
				} else {
					pass.type = "password";
					e.target.classList.remove("ico-wb-reveal-off");
					e.target.classList.add("ico-wb-reveal");
				}
			}
		});
		$("#newPassword").on("keyup", function (e) {
			if (e.target.value.length > 0) {
				$("#newPasswordIcon").addClass("ico-pass-blue");
			} else {
				$("#newPasswordIcon").removeClass("ico-wb-reveal-off");
				$("#newPasswordIcon").removeClass("ico-pass-blue");
				$("#newPasswordIcon").addClass("ico-wb-reveal");
				e.target.type = "password";
			}
		});
		$("#newPasswordIcon").on("click", function (e) {
			var pass = document.getElementById("newPassword");
			if (pass.value.length > 0) {
				if (pass.type == "password") {
					pass.type = "text";
					e.target.classList.add("ico-wb-reveal-off");
					e.target.classList.remove("ico-wb-reveal");
				} else {
					pass.type = "password";
					e.target.classList.remove("ico-wb-reveal-off");
					e.target.classList.add("ico-wb-reveal");
				}
			}
		});
		$("#confirmPassword").on("keyup", function (e) {
			if (e.target.value.length > 0) {
				$("#confirmPasswordIcon").addClass("ico-pass-blue");
			} else {
				$("#confirmPasswordIcon").removeClass("ico-wb-reveal-off");
				$("#confirmPasswordIcon").removeClass("ico-pass-blue");
				$("#confirmPasswordIcon").addClass("ico-wb-reveal");
				e.target.type = "password";
			}
		});
		$("#confirmPasswordIcon").on("click", function (e) {
			var pass = document.getElementById("confirmPassword");
			if (pass.value.length > 0) {
				if (pass.type == "password") {
					pass.type = "text";
					e.target.classList.add("ico-wb-reveal-off");
					e.target.classList.remove("ico-wb-reveal");
				} else {
					pass.type = "password";
					e.target.classList.remove("ico-wb-reveal-off");
					e.target.classList.add("ico-wb-reveal");
				}
			}
		});

		$("#ChangePasswordForm").on("change", "input", function (e) {
			var validator = $("#ChangePasswordForm").validate(),
				element = e.srcElement || e.target;
			validator.element(element);
			highlightInvalids();
		});

		$("#ChangePasswordForm").on("click.ChangePassword", "#changePasswordbtnOk", {}, function (event) {
			event.preventDefault();
			resetView();
			postChangePassword();
		});

		$("#ChangePasswordForm").on("click.Postpone", "#changePasswordBtnPostpone", {}, function () {
			$('#ChangePasswordForm').attr('action', 'RemindMeLater');
			$("#ChangePasswordForm").validate().settings.ignore = "*";
			$('#ChangePasswordForm').submit();
		});

		if (adjustUiPerDevice) {
			adjustUiPerDevice(document.getElementById("oldPassword"));
			adjustUiPerDevice(document.getElementById("newPassword"));
			adjustUiPerDevice(document.getElementById("confirmPassword"));
		}
	}

	function resetView() {
		//Old Password
		var oldPass = document.getElementById("oldPassword");
		oldPass.type = "password";
		$("#oldPasswordIcon").removeClass("ico-wb-reveal-off");
		$("#oldPasswordIcon").addClass("ico-wb-reveal");
		if (oldPass.value.length == 0) {
			$("#oldPasswordIcon").removeClass("ico-pass-blue");
		}
		//New Password
		var newPass = document.getElementById("newPassword");
		newPass.type = "password";
		$("#newPasswordIcon").removeClass("ico-wb-reveal-off");
		$("#newPasswordIcon").addClass("ico-wb-reveal");
		if (newPass.value.length == 0) {
			$("#newPasswordIcon").removeClass("ico-pass-blue");
		}
		//Confim Password
		var confirmPass = document.getElementById("confirmPassword");
		confirmPass.type = "password";
		$("#confirmPasswordIcon").removeClass("ico-wb-reveal-off");
		$("#confirmPasswordIcon").addClass("ico-wb-reveal");
		if (confirmPass.value.length == 0) {
			$("#confirmPasswordIcon").removeClass("ico-pass-blue");
		}
	}

	function setDomElements() {
		$("#changePasswordTemplate").addClass(window.$viewModelsManager ? "internal" : "");
	}

	function unsetDomEvents() {
		$("#ChangePasswordForm").off(".ChangePassword");
	}
	function deleteFingerprint(FingerprintTools, LastLoginMethod) {
		FingerprintTools.DeleteToken();
		LastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);
	}
	function onSuccessfulPasswordChange(response) {
		if (window.Fingerprint && localStorage.getItem("fingerprintSupport")) {
			if (typeof define === "function" && define.amd) {
				require(["FingerprintTools", "LastLoginMethod"], deleteFingerprint);
			} else {
				deleteFingerprint(window.FingerprintTools, window.LastLoginMethod);
			}
		}

		if (window.$viewModelsManager) {
			customer.prop.showSuggestionChangePassword = false;
			AlertsManager.UpdateAlert(
				AlertTypes.ServerResponseAlert,
				Dictionary.GetItem("GenericAlert", "dialogsTitles", " "),
				Dictionary.GetItem("PasswordSuccess"),
				"",
				{ redirectToView: customer.prop.mainPage }
			);
			AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
		} else {
			if (!response.returnUrl || response.returnUrl === "") {
				window.location.href =
					window.location.pathname.substring(0, window.location.pathname.indexOf("/", 1)) +
					response.resultTranslation.replace("~", "");
			} else {
				window.location.href =
					window.location.pathname.substring(0, window.location.pathname.indexOf("/", 1)) +
					response.returnUrl.replace("~", "");
			}
		}
	}

	function parseServerValidationErrors(response) {
		switch (response.result) {
			case resultTypes.OldPasswordDoesNotMatch:
				$("#ChangePasswordForm")
					.validate()
					.showErrors({ OldPassword: response.resultTranslation.join("<br />") });
				break;
			case resultTypes.PreviousPasswordRecurrence:
			case resultTypes.WeakPassword:
				$("#ChangePasswordForm")
					.validate()
					.showErrors({ NewPassword: response.resultTranslation.join("<br />") });
				break;
			default:
				$("#divChangePasswordErrors")
					.removeClass()
					.addClass("field-validation-error error-from-server")
					.html(response.resultTranslation.join("<br />"));
		}
	}

	function postChangePassword() {
		var form = $("#ChangePasswordForm");

		if (window.$viewModelsManager) {
			form.find('input[name="IsExternalPage"]').val("True");
		}

		var divErrors = $("#divChangePasswordErrors");
		divErrors.html("").removeClass().addClass("field-validation-valid");

		if (form.valid()) {
			$.post(
				urlResolver.getUrlWithRndKeyValue("/webpl3/Account/SaveChangedPassword"),
				form.serialize(),
				function (response) {
					response = JSON.parse(response);
					if (response.result === resultTypes.Success) {
						onSuccessfulPasswordChange(response);
					} else {
						if (response.result === resultTypes.TokenNotValid) {
							if (dalCommon) dalCommon.Logout(eLoginLogoutReasonChangePassword.changePassword_NoToken);
							else
								window.location.assign(
									"logout?reason=" + eLoginLogoutReasonChangePassword.changePassword_NoToken
								);
						} else {
							parseServerValidationErrors(response);
							highlightInvalids();
						}
					}
				}
			);
		} else {
			highlightInvalids();
		}
	}

	function highlightInvalids() {
		var form = $("#ChangePasswordForm"),
			validator = form.validate();

		$(".input-holder").removeClass("error");

		$.each(validator.errorList, function (index, error) {
			$(error.element).parent().addClass("error");
		});
	}

	return {
		init: init,
		unsetDomEvents: unsetDomEvents,
	};
});

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
//# sourceMappingURL=changepassword.js.map