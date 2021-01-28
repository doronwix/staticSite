(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/datalayer', [], factory);
    } else {
        root.dataLayer = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
    root = root || window;
    root.dataLayer = root.dataLayer || [];

    var _dataLayer = root.dataLayer,
        maxDataLayerLength = 350, //GTM has 300
        _isGTMActive;

    function isGTMEnabled() {
        if (typeof _isGTMActive !== 'boolean') {
            for (var idx = 0; idx < _dataLayer.length; idx++) {
                if (!_dataLayer[idx]) {
                    continue;
                }

                var event = _dataLayer[idx].event || '';

                if (0 === event.indexOf('gtm.')) {
                    _isGTMActive = true;
                    break;
                }
            }
        }

        _isGTMActive = _isGTMActive || false;

        return _isGTMActive;
    }

    function truncateDataLayer() {
        if (maxDataLayerLength > _dataLayer.length) {
            return;
        }

        //if GTM is loaded size is managed by him 
        if (isGTMEnabled()) {
            return;
        } else {
            for (; maxDataLayerLength < _dataLayer.length;)
                _dataLayer.shift();
        }
    }

    function _newPush() {
        var pushParams = [].slice.call(arguments, 0);

        var g = _dataLayer.originalPush.apply(_dataLayer, pushParams);

        //call subscribers
        _dataLayer.subscribers.forEach(function (f) {
            try {
                f.apply(this, pushParams);
            } catch (e) { }
        });

        truncateDataLayer();

        var h = ("boolean" !== typeof g) || g;
        return h;
    }

    _dataLayer.init = function () {

        _dataLayer.originalPush = _dataLayer.push;
        _dataLayer.push = _newPush;

        _dataLayer.subscribers = [];
        _dataLayer.subscribers.originalPush = _dataLayer.subscribers.push;

        _dataLayer.subscribers.push = function (s) {
            if (0 > _dataLayer.subscribers.indexOf(s)) {
                var pushParams = [].slice.call(arguments, 0);
                _dataLayer.subscribers.originalPush.apply(_dataLayer.subscribers, pushParams);
            }
        }
    }

    return _dataLayer;
}));