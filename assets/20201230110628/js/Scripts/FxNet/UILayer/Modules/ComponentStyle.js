define([
        'global/UrlResolver',
        'modules/ThemeSettings',
        'handlers/general'
    ],
    function ComponentStyle() {
        var UrlResolver = require('global/UrlResolver'),
            ThemeSettings = require('modules/ThemeSettings'),
            general = require('handlers/general'),
            head = document.head || document.getElementsByTagName('head')[0],
            // Eliminate browsers that admit to not support the link load event (e.g. Firefox < 9)
            nativeLoad = document.createElement('link').onload === null ? null : false,
            a = document.createElement('a');

        function createLink(url) {
            var link = document.createElement('link');

            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;

            return link;
        }

        function styleSheetLoaded(url) {
            var i;

            a.href = url;

            for (i in document.styleSheets) {
                if (document.styleSheets[i].href === a.href) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Load using the browsers built-in load event on link tags
         */
        function loadLink(url, load) {
            var link = createLink(url);

            link.onload = function () {
                load();
            };

            head.appendChild(link);
        }

        /**
         * Insert a script tag and use it's onload & onerror to know when
         * the CSS is loaded, this will unfortunately also fire on other
         * errors (file not found, network problems)
         */
        function loadScript(url, load) {
            var link = createLink(url),
                script = document.createElement('script');

            head.appendChild(link);

            script.onload = script.onerror = function () {
                head.removeChild(script);

                // In Safari the stylesheet might not yet be applied, when
                // the script is loaded so we poll document.styleSheets for it
                var checkLoaded = function () {
                    if (styleSheetLoaded(url)) {
                        load();

                        return;
                    }

                    setTimeout(checkLoaded, 25);
                };
                checkLoaded();
            };
            script.src = url;

            head.appendChild(script);
        }

        function loadSwitch(url, load) {
            if (nativeLoad) {
                loadLink(url, load);
            } else {
                loadScript(url, load);
            }
        }

        return {
            load: function (name, req, onload) { //, config (not used)
                var theme =  ThemeSettings.GetTheme(),
                    resourceUrl = UrlResolver.getAssetsPath() + '/skins/' + UrlResolver.getApplicationType() +
                        '/broker' + UrlResolver.getBroker() + '/' + UrlResolver.getLanguage() + '/components/' +
                        name + '.' + theme + '.css';

				var url = req.toUrl(resourceUrl);

				// Test if the browser supports the link load event,
				// in case we don't know yet (mostly WebKit)
				if (general.isNullOrUndefined(nativeLoad)) {
					// Create a link element with a data url,
					// it would fire a load event immediately
					var link = createLink('data:text/css,');

					link.onload = function () {
						// Native link load event works
						nativeLoad = true;
					};

					head.appendChild(link);

					// Schedule function in event loop, this will
					// execute after a potential execution of the link onload
					setTimeout(function () {
						head.removeChild(link);

						if (nativeLoad !== true) {
							// Native link load event is broken
							nativeLoad = false;
						}

						loadSwitch(url, onload);
					}, 0);
				} else {
					loadSwitch(url, onload);
				}
			}
        };
    }
);
