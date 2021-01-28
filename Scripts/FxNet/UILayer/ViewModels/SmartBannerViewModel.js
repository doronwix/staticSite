var SmartBannerViewModel = function (ko, general, observableHashTable) {
    var smartBannerObject = {},
        smartBannersList = new observableHashTable(ko, general, "position"),
        bannerCountDown = new CountDownModel(ko);


    //-------------------------------------------------------
    var init = function () {
        setDefaultObservables();
        registerObservableStartUpEvent();
        bannerCountDown.Init();
    };

    //-------------------------------------------------------
    var setDefaultObservables = function () {
        smartBannerObject.visibilityOverride = ko.observable(false);
        smartBannerObject.activePosition = ko.observable(eSmartBannerPosition.None);

        smartBannersList.Add(toInitialObservableBanner(eSmartBannerStatus.Invisible, eSmartBannerPosition.Wide, '', ''));
        smartBannersList.Add(toInitialObservableBanner(eSmartBannerStatus.Invisible, eSmartBannerPosition.Small, '', ''));
    };

    //-------------------------------------------------------
    var registerObservableStartUpEvent = function () {
        smartBannerObject.visibilityOverride.subscribe(function (visibilityOverride) {
            if (visibilityOverride) {
                stop();
            }
        });

        smartBannerObject.activePosition.subscribe(function (position) {
            changeBannerState(smartBannersList.Get(position).state(), position);
        });
    };

	//-------------------------------------------------------
    var changeBannerState = function (stateValue, position) {
        if (smartBannerObject.activePosition() == position) {
            switch (stateValue) {
                case eSmartBannerStatus.Visible:
                    start();
                    break;
                case eSmartBannerStatus.Invisible:
                    stop();
                    break;
                default: break;
            }
        }
    }

	//-------------------------------------------------------
    var setExpirationDate = function (expDate) {
        bannerCountDown.CountDownObject.expirationDate(expDate);
    }

	//-------------------------------------------------------
    var setVisibilityOverride = function (visibilityOverride) {
        smartBannerObject.visibilityOverride(visibilityOverride);
    }

	//-------------------------------------------------------
    var updatePosition = function (position) {
        smartBannerObject.activePosition(position);
    }

	//-------------------------------------------------------
    var updateViewOfferButtonCallback = function (callback) {
        smartBannerObject.callbackPlaceholder = callback;
    }

    //-------------------------------------------------------
    var start = function () {
        bannerCountDown.Start(true);

        var currentSmartBanner = smartBannersList.Get(smartBannerObject.activePosition());
        ko.postbox.publish('message-view', { text: currentSmartBanner.html(), type: currentSmartBanner.position() });
    };

    //-------------------------------------------------------
    var stop = function () {
        bannerCountDown.Stop();
    };

	//-------------------------------------------------------
    var smartBannerCallback = function (expiration, state, cssClass, contentKey, html, viewOfferCallback) {
        setExpirationDate(expiration);
        smartBannersList.Update(cssClass, toObservableBanner(state, html, contentKey));

        changeBannerState(state, cssClass);

        updateViewOfferButtonCallback(viewOfferCallback);
    }

	//-------------------------------------------------------
    var smartBannerViewOfferButtonCallback = function () {
    	if (general.isEmptyType(smartBannerObject.callbackPlaceholder)) {
    		return;
    	}

    	smartBannerObject.callbackPlaceholder.apply(null, arguments);

    	var currentSmartBanner = smartBannersList.Get(smartBannerObject.activePosition());
	    ko.postbox.publish('sb-view-offer-clicked', { text: bannerCountDown.GetText(), type: currentSmartBanner.position() });
    }

	//-------------------------------------------------------
    var smartBannerDepositButtonCallback = function () {
    	ko.postbox.publish('sb-deposit-clicked', { text: bannerCountDown.GetText() });

        $viewModelsManager.VManager.RedirectToForm(eForms.Deposit);
    }

	//-------------------------------------------------------
    var toInitialObservableBanner = function (state, cssClass, html, contentKey) {
        var banner = {};
        banner.state = ko.observable("");
        banner.position = ko.observable("");
        banner.html = ko.observable("");
        banner.contentKey = ko.observable("");

        banner.isBannerVisible = ko.computed(function () {
            return smartBannerObject.activePosition() == banner.position() && banner.state() == eSmartBannerStatus.Visible && !smartBannerObject.visibilityOverride() && !bannerCountDown.CountDownObject.expired();
        });


        banner.state(state);
        banner.position(cssClass);
        banner.html(html);
        banner.contentKey(contentKey);
        return banner;
    }

	//-------------------------------------------------------
    var toObservableBanner = function (state, html, contentKey) {
        var banner = {};
        banner.state = ko.observable(state);
        banner.html = ko.observable(html);
        banner.contentKey = ko.observable(contentKey);

        return banner;
    }

    //-------------------------------------------------------
    return {
        Init: init,
        SetExpirationDate: setExpirationDate,
        SetVisibilityOverride: setVisibilityOverride,
        UpdateBannerPosition: updatePosition,
        BannnerCountDown: bannerCountDown,
        ObervableSmartBannersArray: smartBannersList,
        SmartBannerObject: smartBannerObject,
        SmartBannerCallBack: smartBannerCallback,
        SmartBannerViewOfferButtonCallback: smartBannerViewOfferButtonCallback,
        SmartBannerDepositButtonCallback: smartBannerDepositButtonCallback
    };
};