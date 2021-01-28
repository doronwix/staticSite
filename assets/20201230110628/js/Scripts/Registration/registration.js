var Registration = {
	submitButtonSelector: '#RegistrationForm #btnOk',
	init: function () {
		if (!CookieHandler.CookiesEnabled()) {
			popupManager.showCookiesDisabledPopUp();
		}

		var trackingParamsJson = $('#TrackingParams').val();
        var trackingParams = null;

		if (trackingParamsJson) {
		     trackingParams = JSON.parse(trackingParamsJson);
        }

        window.externalEventsCallbacks.fire('registration-view', trackingParams);

		this.setDomInitValues();
		this.setDomEvents();
	},
	onLanguageChange: function () {
		var langId = $("option:selected", $("#ddlLang")).attr("value");
		var languageName = $("option:selected", $("#ddlLang")).attr("name");

		CookieHandler.CreateCookie("LID", langId, (new Date()).AddMonths(6));
		CookieHandler.CreateCookie("Language", languageName, (new Date()).AddMonths(6));

		window.externalEventsCallbacks.fire('change-language');

		$('#ChangeLanguage').submit();
	},
	setDomInitValues: function () {
		if (!Model.AreAgreementsAutoChecked) {
			this.disableSubmitButton();
			if (this.isAllAgreemnetsSelected()) {
				this.enableSubmitButton();
			}
		}
	},
	enableSubmitButton: function () {
		var submitButton = $(this.submitButtonSelector);
		submitButton.removeClass('disabled');
		submitButton.removeAttr('disabled');
	},
	disableSubmitButton: function () {
		var submitButton = $(this.submitButtonSelector);
		submitButton.addClass('disabled');
		submitButton.attr('disabled', 'disabled');
	},
	isAllAgreemnetsSelected: function () {
		var result = true;

		$('input:checkbox.captcha_agreement').each(function () {
			return (result = $(this).is(':checked'));
		});

		return result;
	},
	checkAllagreements: function () {
		$('input:checkbox.captcha_agreement').attr('checked', true);
	},
	updateRequiredAgreements: function () {
		if (!Model.AreAgreementsAutoChecked) {
			if (this.isAllAgreemnetsSelected()) {
				this.enableSubmitButton();
			} else {
				this.disableSubmitButton();
			}
		}
	},
	setDomEvents: function () {
		var self = this;

		$('#btnDecline').click(function () {
			$('#DeclineText').show();

			return false;
		});

        $('#RegistrationForm').submit(function () {
            if (!$('#RegistrationForm').valid()) {
                self.enableSubmitButton();
            }
			window.externalEventsCallbacks.fire('registration-submit', { saRegistration: Model.SAProcess ? parseInt(Model.SAProcess) : 0 });

			if (Model.SkipCompleteScreen) {
                var sessionStorage = StorageFactory(StorageFactory.eStorageType.session);
				sessionStorage.setItem('registrationSubmitClicked', true);
			}

			if (Model.AreAgreementsAutoChecked) {
				self.checkAllagreements();
			}

			var isAgreed = $('input#isAgreed');

			if (isAgreed.length == 0) {
				isAgreed = $('<input>').attr({
					type: 'hidden',
					id: 'isAgreed',
					name: 'isAgreed'
				});

				isAgreed.appendTo('#RegistrationForm');
			}
			isAgreed.val(self.isAllAgreemnetsSelected());

			if (!Model.AreAgreementsAutoChecked && !self.isAllAgreemnetsSelected()) {
				return false;
			}
		});

		$('#btnOk').click(function (e) {
			if ($('#RegistrationForm #btnOk').attr('disabled') == 'disabled') {
				return false;
			}            
            self.disableSubmitButton();
			$('#RegistrationForm').submit();

			return false;
		});

		$('input:checkbox.captcha_agreement').change(function () {
			self.updateRequiredAgreements();
		});

		$('#imgRefresh').click(function () {
			$.ajax({
				async: false,
				url: Model.jsVirtualPath + "/CaptchaImage/Generate?session=false",
				type: "POST",
				success: function (data) {
					$('#captcha').replaceWith(data);
				}
			});
		});

		$(document).click(function () {
			window.externalEventsCallbacks.fire('registration-interaction');
		});

		$("#ddlLang").unbind('change').change(self.onLanguageChange);

		$('#hlChangeUserName').click(function () {
			$('.registration-form').slideDown('fast');
			$('#hlChangeUserName').off('click');
		});
	}
};

window.addEventListener('load',
	function () {
		Registration.init();
	}
);