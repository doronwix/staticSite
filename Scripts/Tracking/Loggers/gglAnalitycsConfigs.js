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
        'login-view': 'Login',
        'switch-tab': 'Market Watch',
        'account-summary-advanced': 'Account Summary',
        'account-summary-interaction': 'Account Summary',
        'account-summary-simple': 'Account Summary',
        'cancel-limit': 'Limits',
        'change-currency': 'General',
        'change-language': 'General',
        'close-deal-success': 'Deal',
        'deal-slip-dragged': 'Deal',
        'deal-slip-error': 'Deal',
        'deal-slip-interaction': 'Deal',
        'deal-slip-submit': 'Deal',
        'deal-slip-success': 'Deal',
        'deal-slip-view': 'Deal',
        'deposit-error': 'Deposit',
        'deposit-interaction': 'Deposit',
        'deposit-submit': 'Deposit',
        'deposit-success': 'Depost',
        'deposit-view': 'Deposit',
        'forgot-password-error': 'Password',
        'forgot-password-interaction': 'Password',
        'forgot-password-submit': 'Password',
        'forgot-password-success': 'Password',
        'forgot-password-view': 'Password',
        'help-click': 'Help',
        'hide-help-center': 'Help',
        'information-maximize': 'Market Watch',
        'information-minimize': 'Market Watch',
        'instrument-advanced': 'Market Watch',
        'instrument-simple': 'Market Watch',
        'interaction': 'General',
        'login-error': 'Login',
        'login-interaction': 'Login',
        'login-submit': 'Login',
        'login-success': 'Login',
        'net-exposure-one-currency': 'Account Summary',
        'net-exposure-original-currency': 'Account Summary',
        'new-limit-dragged': 'Limits',
        'new-limit-error': 'Limits',
        'new-limit-submit': 'Limits',
        'new-limit-success': 'Limits',
        'new-limit-view': 'Limits',
        'registration-error': 'Registration',
        'registration-interaction': 'Registration',
        'registration-submit': 'Registration',
        'registration-success': 'Registration',
        'registration-view': 'Registration',
        'request-new-password-error': 'Password',
        'request-new-password-interaction': 'Password',
        'request-new-password-submit': 'Password',
        'request-new-password-view': 'Password',
        'show-help-center': 'Help',
        'sign-out': 'General',
        'update-limit': 'Limits',
        'walkthrough-ended': 'Walkthrough',
        'walkthrough-show-step': 'Walkthrough',
        'walkthrough-started': 'Walkthrough',
        'withdrawal-cancel': 'withdrawal',
        'withdrawal-interaction': 'withdrawal',
        'withdrawal-print': 'withdrawal',
        'withdrawal-submit': 'withdrawal',
        'withdrawal-success': 'withdrawal',
        'withdrawal-view': 'withdrawal',
        'account-type-view': 'Registration',
        'withdrawal-error': 'withdrawal',
        'demo-click': 'Registration',
        'real-click': 'Registration',
        'agreement-view': 'General',
        'request-new-password-success': 'Password',
        'message-clicked': 'Messages',
        'message-view': 'Messages',
        'instrument-show-more': 'Instrument',
        'instrument-show-less': 'Instrument',
        'filter-apply': 'General',
        'SmartBannerDeposit': 'Messages',
        'SmartBannerViewOfferButtonCallback': 'Messages'
    };
    var viewNames = {
        '1': 'Main',
        '2': 'Open Deals',
        '3': 'Limits',
        '4': 'Closed Deals',
        '5': 'Account Statement',
        '6': 'Deposit',
        '7': 'Withdrawal',
        '8': 'Activity Log',
        '9': 'Personal Details',
        '10': 'Financial Details',
        '11': 'Change Password',
        '12': 'View and Print Withdrawal',
        '13': 'Transaction Report',
        '14': 'Upload Documents',
        '15': 'Trading Signals',
        '16': 'Third Party',
        '17': 'Chart Analysis',
        '18': 'Binary Options',
        '19': 'Tutorials',
        '20': 'Education',
        '21': 'Charts',
        '22': 'CDD Financial Details'
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