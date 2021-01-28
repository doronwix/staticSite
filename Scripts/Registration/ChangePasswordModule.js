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
