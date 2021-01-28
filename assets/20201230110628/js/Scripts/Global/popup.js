var popupManager = (function createPopupManager($) {

    var overlay = document.querySelector('.log-opt-overlay');
    var popup = null;

    function showPopup() {
        if (popup) {
            overlay.classList.add('visible');
            popup.classList.add('visible');
            $(document).scrollTop(0);
        }
    }

    function hidePopup() {
        overlay.classList.remove('visible');
        if (popup)
            popup.classList.remove('visible');
    }

    function showCookiesDisabledPopUp() {
        document.querySelector('#fingerprint').classList.remove('visible');
        var ok = document.querySelector('#cookies_ok');
        ok.addEventListener('click', hidePopup, false);
        ok.classList.remove("gray");
        ok.classList.remove("left");
        var x = document.querySelector('#cookies_alert_x');
        if (x) {
            x.addEventListener('click', hidePopup, false);
        }       
        popup = document.querySelector('#cookies');
        showPopup();
    }

    function showSetupFingerprintPopup(title, message, closeLbl, continueLbl) {        
        document.querySelector('#cookies').classList.remove('visible');
        document.querySelector('#fingerprint_title').innerHTML = title;
        document.querySelector('#fingerprint_message').innerHTML = message;
        var continueButton = document.querySelector('#fingerprint_continue');
        continueButton.innerHTML = continueLbl;
        var closeButton = document.querySelector('#fingerprint_close');
        closeButton.innerHTML = closeLbl;
        closeButton.addEventListener('click', hidePopup, false);
        if (typeof continueLbl === "undefined" || continueLbl === null) {
            $(continueButton).hide();
            closeButton.classList.remove("gray");
            closeButton.classList.remove("left");
        }
        else {
            $(continueButton).show();
            closeButton.classList.add("gray");
            closeButton.classList.add("left");
            continueButton.addEventListener('click', function () {
                location.href = UrlResolver.getApplicationRelativePath() + "/account/redirect/loginoptions?option=fingerprint";
            }, { once: true });
        }
        popup = document.querySelector('#fingerprint');     
        showPopup();
    }

    return {
        showSetupFingerprintPopup: showSetupFingerprintPopup,
        showCookiesDisabledPopUp: showCookiesDisabledPopUp
    }
})(jQuery);
