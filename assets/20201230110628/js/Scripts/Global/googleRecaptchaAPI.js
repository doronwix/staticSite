var googleRecaptchaLoadedCallbacks = $.Callbacks();

var onloadCallback = function () {
    grecaptcha.render('recaptcha', {
        'sitekey': Model.GoogleRecaptcha.GoogleRecaptchaPublicKey,
        'callback': function() {
            $('#captchasubmitted').val('True').valid();
        },
        'expired-callback': function () { $('#captchasubmitted').val('False'); }
    });

    googleRecaptchaLoadedCallbacks.fire();
};