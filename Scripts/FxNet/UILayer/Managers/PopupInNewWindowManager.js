/* global UrlResolver, environmentData */
var PopupInNewWindowManager = function () {
    var deposit3rdPartyWindowName = "_system";
    var deposit3rdPartyWindowHandle = null;

    function redirect(communicationManager) {
        var urlParams = "?actionUrl=" + encodeURIComponent(communicationManager.ActionUrl) +
            "&postDataValue=" + encodeURIComponent(JSON.stringify(communicationManager.PostDataArr)) +
            "&hash=" + communicationManager.Hash +
            "&accountNumber=" + communicationManager.AccountNumber;

        var url = UrlResolver.combine(
            UrlResolver.getApplicationRelativePath(),
            "/Payments/Deposit/RedirectToClearerPage",
            urlParams
        );

        window.open(url, deposit3rdPartyWindowName);
    }

    function paymentUrlResolver() {
        var url = UrlResolver.combine(
            UrlResolver.getApplicationRelativePath(),
            "/Payments/Deposit/Spinner"
        );

        if (environmentData.isDesktop) {
            url = location.protocol + '//' + location.hostname + url;
        }

        return url;
    }

    function openPopup() {
        deposit3rdPartyWindowHandle = window.open(paymentUrlResolver(), deposit3rdPartyWindowName, "resizable=1, height=850, width=800, scrollbars=yes");
    }

    function resize(width, height) {
        deposit3rdPartyWindowHandle.resizeTo(width, height);
    }

    function close() {
        if (deposit3rdPartyWindowHandle) {
            deposit3rdPartyWindowHandle.close();
            deposit3rdPartyWindowHandle = null;
        }
    }

    //when inside mobile applications openPopup will be handled inside redirect function.
    if (!systemInfo.isNative) {
        openPopup();
    }

    function isPopupOpen() {
        return deposit3rdPartyWindowHandle && !deposit3rdPartyWindowHandle.closed;
    }

    function onClose(callback) {
        if (deposit3rdPartyWindowHandle && !deposit3rdPartyWindowHandle.closed) {
            setTimeout(function () {
                onClose(callback);
            }, 1000);
        } else {
            callback();
        }
    }

    return {
        Navigate: redirect,
        Resize: resize,
        Close: close,
        IsPopupOpen: isPopupOpen,
        OnClose: onClose
    };
};