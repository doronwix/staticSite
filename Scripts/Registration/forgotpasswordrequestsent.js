$(document).ready(function () {
    if (document.referrer.toLowerCase().indexOf('forgotpasswordrequest') > -1) {
        window.externalEventsCallbacks.fire('request-new-password-success');
    }
});