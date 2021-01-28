var smartBanner = {
	show: function(){
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	    var isAndroid = userAgent.match(/Android/i) != null;

		if (isAndroid && (typeof app === 'undefined')) {
            //app comes from phonegap.js and it's only for the native one
		    $('.head-wrapper').slideDown('slow');

		    $('.head-wrapper a.close').on('click', function () {
				$('.head-wrapper').slideUp('slow');
		    });
		}
	}
}

$(document).ready(function(){
	smartBanner.show();
})