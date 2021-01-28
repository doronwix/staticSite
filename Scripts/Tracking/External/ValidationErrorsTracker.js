var ValidationErrorsTracker = function () {
    var errorEventName = null;
    
    var formSelectors = {
            registrationForm: '#RegistrationForm',
            loginForm: '#LoginForm',
            forgotPasswordRequestForm: '#ForgotPasswordRequestForm',
            forgotPasswordResetForm: '#ForgotPasswordResetForm'
        };
    
    var init = function() {
        window.externalEventsCallbacks.add(onExternalEvent);
    };

    var onExternalEvent = function (eventName) {
        var $currentForm = null;

        switch (eventName) {
            case 'registration-view':
            {
                $currentForm = $(formSelectors.registrationForm);
                errorEventName = 'registration-error';
                break;
            }
            case 'login-view':
            {
                $currentForm = $(formSelectors.loginForm);
                errorEventName = 'login-error';
                break;
            }
            case 'request-new-password-view':
            {
                $currentForm = $(formSelectors.forgotPasswordRequestForm);
                errorEventName = 'request-new-password-error';
                break;
            }
            case 'forgot-password-view':
            {
                $currentForm = $(formSelectors.forgotPasswordResetForm);
                errorEventName = 'forgot-password-error';
                break;
            }
        }
        // if SC is Desktop than $currentForm do not exist
        if ($currentForm !== null && $currentForm.length > 0) {
            new JqueryValidateHooks($currentForm, onjQueryValidateError).init();
            checkForServerSideErrors($currentForm);
        }
    };

    var onjQueryValidateError = function(contentKey) {
        window.trackingEventsCollector.consumeEvent(errorEventName, { type: 'client', reason: contentKey });
    }
    
    var checkForServerSideErrors = function ($form) {
        findInlineServerSideErros($form);
        findValidationSummaryErros($form);
    };

    var findInlineServerSideErros = function ($form) {
		var errorInput = $form.find('input[name="validationErrorsContentKey"]');
    	if (errorInput.length > 0) {
    		var reason = errorInput.val();

			if (reason == '') {
				return;
			}

            window.trackingEventsCollector.consumeEvent(errorEventName, { type: 'server', reason: reason });
        }
    };
    
    var findValidationSummaryErros = function ($form) {
        $form.find('div.validation-summary-errors:visible').each(function (index, element) {
            window.trackingEventsCollector.consumeEvent(errorEventName, { type: 'server', errorMessage: $(element).text() });
        });
    };

    return {
        init: init
    };
};

