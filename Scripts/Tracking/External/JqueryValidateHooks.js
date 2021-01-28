var JqueryValidateHooks = function($form, onErrorOccurredCallback) {
    var keyUpEvent = false,
    checkFormEvent = false,
    focusOutEvent = false;
    
    var init = function () {
        var validator = $form.data('validator');

        hookToTrackErrorRegistration(validator);

        hookToTrackKeyUpEvent(validator);
        hookToTrackFocusOutEvent(validator);
        hookToTrackCheckFormEvent(validator);
    };

    var hookToTrackErrorRegistration = function (validator) {
        var originalMethod = validator.formatAndAdd;
        validator.formatAndAdd = function (element, rule) {
            originalMethod.apply(this, arguments);
            if (shouldRaiseTheEvent()) {
                onErrorOccurredCallback.call(null, getContentKeyValue(element, rule.method));
            }
            keyUpEvent = false;
        };
    };

    var hookToTrackKeyUpEvent = function (validator) {
        var originalMethod = validator.settings.onkeyup;
        validator.settings.onkeyup = function () {
            keyUpEvent = true;
            focusOutEvent = false;
            checkFormEvent = false;
            originalMethod.apply(this, arguments);
        };
    };

    var hookToTrackFocusOutEvent = function (validator) {
        var originalMethod = validator.settings.onfocusout;
        validator.settings.onfocusout = function () {
            focusOutEvent = true;
            keyUpEvent = false;
            originalMethod.apply(this, arguments);
        };
    };

    var hookToTrackCheckFormEvent = function (validator) {
        var originalMethod = validator.checkForm;
        validator.checkForm = function () {
            checkFormEvent = true;
            keyUpEvent = false;
            focusOutEvent = false;

            originalMethod.apply(this, arguments);
        };
    };

    var shouldRaiseTheEvent = function () {
        return !keyUpEvent && !(focusOutEvent && checkFormEvent);
    };

    var getContentKeyValue = function (element, rule) {
        var attributeName = 'val-' + rule.toLowerCase() + '-contentkey';

        return $(element).data(attributeName);
    };

    return {
        init: init
    };
};