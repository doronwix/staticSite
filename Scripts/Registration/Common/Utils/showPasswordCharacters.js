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