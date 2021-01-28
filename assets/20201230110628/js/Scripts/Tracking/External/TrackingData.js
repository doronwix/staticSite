var TrackingData = function () {
    var properties = {},
        wasInitialized = false,
        registrationPageModel = {},
        additionalProperties = new AdditionalProperties();
    
    var init = function () {
        properties = TrackingCommonData()(StorageFactory(StorageFactory.eStorageType.session));
        additionalProperties.init();
    };

    var getProperties = function () {
        if (!wasInitialized) {
            init();
            wasInitialized = true;
        }

        return properties;
    };


    return {
        init: init,
        getProperties: getProperties,
        registrationPageModel: registrationPageModel,
        additionalProperties: additionalProperties
    };
};

window.trackingData = new TrackingData();