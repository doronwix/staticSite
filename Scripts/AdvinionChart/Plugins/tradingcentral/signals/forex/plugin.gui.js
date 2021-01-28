function ProChart_Init_plugin_tradingcentral_forex(chartObject) {
    var objChartMain = chartObject;
    var objPlugin = {};

    //#region init

    //init module global vars
    var dialogTitle = "";
    //var dialogOpenType = { "Add": 1, "Edit": 2 };
    //var signalUpdateType = { "All": 0, "Style": 1, "Draw": 2, "Value": 3 };
    var cache = objChartMain.init.debug.cache;
    cache = false;

    objPlugin.panel = {
        panelObject: null

    };

    //     Exmp
    //     var obj = {
    //         id: coreid,
    //         guiid: signalid,
    //         type: 'signal',
    //         width: size.panelsize.width + unit,
    //         height: size.panelsize.height + unit,
    //         main: {
    //             guiid: innermainid,
    //             width: size.innermainsize.width + unit,
    //             height: size.innermainsize.height + unit
    //         },
    //         legend: {
    //             guiid: legendid
    //         },
    //         controlpanel: {
    //             guiid: controlpanelid
    //         }
    //     };



    //Signal Public Function
    objPlugin.gui = {
        contentUpdate: contentUpdate,
        createPanel: createPanel,
        closePanel: closePanel,
        openDialog: openDialog,
        startWaitSignal: startWaitSignal,
        stopWaitSignal: stopWaitSignal
    };

    objPlugin.info = {
        id: "tradingcentral_forex",
        path: null,
        loaddedcss: false,
        templatename: null,
        settings: null
    };

    // dialog
    var colorsDialogContrLevel = [];
    var colorsDialogContrStory = [];

    //#endregion init

    //#region panel  ---------------------------------------------------------------------------------------



    // content update
    function contentUpdate(objPluginSettings, objContent) {



        console.log(objPluginSettings);
        console.log(objContent);

        contentUpdateLegend(objContent.legend, objPluginSettings);
        contentUpdateStory(objContent.story, objPluginSettings);
        contentUpdateError(objContent.error, objPluginSettings);
    }

    // legend
    function contentUpdateLegend(obj, objsettings) {

        var legend = "";

        // text

        for (var i = 0; i < obj.length; i++) {
            legend = legend + '<p ' + returnBlockStyle(obj[i], 'px') + ' >' + obj[i].label + '</p>';
        }

        $('#' + objPlugin.panel.panelObject.main.guiid).find('.tradingcentral-forex-legend').html(legend);

        // background

        var bk = objChartMain.commonutils.func.valueForKey(objsettings, 'legendBKColor');
        if (bk != null) {
            $('#' + objPlugin.panel.panelObject.main.guiid).find('.tradingcentral-forex-legend').css('background-color', bk);
        }

    }


    function contentUpdateStory(obj, objsettings) {

        var story = "";

        // text
        for (var i = 0; i < obj.length; i++) {
            story += '<div ' + returnBlockStyle(obj[i], 'px') + ' >' + obj[i].label + '</div>';
        }

        $('#' + objPlugin.panel.panelObject.main.guiid).find('.tradingcentral-forex-story').html(story);

        // background

        var bk = objChartMain.commonutils.func.valueForKey(objsettings, 'storyBKColor');
        if (bk != null) {
            $('#' + objPlugin.panel.panelObject.main.guiid).find('.tradingcentral-forex-story').css('background-color', bk);
        }

    }


    function contentUpdateError(obj) {
        var error = "";

        for (var i = 0; i < obj.length; i++) {
            error = '<div ' + returnBlockStyle(obj[i], 'px') + ' >' + obj[i].label + '</div>';
        }


        $('#' + objPlugin.panel.panelObject.main.guiid).find('.tradingcentral-forex-error').html(error);



    }


    function createPanel() {


        var updatetime = cache == false ? ('?' + Math.floor((Math.random() * 45435) + 1)) : "";

        if (typeof objChartMain.panels != 'undefined') {
            var panelid = objChartMain.commonutils.func.returnShortUniqID();
            objPlugin.panel.panelObject = objChartMain.panels.gui.addSignalPanel(panelid);
        } else {
            return;
        }

        if (objPlugin.panel.panelObject == null) {
            return;
        }

        if (objPlugin.info.loaddedcss != true) {
            // load css

            objChartMain.commonutils.func.loadCSS(objChartMain.guiinit.rootpath + "/" + objPlugin.info.path + 'plugin.css' + updatetime);
        }




        $('#' + objPlugin.panel.panelObject.main.guiid).load(objChartMain.guiinit.rootpath + "/" + objPlugin.info.path + 'panel.htm' + updatetime + ' #gui-panel', function () {

            // activate callback onResizePanel
            objChartMain.panels.gui.activateonResizePanel(panelid, onResizePanel);

            // update legend
            //  ---> create legend object 

            var title = objChartMain.localizationobj.gui.returnLocalizationString(objPlugin.info.id + ".title", 'Trading Central Forex');

            var legendobjects = [{
                fields: [{
                    captions: [title],
                    closeBtn: true,
                    colors: ['#000000'],
                    titlelocalize: objPlugin.info.id + ".title",
                    editIdx: "tradingcentral_forex",
                    name: title,
                    type: 'plugin',
                    visible: true,
                    uid: objChartMain.commonutils.func.returnShortUniqID()

                }
                ],
                id: objPlugin.panel.panelObject.id

            }];

            objChartMain.panels.gui.updateLegends(legendobjects);


        });


    }

    function closePanel() {
        if (typeof objChartMain.panels != 'undefined' && objPlugin.panel.panelObject != null) {
            var panelid = objPlugin.panel.panelObject.id;
            objChartMain.panels.gui.deletePanelById(panelid);
        }

    }


    function onResizePanel(objPanel) {
        objPlugin.panel.panelObject = objPanel;

        // change resize
        $('#' + objPlugin.panel.panelObject.main.guiid).find('.tradingcentral-forex').css('height', objPlugin.panel.panelObject.main.height);

    }

    function minsizePanel() {

    }

    function maxsizePanel() {

    }

    function normalsizePanel() {

    }

    function startWaitSignal() {


        if (typeof objChartMain.preloadobj != 'undefined') {
            var parpreload = $('#' + objPlugin.panel.panelObject.main.guiid).find('#tradingcentrallforex-waiting-forsignal');
            objChartMain.preloadobj.startPreloadinobject(parpreload, null, 'small');


        }
    }


    function stopWaitSignal() {
        //Run preoload
        if (typeof objChartMain.preloadobj != 'undefined') {
            var parpreload = $('#' + objPlugin.panel.panelObject.main.guiid).find('#tradingcentrallforex-waiting-forsignal');
            objChartMain.preloadobj.endPreloadinobject(parpreload);
        }

        var alert = $('#' + objPlugin.panel.panelObject.alert.guiid);

        if (alert.length > 0) {
            alert.addClass('flash');

            // remove flash after 5 sec
            setTimeout(function () {
                var alert2 = $('#' + objPlugin.panel.panelObject.alert.guiid);
                alert2.removeClass('flash');

            }, 5000);

        }


    }

    //#endregion panel --------------------------------------------------------------------------------------------------


    //#region style

    function returnContentStyle(obj) {

    }


    function returnBlockStyle(block, unit) {

        var style = '';

        // left
        if (typeof block['left'] != "undefined") {
            style = style + 'left :' + block['left'] + unit + '; ';
        }

        // right
        if (typeof block['right'] != "undefined") {
            style = style + 'right :' + block['right'] + unit + '; ';
        }


        // top
        if (typeof block['top'] != "undefined") {
            style = style + 'top :' + block['top'] + unit + '; ';
        }

        // bottom
        if (typeof block['bottom'] != "undefined") {
            style = style + 'bottom :' + block['bottom'] + unit + '; ';
        }


        // width
        var width = '';
        if (typeof block['width'] != "undefined") {
            style = style + 'width :' + block['width'] + unit + '; ';
        }

        // height
        var height = '';
        if (typeof block['height'] != "undefined") {
            style = style + 'height :' + block['height'] + unit + '; ';
        }

        // font
        var font = '';
        if (typeof block['font'] != "undefined") {
            style = style + 'font-family :' + block['font'] + '; ';
        }

        // fontsize
        var fontSize = '';
        if (typeof block['fontSize'] != "undefined") {
            style = style + 'font-size :' + block['fontSize'] + unit + '; ';
        }


        // fontsize
        var color = '';
        if (typeof block['color'] != "undefined") {
            style = style + 'color :' + block['color'] + '; ';
        }


        if (style.length > 0) {
            return 'style="' + style + '"';
        } else {
            return '';
        }



    }



    //#endregion style


    //#region dialog
    function openDialog() {
        //start preload
        objChartMain.preloadobj.startPreload();
        dialogTitle = "TradingCentral Binary Forex";
        var updatetime = cache == false ? ('?' + Math.floor((Math.random() * 100) + 1)) : "";
        initDialog('', dialogTitle);
        $('#chart-dialog').load(objChartMain.guiinit.rootpath + "/" + objPlugin.info.path + 'dialog.htm' + updatetime + ' #gui-dialog', function () {


            //Init Tabs
            initEventTab();



            //Open indicator
            //indicator4All(objInfo);


            initPluginSettings();




            //run localization
            if (typeof objChartMain.localizationobj != 'undefined') {
                objChartMain.localizationobj.gui.updateFromDataLang($('#chart-dialog'));
            }


            //OPen
            $("#chart-dialog").dialog("open");
        });
    }



    function initPluginSettings() {

        objPlugin.info.preference = objChartMain.chart.Plugins.GetSettings(objPlugin.info.id);
        console.log('-- -- -- -- -- -- -- --GetSettings ------------------');
        console.log(objPlugin.info.preference);


        // levels
        initLevelBlock();

        // legend and story
        initLegendStoryBlock();

        // prefernce
        initPreferenceBlock();

    }


    function initLevelBlock() {

        colorsDialogContrLevel = [];

        var opacityv = 1;
        opacityv = opacityv * 100;


        $('#arrow-head-size').slider({ min: 5, max: 20 });
        $('#levels-line-width').slider({ min: 1, max: 5 });


        // set arrow-head-size
        var arrow_head_size = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'arrowHeadSize');
        $('#arrow-head-size').slider("option", "value", arrow_head_size);
        $('#arrow-head-size-value').html(arrow_head_size);

        // set levels line width
        var levels_line_width = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'levelsWidth');
        $('#levels-line-width').slider("option", "value", levels_line_width);
        $('#levels-line-width-value').html(levels_line_width);



        colorsDialogContrLevel.push(
              { ctr: 'resistance-color', json: 'levelResistanceColor', opacity: opacityv },
              { ctr: 'resistance-color-text', json: 'levelResistanceValueColor', opacity: opacityv },
              { ctr: 'resistance-arrow-color', json: 'levelResistanceArrowColor', opacity: opacityv },
              { ctr: 'support-color', json: 'levelSupportColor', opacity: opacityv },
              { ctr: 'support-color-text', json: 'levelSupportValueColor', opacity: opacityv },
              { ctr: 'support-arrow-color', json: 'levelSupportArrowColor', opacity: opacityv },
              { ctr: 'pivot-color', json: 'levelPivotColor', opacity: opacityv },
              { ctr: 'pivot-color-text', json: 'levelPivotValueColor', opacity: opacityv },
              { ctr: 'neutral-color', json: 'levelSidewayColor', opacity: opacityv }

         );

        for (var indx in colorsDialogContrLevel) {

            var colorvalue = objChartMain.commonutils.func.parseColorString(objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, colorsDialogContrLevel[indx].json));

            var rgbaNewvalue = 'rgb(%r%, %g%, %b%)'
                .replace('%r%', colorvalue[0])
                .replace('%g%', colorvalue[1])
                .replace('%b%', colorvalue[2]);


            objChartMain.commonutils.func.initColor($('#' + colorsDialogContrLevel[indx].ctr), rgbaNewvalue);
        }

        //event level_color   
        $('.class-level-color').on('change', function () {
            var changecolor = $(this).spectrum("get").toRgbString(); //  .toHexString();

            var id = $(this).attr('id');

            for (var indy in colorsDialogContrLevel) {
                if (colorsDialogContrLevel[indy].ctr == id) {

                    //update value
                    objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, colorsDialogContrLevel[indy].json, changecolor);

                    objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);


                }
            }

        });

        // levels line width
        $('#arrow-head-size').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#arrow-head-size-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'arrowHeadSize', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#arrow-head-size-value').html(linew);
        });


        // levels line width
        $('#levels-line-width').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#levels-line-width-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'levelsWidth', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#levels-line-width-value').html(linew);
        });


    }



    function initLegendStoryBlock() {

        colorsDialogContrStory = [];



        $('#legend-size-font').slider({ min: 10, max: 36 });
        $('#story-size-font').slider({ min: 10, max: 36 });


        // legend_size_font
        var legend_size_font = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'legendTextSize');
        $('#legend-size-font').slider("option", "value", legend_size_font);
        $('#legend-size-font-value').html(legend_size_font);

        // story
        var story_size_font = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'storyTextSize');
        $('#story-size-font').slider("option", "value", story_size_font);
        $('#story-size-font-value').html(story_size_font);

        var opacityv = 1;

        colorsDialogContrStory.push(
              { ctr: 'legend-color-bk', json: 'legendBKColor', opacity: opacityv },
              { ctr: 'story-color-bk', json: 'storyBKColor', opacity: opacityv },
              { ctr: 'story-color-text', json: 'storyColor', opacity: opacityv }
         );

        for (var indx in colorsDialogContrStory) {

            var colorvalue = objChartMain.commonutils.func.parseColorString(objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, colorsDialogContrStory[indx].json));

            var rgbaNewvalue = 'rgb(%r%, %g%, %b%)'
                .replace('%r%', colorvalue[0])
                .replace('%g%', colorvalue[1])
                .replace('%b%', colorvalue[2]);


            objChartMain.commonutils.func.initColor($('#' + colorsDialogContrStory[indx].ctr), rgbaNewvalue);
        }

        //event level_color   
        $('.class-story-color').on('change', function () {
            var changecolor = $(this).spectrum("get").toRgbString(); //  .toHexString();

            var id = $(this).attr('id');

            for (var indy in colorsDialogContrStory) {
                if (colorsDialogContrStory[indy].ctr == id) {

                    //update value
                    objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, colorsDialogContrStory[indy].json, changecolor);

                    objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);


                }
            }

        });

        // story-size-font
        $('#story-size-font').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#story-size-font-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'storyTextSize', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#story-size-font-value').html(linew);
        });


        // legend-size-font
        $('#legend-size-font').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#legend-size-font-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'legendTextSize', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#legend-size-font-value').html(linew);
        });


    }

    function initPreferenceBlock() {

        $('#preference-padding-right').slider({ min: 0, max: 80 });
        $('#preference-padding-top').slider({ min: 0, max: 80 });
        $('#preference-size-font').slider({ min: 10, max: 36 });

        // preference-padding-right
        var preference_padding_right = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'preferencePadHBorder');
        $('#preference-padding-right').slider("option", "value", preference_padding_right);
        $('#preference-padding-right-value').html(preference_padding_right);

        // story
        var preference_padding_top = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'preferencePadVBorder');
        $('#preference-padding-top').slider("option", "value", preference_padding_top);
        $('#preference-padding-top-value').html(preference_padding_top);

        // preference-size-font
        var preference_size_font = objChartMain.commonutils.func.valueForKey(objPlugin.info.preference, 'preferenceFontSize');
        $('#preference-size-font').slider("option", "value", preference_padding_top);
        $('#preference-size-font-value').html(preference_size_font);


        var opacityv = 1;

        colorsDialogContrStory.push(
              { ctr: 'legend-color-bk', json: 'legendBKColor', opacity: opacityv },
              { ctr: 'story-color-bk', json: 'storyBKColor', opacity: opacityv },
              { ctr: 'story-color-text', json: 'storyColor', opacity: opacityv }
         );



        // preference-size-font
        $('#preference-size-font').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#preference-size-font-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'preferenceFontSize', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#preference-size-font-value').html(linew);
        });


        // preference-padding-right
        $('#preference-padding-right').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#preference-padding-right-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'preferencePadHBorder', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#preference-padding-right-value').html(linew);
        });

        // preference-padding-top
        $('#preference-padding-top').on('slidechange', function () {
            var linew = $(this).slider("option", "value");
            $('#preference-padding-top-value').html(linew);

            //update value
            objChartMain.commonutils.func.updateValueByKey(objPlugin.info.preference, 'preferencePadVBorder', linew);

            objChartMain.chart.Plugins.UpdateSettings(objPlugin.info.id, objPlugin.info.preference);

        }).on('slide', function (event, ui) {
            var linew = ui.value;
            $('#preference-padding-top-value').html(linew);
        });


    }





    //*******************************************************************************************************************





    //*******************************************************************************************************************


    function initEventTab() {
        //tabs
        $(".properties-tabs").delegate('a', 'click', function () {
            var idx = $(this).index();
            $('.main-properties').each(function () {
                $(this).css('display', 'none');
            });
            $('.properties-tabs-label').each(function () {
                $(this).removeClass('active');
            });
            $('.main-properties').eq(idx).css('display', 'block');
            $(this).addClass('active');
        });
    }



    function initDialog(argtype, title) {


        var stringClose = "Close";
        var titleDialog = title;
        var templatename = "";

        //Get from localization
        if (typeof objChartMain.localizationobj != 'undefined') {
            stringClose = objChartMain.localizationobj.gui.returnLocalizationString("dialogs.common.button-close", "Close");
            titleDialog = objChartMain.localizationobj.gui.returnLocalizationString(objPlugin.info.id + ".title", title);
        }

        if (typeof objChartMain.init.TemplateName != 'undefined') {
            templatename = objChartMain.init.TemplateName;
        }



        $('<div id="chart-dialog" title="' + titleDialog + '"></div>').insertAfter('body');

        //Append to body parent
        // checkandCreateParent();


        $("#chart-dialog").dialog({
            dialogClass: "chart-ui-dialog plugin-dialog" + " " + templatename,
            draggable: true,
            autoOpen: false,
            resizable: false,
            closeOnEscape: true,
            width: 'auto',
            modal: true,
            open: function (event, ui) {
                addEyeButton($(this).parent());

                $('.ui-widget-overlay').last().addClass('chart-ui-widget-overlay');;

                //add z-index
                if (objChartMain.api.props) {
                    var zindex_dialog = objChartMain.api.props.chart.gui.layout.zindex_dialog;
                    $('.chart-ui-widget-overlay').css({ 'z-index': zindex_dialog });
                    $('.chart-ui-dialog').css({ 'z-index': zindex_dialog });
                }

                $('.ui-widget-overlay').bind('click', function () {
                    $('#chart-dialog').dialog('close');
                });

                //close preload
                objChartMain.preloadobj.endPreload();
            },
            close: function (event, ui) {
                clearDialog($(this).parent());
                $('#chart-dialog').remove();
                $('div.chart-ui-dialog.plugin-dialog  adv-buttons.eye-orange').off().remove();
                $('div.chart-ui-dialog.plugin-dialog').off().remove();
                $(this).off().empty().remove();
            },
            buttons: [{
                id: "btn-dialogs-close",
                text: stringClose,
                click: function () {
                    $(this).dialog("close");
                }
            }]
        });

        function clearDialog(parent) {
            // parent.find('#date-spinner-0').spinner("destroy");

            //remote color palette
            $(parent).find('.spectrum-color').each(function () {
                //console.log('find color');
                $(this).spectrum("destroy");
            });
        };


        function checkandCreateParent() {

            //Append to to diaolgs or create and append
            if ($('prochartdialog').length > 0) {
                $('prochartdialog').append($('<div id="chart-dialog" title="' + titleDialog + '"></div>'));
            } else {
                $('<prochartdialog><div id="chart-dialog" title="' + titleDialog + '"></div></prochartdialog>').insertAfter('body'); ;

            }

        }


        function addEyeButton(parent) {
            var buttoneye = '<button class="chart-button adv-buttons eye-orange " type="button" title="" ></button>';

            //$(buttoneye).insertBefore('.plugin-dialog .ui-dialog-buttonset').on('click', function () {
            $(parent).find('.ui-dialog-buttonset').prepend(buttoneye).on('click', function () {
                var opacity = $('.chart-ui-dialog.plugin-dialog').css('opacity');
                opacity = (opacity == 1) ? 0.5 : 1;
                var opacity2 = (opacity == 1) ? '' : 2;
                $('.chart-ui-dialog.plugin-dialog').css('opacity', opacity);
                $(this).css('opacity', opacity2);
            });
        }



    }


    //#endregion dialog


    return objPlugin;
}