$(document).ready(function () {
	(new ChangeLanguage()).Init();
});

function ChangeLanguage() {
	var divLang;
	var ulLang;
	var showLangEl;
	var hideLangEl;
	var selectedLangEl;

	var init = function () {
		setDomReferences();
		setDomEvents();
	};

	var setDomReferences = function () {
		var bannerHeader = document.getElementsByClassName('head-wrapper')[0],
			actualvisible = false;
			
		content = $('#Content');
		divLang = $('div.change-language'); //TO DO: create visibility toggle based on this
		ulLang = $('ul.languages-list');
		currentLangId = $('input#currentLangId').val();
		showLangEl = $('#showLangSel');
		hideLangEl = $('#hideLangSel');
		selectedLangEl = $('#selectedLang');

		showLangEl.on('click', function () {
			actualvisible = bannerHeader.style.display;
            bannerHeader.style.display = 'none';
			divLang.css('display', 'block');
			ulLang.animate({ scrollTop: ($('#lang-' + currentLangId).offset().top - ulLang.offset().top) }, 0);
			content.addClass('lang-select');
		});

		if (hideLangEl.length) {
			hideLangEl.on('click', function () {
				bannerHeader.style.display = actualvisible;
				divLang.css('display', 'none');
				content.removeClass('lang-select');
			});
		}
	};

	var setDomEvents = function () {
		ulLang.find('li').each(function () {
			var currentLang = $(this);
			var langId = currentLang.attr('data-language-id');
			var langName = currentLang.attr('data-language-name');

			if (currentLangId === langId) {
			    var langText = currentLang.attr('data-language-text');
				selectedLangEl.html(langText);
			}

			$(this).on('click', function () {
				changeLanguage(langId, langName);
			});
		});


	};

    var changeLanguage = function (langId, langName) {
		if (langId === currentLangId) {
			return;
		}

		makeLanguageCookie(langId, langName);
		window.externalEventsCallbacks.fire('change-language');
		window.location = '/webpl3/' + RouteData[routeEnum.Controller].Value + '/' + RouteData[routeEnum.Action].Value + '/Lang/' + langName + window.location.search;
	};

	var makeLanguageCookie = function (langId, langName) {
		CookieHandler.CreateCookie('LID', langId, (new Date()).AddMonths(6));
		CookieHandler.CreateCookie('Language', langName, (new Date()).AddMonths(6));
	};

	return {
		Init: init
	};
}