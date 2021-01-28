(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('tracking/loggers/gglanalitycsconfigs', [], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.gglAnalitycsConfigs = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    var eventSections = {
        'account-type-view': 'Registration',
        'registration-view': 'Registration',
        'demo-click': 'Registration',
        'real-click': 'Registration',
        'registration-interaction': 'Registration',
        'registration-submit': 'Registration',
        'registration-error': 'Registration',
        'registration-success': 'Registration',

        'login-view': 'Login',
        'login-success': 'Login',
        'login-interaction': 'Login',
        'login-error': 'Login',
        'login-submit': 'Login',

        'deal-slip-view': 'Deal',
        'deal-slip-interaction': 'Deal',
        'deal-slip-submit': 'Deal',
        'deal-slip-success': 'Deal',
        'deal-slip-error': 'Deal'
    };
    var viewNames = {
        '1': 'Main',
        '2': 'Open Deals',
        '3': 'Limits',
        '4': 'Closed Deals',
        '5': 'Account Statement',
        '15': 'Trading Signals',
        '12': 'View and Print Withdrawal',
        '51': 'Change Password',
        '28': 'Upload Documents',
        '30':'Trading Signals'
    };

    function getSection(eventName) {
        return eventSections[eventName] || 'None';
    }

    function getName(viewId) {
        return viewNames[viewId] || viewId;
    }

    return {
        GetSection: getSection,
        GetName: getName
    };
}));