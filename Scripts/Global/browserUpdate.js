(function () {
    var browserUpdate = {

        bannerElement: $('#browser-update-banner'),

        init: function () {
            if (this.checkStatus()) {
                this.showBanner();
                this.setHandlers();
            } else {
                this.removeBanner();
            }
        },

        checkStatus: function () {
            return Browser.isInternetExplorer() && !Browser.isIEVersionGreaterThen(11);
        },

        showBanner: function () {
            this.bannerElement.show();
        },

        removeBanner: function () {
            this.bannerElement.remove();
        },

        setHandlers: function () {
            var that = this;
            $('.browser-update-close-button').click(function () {
                that.bannerElement.hide();
            });
        }
    };

    browserUpdate.init();
})();