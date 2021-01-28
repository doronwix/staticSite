var AdditionalProperties = function () {
    var events = { ViewedPassword: 'ViewedPassword', ChangedCountry: 'ChangedCountry' },
        data = { ViewedPassword: false, ViewedPrivacy: false, ViewedAgreement: false, ChangedCountry: false };

    var init = function () {
        window.additionalPropertiesCallbacks = $.Callbacks();
        window.additionalPropertiesCallbacks.add(consumeAdditionalPropertiesEvent);

        window.externalEventsCallbacks.add(consumeExternalEvent);
    };

    var consumeAdditionalPropertiesEvent = function (eventName) {
        switch (eventName) {
            case events.ViewedPassword:
                consumeViewedPasswordEvent();
                break;
            case events.ChangedCountry:
                consumeChangedCountryEvent();
                break;
        }
    };
    
    var consumeExternalEvent = function (eventName) {
        if (eventName == 'registration-view') {
            bindToRegistrationUserInteractionEvents();
        }
    };

    var bindToRegistrationUserInteractionEvents = function () {
        var privacyLinkSelector = '#RegistrationForm a#chkDisclaimer4',
            agreementsLinkSelector = '#RegistrationForm a#chkDisclaimer1',
			experiencedUserSelector = '#RegistrationForm input:radio[name="UserWithExperience"]';

        $(privacyLinkSelector).click(function () {
            data.ViewedPrivacy = true;
        });
        
        $(agreementsLinkSelector).click(function () {
            data.ViewedAgreement = true;
        });

	    $(experiencedUserSelector).on('change', function() {
		    data.UserWithExperience = this.value.toLowerCase() === 'true' ? "Yes": "No";
	    });
    };

    var consumeViewedPasswordEvent = function () {
        data.ViewedPassword = true;
    };
    
    var consumeChangedCountryEvent = function () {
        data.ChangedCountry = true;
    };

    return {
        init: init,
        data: data
    };
}