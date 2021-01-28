define(
    'deviceviewmodels/TileLayoutViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/historymanager',
        'helpers/KoComponentViewModel',
        'devicemanagers/TileSettingsManager',
        'managers/ChartLayoutSettings',
        'StateObject!AccountHub',
        'JSONHelper'
    ],
    function () {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            historyManager = require('managers/historymanager'),
            tileSettingsManager = require('devicemanagers/TileSettingsManager'),
            chartLayoutSettings = require('managers/ChartLayoutSettings'),
            JSONHelper = require('JSONHelper'),
            stateObjectAccountHub = require('StateObject!AccountHub');

        var TileLayoutViewModel = general.extendClass(koComponentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                options = general.extendType({}, params),
                defaultLayout = options.selectedLayout || eTileLayout.FourSplit;

            //-------------------------------------------------------
            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                tileSettingsManager.Init({ initialLayout: defaultLayout });

                setProperties();
                setObservables();
                setComputables();
                setSubscribers();
            }

            //-------------------------------------------------------
            function setProperties() {
                data.layouts = options.layouts || [1];
                data.templates = (options.templates || [])
                    .slice(0, Math.max.apply(null, data.layouts))
                    .map(function (name) { return { name: name } });
            }

            //-------------------------------------------------------
            function setObservables() {
                data.selectedLayout = ko.observable(tileSettingsManager.GetLayout());
                data.isFullScreen = ko.observable(false);
                data.isLayoutSelectorExpanded = ko.observable(false);
                data.activeTileId = ko.observable(getActiveTileIdFromSettings());
            }

            //-------------------------------------------------------
            function setComputables() {
                data.isSingleMode = ko.pureComputed(function() { return data.selectedLayout() === eTileLayout.Single; });
            }

            //-------------------------------------------------------
            function setSubscribers() {
                self.subscribeTo(data.selectedLayout, function (newLayoutId) {
                    tileSettingsManager.UpdateLayout(newLayoutId);

                    if (!options.activeChangedHandler) {
                        return;
                    }

                    if (data.activeTileId() >= newLayoutId && newLayoutId > 1) {
                        data.activeTileId(0);
                    } else {
                        options.activeChangedHandler(data.activeTileId(), newLayoutId);
                    }
                });

                self.subscribeTo(data.activeTileId, function (newTile) {
                    if (!options.activeChangedHandler) {
                        return;
                    }

                    options.activeChangedHandler(newTile, data.selectedLayout());
                });

                self.subscribeTo(data.isFullScreen, function (value) {
                    stateObjectAccountHub.update("displayNone", value);
                })

                historyManager.OnStateChanged.Add(onHistoryStateChanged);
            }

            //-------------------------------------------------------
            function onHistoryStateChanged(state) {
                if (state.type === eHistoryStateType.ExitFullscren ||
                    (state.type === eHistoryStateType.CloseDialog && state.popupId == 'ChartPageFullScreen')) {
                    data.isFullScreen(false);
                }

                if (state.type === eHistoryStateType.EnterFullscren) {
                    data.isFullScreen(true);
                }
            }

            //-------------------------------------------------------
            function getActiveTileIdFromSettings() {
                var tileId = tileSettingsManager.GetActiveTileId();

                if (tileId >= defaultLayout) {
                    tileId = defaultLayout - 1;

                    overWriteActiveTileSettings(tileId);
                    tileSettingsManager.UpdateActiveTileId(tileId);
                    data.selectedLayout(defaultLayout);
                }

                return tileId;
            }

            //-------------------------------------------------------
            function overWriteActiveTileSettings(newActiveTileId) {
                var oldActiveTileId = tileSettingsManager.GetActiveTileId();

                var oldActiveTileSettings = chartLayoutSettings.GetSettings(oldActiveTileId);
                oldActiveTileSettings.isActive = false;
                chartLayoutSettings.UpdateSettings(oldActiveTileId, oldActiveTileSettings);

                var newActiveTileSettings = cloneObject(oldActiveTileSettings);
                newActiveTileSettings.isActive = true;
                chartLayoutSettings.UpdateSettings(newActiveTileId, newActiveTileSettings);
            }

            //-------------------------------------------------------
            function cloneObject(obj) {
                obj = JSON.stringify(obj);
                return JSONHelper.STR2JSON("TileLayoutViewModel:cloneObject", obj);
            }

            //-------------------------------------------------------
            function setActiveTile(tileId) {
                if (data.activeTileId() == tileId) {
                    return;
                }

                data.activeTileId(-1);

                setTimeout(function(tileIdValue, dataRef, tileSettingsManagerRef) {
                    dataRef.activeTileId(tileIdValue);
                    tileSettingsManagerRef.UpdateActiveTileId(tileIdValue);
                }, 10, tileId, data, tileSettingsManager);
            }

            //-------------------------------------------------------
            function toggleLayoutSelector() {
                data.isLayoutSelectorExpanded(!data.isLayoutSelectorExpanded());
            }

            //-------------------------------------------------------
            function toggleFullScreen() {
                if (!data.isFullScreen()) {
                    historyManager.PushPopupState(ePopupType.Dialog, options.fullscreenPageId);
                } else {
                    historyManager.Back();
                }
            }

            //-------------------------------------------------------
            function selectLayout(index) {
                data.selectedLayout(index);
                data.isLayoutSelectorExpanded(false);
            }

            //-------------------------------------------------------
            function dispose() {
                historyManager.OnStateChanged.Remove(onHistoryStateChanged);

                parent.dispose.call(self);          // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                SelectLayout: selectLayout,
                SetActiveTile: setActiveTile,
                ToggleFullScreen: toggleFullScreen,
                ToggleLayoutSelector: toggleLayoutSelector
            }
        });

        function createViewModel(params) {
            var viewModel = new TileLayoutViewModel(params);

            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);