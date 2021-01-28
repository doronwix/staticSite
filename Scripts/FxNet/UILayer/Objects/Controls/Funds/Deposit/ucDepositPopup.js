define(
    'objects/Funds/Deposit/DepositPopupControl',
    [
        'require',
        'objects/Containers/SharedFormDepositContainer'
    ],
    function (require) {
        var SharedFormDepositContainer = require('objects/Containers/SharedFormDepositContainer');

        function DepositPopupControl(config) {
            config = config || {};
            var options = {
                dalMethod: function () { return false; }
            };

            options = Object.assign(options, config);

            var self = this,
                sharedFormSrc,
                hasLoaded = false,
                winHandler;

            var closePopupWindow = function () {
                if (winHandler && !winHandler.closed) {
                    winHandler.close();
                    winHandler = null;
                }
            };

            var overridedAlertWithRedirect = function (text, redirectUrl) {
                closePopupWindow();
                SharedFormDepositContainer.GetInstance().HandleMessageAndRedirect(text, redirectUrl);
            };

            var overrideWindowOpen = function (url, name, specs) {
                winHandler = SharedFormDepositContainer.GetInstance().HandlePopupWindow(url, name, specs);
                if (winHandler && !winHandler.closed) {
                    winHandler.alert = overridedAlertWithRedirect;
                    winHandler.focus();
                }

                return winHandler;
            };

            var depositOptions = {
                onLoad: function (iframe) {
                    if ('href' in iframe.contentWindow.location) {
                        var container = iframe.parentElement;
                        if (container.length > 0) {
                            container.height(iframe.contentWindow.document.body.offsetHeight);
                        }
                    }
                },
                iframeFunctions: function (frame) {
                    var iframeValidation = this.superFunction(frame);

                    if (iframeValidation === eFrameContentValidation.Available) {
                        // Check if functions have been overrided
                        if (!frame.contentWindow.fxOverridden) {
                            // alert
                            frame.contentWindow.alert = overridedAlertWithRedirect;
                            // popup
                            frame.contentWindow.open = overrideWindowOpen;

                            // Set the overrided flag
                            frame.contentWindow.fxOverridden = true;
                        }

                        // Check the popup handler
                        if (winHandler) {
                            if (winHandler.closed) {
                                // cleanup if the popup has been closed
                                winHandler = null;
                            } else {
                                // Safe-check in order to avoid 'same origin security policy' exception
                                // try catch - exception is thrown when the popup is opened with https and the parent window is with http
                                try {
                                    if ('href' in winHandler.location) {
                                        if (!winHandler.fxOverridden) {
                                            // alert
                                            winHandler.alert = overridedAlertWithRedirect;

                                            // Set the overrided flag
                                            winHandler.fxOverridden = true;
                                        }
                                    }
                                } catch (err) { } // eslint-disable-line no-empty
                            }
                        }
                    }

                    return iframeValidation;
                }
            };

            var show = function () {
                if (!hasLoaded)
                    loadControl();
                else if (sharedFormSrc != '')
                    SharedFormDepositContainer.GetInstance().Show(sharedFormSrc, depositOptions);
            };

            var hide = function () { };

            var loadControl = function () {
                hasLoaded = true;

                options.dalMethod.call(self, onLoadComplete);
            };

            var onLoadComplete = function (responseText) {
                createObjects(responseText);
            };

            var createObjects = function (responseText) {
                var content = responseText.split('_ResponseSplitter_');
                var data = JSONHelper.STR2JSON('DepositPopup/createObjects', content[1]);
                if ('SharedFormSrc' in data) {
                    sharedFormSrc = data.SharedFormSrc || '';
                    SharedFormDepositContainer.GetInstance().Show(sharedFormSrc, depositOptions);
                }
            };

            var dispose = function () {
                hasLoaded = false;
                sharedFormSrc = '';

                // Check the popup window
                if (winHandler && !winHandler.closed) {
                    try {
                        // close it
                        winHandler.close();
                    } catch (e) { } // eslint-disable-line no-empty
                }
                // cleanup the reference
                winHandler = null;
            };

            return {
                show: show,
                hide: hide,
                dispose: dispose
            };
        }

        return DepositPopupControl;
    }
);