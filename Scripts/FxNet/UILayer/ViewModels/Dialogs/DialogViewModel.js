define(
    'viewmodels/dialogs/DialogViewModel',
    [
        'knockout',
        'global/debounce',
        'handlers/general'
    ],
    function DialogModelDef(ko, debounce, general) {
        function DialogModel(name, view, args) {
            this.name = name;
            this.viewType = view || 6;
            this.viewArgs = args;
            this.options = {};
            this.openTimeout = 0;
            this.persistent = true;
            this.position = ko.observable({});
            this.element = null;
            this.OnClose = new TDelegate();

            this.setOptions = function (customOptions, dialogPosition) {
                this.options = {
                    title: '',
                    width: 'auto',
                    height: 'auto',
                    dialogClass: 'fx-dialog',
                    closeText: "",
                    top: -1,
                    left: -1,
                    offset: 0
                };

                this.openTimeout = general.isDefinedType(customOptions.openTimeout) ? customOptions.openTimeout : 0;
                this.persistent = general.isDefinedType(customOptions.persistent) ? customOptions.persistent : true;

                this.element = document.getElementById(this.name);

                if (!this.element) {
                    return;
                }

                if (customOptions.useDialogPosition) {
                    this.options.topOpt = dialogPosition.top;
                    this.options.leftOpt = dialogPosition.left;
                    this.options.offsetOpt = dialogPosition.offset;
                }

                Object.assign(this.options, customOptions)
            }

            this.getOptions = function () {
                return this.options;
            };

            this.dispose = function () {
                this.OnClose.Flush();
                this.position(null);
                this.options = null;
                this.element = null;
            };
        }

        function DialogViewModelClass() {
            var instances = ko.observableArray([]),
                topMostDialog = ko.computed(function () {
                    var length = instances().length;
                    return instances()[length - 1];
                }),
                persistent = ko.computed(function () {
                    var dialog = topMostDialog();
                    if (dialog) {
                        return dialog.persistent;
                    }

                    return true;
                }),
                isOpen = ko.computed(function () {
                    return instances().length > 0;
                }),
                dialogPosition = ko.observable({ top: -1, left: -1, offset: 0 }),
                onPreloadDelegate = new TDelegate(),
                onOpenDelegate = new TDelegate(),
                onCloseDelegate = new TDelegate();

            var open = debounce(function openHandler(name, options, view, args) {
                var dialog = new DialogModel(name, view, args);
                dialog.OnClose.Add(closeHandler);
                dialog.setOptions(options, dialogPosition());

                onOpenDelegate.Invoke(dialog.name, dialog.viewType, dialog.viewArgs);

                instances.push(dialog);
            }, 500, true);

            var openAsync = debounce(function openAsyncHandler(event, name, options, view, args) {
                var subscriber = ko.postbox.subscribe(event, function () {
                    open(name, options, view, args);
                    subscriber.dispose();
                });

                onPreloadDelegate.Invoke(name, view, args);
            }, 500, true);

            function closeHandler(dialog, hasInternalIframe) {
                var index = instances.indexOf(dialog);

                if (index > -1) {
                    if (dialog.options && dialog.options.hasOwnProperty('onCloseCallback') &&
                        general.isFunctionType(dialog.options.onCloseCallback)) {
                        dialog.options.onCloseCallback(dialog);
                    }

                    dialog.dispose();

                    if (!hasInternalIframe) {
                        onCloseDelegate.Invoke(dialog.name, dialog.viewType);
                    }

                    instances.splice(index, 1);
                }
            }

            function close(dialogName, hasInternalIframe) {
                var dialog;

                if (!general.isEmptyValue(dialogName)) {
                    dialog = ko.utils.arrayFirst(instances(), function (item) {
                        return item.name === dialogName;
                    });
                }
                else {
                    dialog = topMostDialog();
                }

                closeHandler(dialog, hasInternalIframe);
            }

            function getCurrentView() {
                var dialog = topMostDialog();

                if (dialog) {
                    return dialog.viewType;
                }

                return null;
            }

            return {
                dialogs: instances,
                open: open,
                openAsync: openAsync,
                close: close,
                isOpen: isOpen,
                persistent: persistent,
                getCurrentView: getCurrentView,
                dialogPosition: dialogPosition,
                OnPreload: onPreloadDelegate,
                OnOpen: onOpenDelegate,
                OnClose: onCloseDelegate
            };
        }

        //----------------------------------------
        window.DialogViewModel = new DialogViewModelClass();

        return window.DialogViewModel;
    }
);
