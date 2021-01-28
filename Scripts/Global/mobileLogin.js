var deviceAgent = navigator.userAgent.toLowerCase();
var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/) || '';
var mobile = {
	device: {
		iphone: agentID.indexOf("iphone") >= 0,
		ipad: agentID.indexOf("ipad") >= 0,
		ipod: agentID.indexOf("ipod") >= 0,
		android: agentID.indexOf("android") >= 0
	},
	type: {
		galaxy: (deviceAgent.match(/gt\-(i\d\d\d\d)/)) ? deviceAgent.match(/gt\-(i\d\d\d\d)/)[1] : ''
	},
	browser: {
		opera: deviceAgent.match(/opera/) || '',
		safari: deviceAgent.match(/safari/) || '',
		firefox: deviceAgent.match(/firefox/) || ''
	},
	check: {}
};

mobile.check.apple = deviceAgent.match(/iphone|ipod|ipad/) || '';
mobile.browser.android_default = mobile.device.android && mobile.browser.safari && deviceAgent.match(/version\//);


$(window).on('load', function () {
	calculateHeights();

	//Galaxy S3 input write bug
	if (mobile.browser.android_default && mobile.type.galaxy == 'i9300') $('#main').addClass('input-write');
});

function calculateHeights() {
    var footerH = $('#footer').outerHeight() || 0,
        innerWr = $('.innerWrapper');

    innerWr.css('min-height', 'calc(100% - ' + (footerH + 2) + 'px');
}

window.addEventListener('orientationchange', function () {
	calculateHeights();
}, false);

window.addEventListener('resize', function () {
	calculateHeights();
}, false);

function loginCloseIn() {
	var mainWr = document.getElementById('main');
	if (mainWr) {
		mainWr.style.position = 'fixed';
	}

	if (this.value != '') {
		$(this).next().css('display', 'block');
	}
	else $(this).next().css('display', 'none');
}

function loginCloseOut() {
	var mainWr = document.getElementById('main');
	if (mainWr) {
		mainWr.style.position = '';
	}

	if (this.value == '') {
		$(this).next().css('display', 'none');
	}
}

$("#txtUName, #txtPass").on('keyup', loginCloseIn);
$("#txtUName, #txtPass").on('focus', loginCloseIn);
$("#txtUName, #txtPass").on('blur', loginCloseOut);