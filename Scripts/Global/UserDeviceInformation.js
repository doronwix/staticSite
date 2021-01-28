$(document).ready(function () {
    UserDeviceInformation.init();
});

var UserDeviceInformation = {
    init: function () {
        this.setUserDeviceResolutionCookie();
        this.setResolutionSpecificDomElements();
    },

    setUserDeviceResolutionCookie: function () {

        var udi = CookieHandler.ReadCookie("UserDeviceInformation");
        if (udi != null) {
            var isReturningUser = udi.split('|')[0];
            var showMobileReferralLink = udi.split('|')[2];

            CookieHandler.CreateCookie("UserDeviceInformation", isReturningUser + "|" + Browser.getLargestResolutionDimension().toString() + "|" + showMobileReferralLink, (new Date()).AddDays(Model.UserDeviceInformationCookieExpirationDays));
        }
    },

    setResolutionSpecificDomElements: function () {
        var udi = CookieHandler.ReadCookie("UserDeviceInformation");
        if (udi != null) {
            var showMobileReferralLink = udi.split('|')[2];
            if (showMobileReferralLink.toLowerCase() == "true") {
                $('#Footer .mobilePlatformLink.contactIconItem').addClass('visible').closest('.features').addClass('mobileLinkVisible');
            }
        }
    }
};