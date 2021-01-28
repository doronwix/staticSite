var Forgot = function () {
    var init = function () {
        window.externalEventsCallbacks.fire('request-new-password-view');
        if (window.adjustUiPerDevice) {
            adjustUiPerDevice(document.getElementById('txtUName'));
            adjustUiPerDevice(document.getElementById('txtAttempt'));
        }
        setDomEvents();
        if (!CookieHandler.CookiesEnabled()) {
            popupManager.showCookiesDisabledPopUp();
        }
    };

    var setDomEvents = function () {
        $(document).on('click', function () {
            window.externalEventsCallbacks.fire('request-new-password-interaction');
        });

        $('form').each(function () {
            $('input').on('keypress', function (e) {
                // Enter pressed?
                if (e.which == 10 || e.which == 13) {
                    this.form.submit();
                }
            });
        }),

         $('#btnSubmitRequest').on('click', function () {
            if ($('#btnSubmitRequest').attr('disabled') == 'disabled') {
                return false;
            }  

            if ($('#ForgotPasswordRequestForm').valid()) {
                $('#btnSubmitRequest').attr('disabled', 'disabled');
                $('#btnSubmitRequest').addClass('disabled');
            }

		    window.externalEventsCallbacks.fire('request-new-password-submit');
		    $('#ForgotPasswordRequestForm').trigger('submit');

		    return false;
		}),

		$('#imgRefresh').on('click', function () {
		    $.ajax({
		        async: false,
		        url: Model.jsVirtualPath + "/CaptchaImage/Generate/",
		        type: "POST",
		        success: function (data) {
		            $('#captcha').replaceWith(data);
		        }
		    });
		});
    };
    return {

        init: init
    };
};

$(document).ready(function () {
    var forgot = new Forgot();
    $('form').attr('action', window.location.href);
    forgot.init();
});