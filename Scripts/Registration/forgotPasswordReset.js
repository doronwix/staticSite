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