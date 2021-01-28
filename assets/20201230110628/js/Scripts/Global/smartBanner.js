var SmartBanner = (function () {
	var bannerPlacement = {
		reset: function () {
			var isTopBannerVisible = $(".right-side .banner .top").is(":visible"),
				isSmartBannerPopulated = ($(".popupContainer").length > 0 && $(".popupContainer").html().length > 1);

			if (isSmartBannerPopulated) {
				if (isTopBannerVisible) {
					$(".banner").addClass("double");
				} else {
					$(".right-side").addClass("second-only");
				}
			}
		}
	};

	bannerPlacement.reset();

	return bannerPlacement;
})();