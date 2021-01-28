(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/googleTagManager', ['tracking/loggers/datalayer'], factory);
    } else {
        root.googleTagManager = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {
    var googleTagManagerAccountId;

    function init(gAccId) {
        googleTagManagerAccountId = gAccId;
        doGoogleTagManager();
    }

    function startChat() {
        try {
            dataLayer.push({ "event": "start-chat" });
        } catch (ex) {
            ErrorManager.onError('startChat', 'Google Tag Manager has failed', eErrorSeverity.low);
        }
    }

    function configAttributes(oAttributes) {
        ko.postbox.publish(eFxNetEvents.GtmConfigurationSet, oAttributes);
    }

    function doGoogleTagManager() {

        var w = window;
        var d = document;
        var s = 'script';
        var l = 'dataLayer';
        var i = googleTagManagerAccountId;

        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);

    }

    window.googleTagManager = {
        Init: init,
        StartChat: startChat,
        ConfigAttributes: configAttributes
    }

    return window.googleTagManager;
}));