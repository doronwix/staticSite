function ProChart_InitCurrentLayout(chartObject) {
    var objChartMain = chartObject;

    var objCurrentLayout = {
        layout: null,
        toolbars: null,
        menus: null,
        headers: null,
        panels: null,
        zooms: null,
        mode: null,
        patterns: {
            containter: null,
            top: null,
            left: null,
            right: null,
            bottom: null,
            main: null,
            mainchart: null,
            row: null
        },
        chart: {
            layoutiid: null,
            parent: null,
            width: 0,
            height: 0,
            top: 0,
            left: 0
        },
        workmode: {
            fullscreen: false,
            alwaysfullscreen: false
        }
    };

    objChartMain.currenlayout = objCurrentLayout;

    //#region layout structure
    objCurrentLayout.layout = {
        width: 660,
        height: 320,
        name: 'layout',
        items: [{
            type: "top",
            height: 'inherit',
            width: 'inherit',
            view: true,
            style: '',
            css: '',
            content: 'top',
            items: [{
                type: 'row',
                name: 'header',
                height: 40,
                width: 'inherit',
                view: true,
                style: '',
                css: '',
                content: 'row2',
                items: [
                   { type: "header", id: "header1" }
                ]
            }, {
                type: 'row',
                name: 'menu',
                height: 30,
                width: 'inherit',
                view: false,
                style: '',
                css: '',
                content: 'row0',
                items: [
                    { type: "menu", id: "mainmenu" }
                ]
            }, {
                type: 'row',
                name: 'toolbar',
                height: 50,
                width: 'inherit',
                view: true,
                style: '',
                css: '',
                content: 'row1',
                items: [
                     { type: 'toolbar', id: "toolbar1" }
                ]
            },
                { type: 'row', height: 30, name: 'toolbarno', width: 'inherit', style: '', css: '', content: 'row2', view: 'false' },
                {
                    type: 'row',
                    height: 40,
                    width: 'inherit',
                    name: 'toolbarmode2',
                    view: false,
                    style: '',
                    css: '',
                    content: 'row3',
                    items: [
                        { type: 'toolbar', id: "toolbar2" }
                    ]
                },
                { type: 'row', height: 30, width: 'inherit', style: '', css: '', content: 'row4' }
            ]
        }, {
            type: "right",
            width: '0',
            height: 'inherit',
            view: true,
            style: '',
            css: '',
            content: 'right',
            items: [
                { type: 'toolbar', id: "toolbar346" }
            ]
        }, {
            type: "main",
            width: 'inherit',
            height: 'inherit',
            style: '',
            css: '',
            content: 'main',
            items: [
                { type: 'chartcore', id: "chart_panel" },
                {
                    type: "bottom",
                    width: 'inherit',
                    height: 30,
                    view: true,
                    style: '',
                    css: '',
                    content: 'bottom',
                    name: 'mainbottom',
                    items: [{
                        type: 'row',
                        name: 'zoomrow',
                        height: 30,
                        width: 'inherit',
                        style: '',
                        css: '',
                        content: 'row22',
                        items: [{
                            type: 'zoom', id: "zoom1"
                        }]
                    }]
                }
            ]
        }, {
            type: "bottom",
            width: 'inherit',
            height: 40,
            view: false,
            style: '',
            css: '',
            content: 'bottom',
            items: []
        }]
    };
    //#endregion layout structure

    //#region toolbar
    objCurrentLayout.toolbars = [{
        name: "toolbar",
        id: "toolbar1",
        location: 'horizontal',
        more: {
            auto: true,
            captionview: true,
            spaceview: true,
            closebyclick: true,
            possition: "bottom",
            alignv: "auto",
            alignh: "auto",
            columns: 1
        },
        items: [
            { type: "button-custom", id: "toggleDealSlipView", icon: "expand-button", localize: "tools.general.exit_fullscreen", css: "expand-button", bind: 'visible: false' },
            { type: "space", id: "space1" },
            {
                type: "button-group",
                id: "group-7vv",
                localize: "tools.tools.delete_selected",
                icon: "delete-icon",
                caption: "Delete Selected Shape",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "auto",
                    alignh: "auto",
                    columns: 1,
                    css: "mobile-button-group ",
                    closebyclick: true,
                    changegroupicon: true
                },
                items: [
                    { type: "button", id: "delete_allstudies", localize: "tools.tools.delete_allstudies", icon: "delete-indicators", caption: "Delete All Studies" },
                    { type: "button", id: "delete_allshapes", localize: "tools.tools.delete_allshapes", icon: "delete-shapes", caption: "Delete All Shapes" },
                    { type: "button", id: "delete_selected", localize: "tools.tools.delete_selected", icon: "delete-icon", caption: "Delete Selected Shape" }
                ]
            },
            { type: "button-custom", id: "menu-compareform", icon: "compareform", caption: "Compare wizard:", localize: "menu.compares.opencompares" },
            { type: "button-custom", id: "menu-indicatorform", icon: "indicatorform", caption: "Indicators:", localize: "menu.indicators.openindicators" },
            { type: "button-custom", id: "tc-signals-button", viewtype: "text", localize: "tools.general.signals", caption: "Trading Central’s Signal" },
            {
                type: "button-group",
                id: "group-7z",
                localize: "tools.draw.draw_raylineright",
                icon: "ray-line",
                caption: "ray-line",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "right",
                    alignh: "right",
                    columns: 3,
                    css: " dropdown-three-columns ",
                    closebyclick: true,
                    changegroupicon: true,
                    viewtype: "icon"
                },
                items: [
                    { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                    { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" },
                    { type: "button", id: "draw_fibfan", localize: "tools.draw.draw_fibfan", icon: "fib-fan", caption: "Fibonacci fan" },
                    { type: "button", id: "draw_vline", localize: "tools.draw.draw_vline", icon: "vertical-line", caption: "Vertical Line" },
                    { type: "button", id: "draw_arc", localize: "tools.draw.draw_arc", icon: "draw-arc", caption: "Arc" },
                    { type: "button", id: "draw_cycleline", localize: "tools.draw.draw_cycleline", icon: "cycle-lines", caption: "Cycle lines" },
                    { type: "button", id: "draw_hline", localize: "tools.draw.draw_hline", icon: "horizontal-line", caption: "Horizontal Line" },
                    { type: "button", id: "draw_ellipse", localize: "tools.draw.draw_ellipse", icon: "ellipce", caption: "Ellipse" },
                    { type: "button", id: "draw_linearreg", localize: "tools.draw.draw_linearreg", icon: "regression-channel", caption: "Linear regression" },
                    { type: "button", id: "draw_line", localize: "tools.draw.draw_line", icon: "trendline", caption: "Trend line" },
                    { type: "button", id: "draw_polygon", localize: "tools.draw.draw_polygon", icon: "polygon", caption: "Polygon" },
                    { type: "button", id: "draw_gansquare", localize: "tools.draw.draw_gansquare", icon: "fib-gann-square", caption: "Gann square" },
                    { type: "button", id: "draw_extendedline", localize: "tools.draw.draw_extendedline", icon: "extended-line", caption: "Extended line" },
                    { type: "button", id: "draw_text", localize: "tools.draw.draw_text", icon: "text-tool", caption: "Text" },
                    { type: "button", id: "draw_fibtimeextension", localize: "tools.draw.draw_fibtimeextension", icon: "fib-time-extentsion", caption: "Time-extension" },
                    { type: "button", id: "draw_arrow", localize: "tools.draw.draw_arrow", icon: "arrow", caption: "Arrow" },
                    { type: "button", id: "draw_fork", localize: "tools.draw.draw_fork", icon: "adrews_pitchfork", caption: "Andrews Pitchfork" },
                    { type: "button", id: "draw_ganfan", localize: "tools.draw.draw_ganfan", icon: "fib-gannfan", caption: "Gann fan" },
                    { type: "button", id: "draw_parallel", localize: "tools.draw.draw_parallel", icon: "parallel-lines", caption: "Parallel line" },
                    { type: "button", id: "draw_fibextension", localize: "tools.draw.draw_fibextension", icon: "fib-extension", caption: "Fibo. extension" },
                    { type: "button", id: "draw_fibarc", localize: "tools.draw.draw_fibarc", icon: "fib-arc", caption: "Fibonacci arc" },
                    { type: "button", id: "draw_measure", localize: "tools.draw.draw_measure", icon: "measure", caption: "Measure" },
                    { type: "button", id: "draw_fibtimezones", localize: "tools.draw.draw_fibtimezones", icon: "fib-timezone", caption: "Fibo.Time-zones" },
                    { type: "button", id: "draw_fibretrace", localize: "tools.draw.draw_fibretrace", icon: "fib-retracement", caption: "Fibo.Retracement" }
                ]
            },
            {
                type: "button-group",
                id: "group-timescale",
                localize: "menu.timescale." + (chartObject.ExtraData.TimeScale ? chartObject.ExtraData.TimeScale : "1M"),
                title1: "",
                title2: "",
                css: "mobile-button-group ",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "auto",
                    alignh: "auto",
                    columns: 2,
                    css: " dropdown-timeframes ",
                    closebyclick: true,
                    changegroupicon: true,
                    grouptype: "timescale",
                    viewtype: "text"
                },
                items: [
                    { type: "button-group-timeframe", id: "timeframe" },
                ]
            },
            {
                type: "button-group",
                id: "group-1",
                localize: "menu.charttype.candlesticks",
                icon: "candlesticks",
                caption: "candlesticks",
                css: "mobile-button-group first-mobile-button-group ",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "auto",
                    alignh: "auto",
                    columns: 1,
                    css: "",
                    closebyclick: true,
                    changegroupicon: true,
                    grouptype: "charttype"
                },
                items: [
                    { type: "button-group-charttype", id: "charttype" }
                ]
            }
        ]
    }, {
        name: "toolbar",
        id: "toolbar2",
        location: 'horizontal',
        more: {
            auto: true,
            captionview: true,
            spaceview: true,
            closebyclick: true,
            possition: "bottom",
            alignv: "auto",
            alignh: "auto",
            columns: 1
        },
        items: [
            { type: "button-custom", id: "toggleDealSlipView", icon: "expand-button", localize: "tools.general.fullscreen", css: "expand-button" },
            { type: "space", id: "space2" },
            {
                type: "button-group",
                id: "group-7vv",
                localize: "tools.tools.delete_selected",
                icon: "delete-icon",
                caption: "Delete Selected Shape",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "auto",
                    alignh: "auto",
                    columns: 1,
                    css: "mobile-button-group ",
                    closebyclick: true,
                    changegroupicon: false
                },
                items: [
                        { type: "button", id: "delete_allstudies", localize: "tools.tools.delete_allstudies", icon: "delete-indicators", caption: "Delete All Studies" },
                        { type: "button", id: "delete_allshapes", localize: "tools.tools.delete_allshapes", icon: "delete-shapes", caption: "Delete All Shapes" },
                        { type: "button", id: "delete_selected", localize: "tools.tools.delete_selected", icon: "delete-icon", caption: "Delete Selected Shape" }
                ]
            },
            { type: "button-custom", id: "menu-compareform", icon: "compareform", caption: "Compare wizard:", localize: "menu.compares.opencompares" },
            { type: "button-custom", id: "menu-indicatorform", icon: "indicatorform", caption: "Indicators:", localize: "menu.indicators.openindicators" },
            { type: "button-custom", id: "tc-signals-button", viewtype: "text", localize: "tools.general.signals", caption: "Trading Central’s Signal" },
            {
                type: "button-group",
                id: "group-7z",
                localize: "tools.draw.draw_raylineright",
                icon: "ray-line",
                caption: "ray-line",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "right",
                    alignh: "right",
                    columns: 3,
                    css: " dropdown-three-columns ",
                    closebyclick: true,
                    changegroupicon: true,
                    viewtype: "icon"
                },
                items: [
                       { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                       { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" },
                       { type: "button", id: "draw_fibfan", localize: "tools.draw.draw_fibfan", icon: "fib-fan", caption: "Fibonacci fan" },
                       { type: "button", id: "draw_vline", localize: "tools.draw.draw_vline", icon: "vertical-line", caption: "Vertical Line" },
                       { type: "button", id: "draw_arc", localize: "tools.draw.draw_arc", icon: "draw-arc", caption: "Arc" },
                       { type: "button", id: "draw_cycleline", localize: "tools.draw.draw_cycleline", icon: "cycle-lines", caption: "Cycle lines" },
                       { type: "button", id: "draw_hline", localize: "tools.draw.draw_hline", icon: "horizontal-line", caption: "Horizontal Line" },
                       { type: "button", id: "draw_ellipse", localize: "tools.draw.draw_ellipse", icon: "ellipce", caption: "Ellipse" },
                       { type: "button", id: "draw_linearreg", localize: "tools.draw.draw_linearreg", icon: "regression-channel", caption: "Linear regression" },
                       { type: "button", id: "draw_line", localize: "tools.draw.draw_line", icon: "trendline", caption: "Trend line" },
                       { type: "button", id: "draw_polygon", localize: "tools.draw.draw_polygon", icon: "polygon", caption: "Polygon" },
                       { type: "button", id: "draw_gansquare", localize: "tools.draw.draw_gansquare", icon: "fib-gann-square", caption: "Gann square" },
                       { type: "button", id: "draw_extendedline", localize: "tools.draw.draw_extendedline", icon: "extended-line", caption: "Extended line" },
                       { type: "button", id: "draw_text", localize: "tools.draw.draw_text", icon: "text-tool", caption: "Text" },
                       { type: "button", id: "draw_fibtimeextension", localize: "tools.draw.draw_fibtimeextension", icon: "fib-time-extentsion", caption: "Time-extension" },
                       { type: "button", id: "draw_arrow", localize: "tools.draw.draw_arrow", icon: "arrow", caption: "Arrow" },
                       { type: "button", id: "draw_fork", localize: "tools.draw.draw_fork", icon: "adrews_pitchfork", caption: "Andrews Pitchfork" },
                       { type: "button", id: "draw_ganfan", localize: "tools.draw.draw_ganfan", icon: "fib-gannfan", caption: "Gann fan" },
                       { type: "button", id: "draw_parallel", localize: "tools.draw.draw_parallel", icon: "parallel-lines", caption: "Parallel line" },
                       { type: "button", id: "draw_fibextension", localize: "tools.draw.draw_fibextension", icon: "fib-extension", caption: "Fibo. extension" },
                       { type: "button", id: "draw_fibarc", localize: "tools.draw.draw_fibarc", icon: "fib-arc", caption: "Fibonacci arc" },
                       { type: "button", id: "draw_measure", localize: "tools.draw.draw_measure", icon: "measure", caption: "Measure" },
                       { type: "button", id: "draw_fibtimezones", localize: "tools.draw.draw_fibtimezones", icon: "fib-timezone", caption: "Fibo.Time-zones" },
                       { type: "button", id: "draw_fibretrace", localize: "tools.draw.draw_fibretrace", icon: "fib-retracement", caption: "Fibo.Retracement" }
                ]
            },
            {
                type: "button-group",
                id: "group-timescale",
                localize: "menu.timescale." + (chartObject.ExtraData.TimeScale ? chartObject.ExtraData.TimeScale : "1M"),
                title1: "",
                title2: "",
                css: "mobile-button-group ",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "auto",
                    alignh: "auto",
                    columns: 2,
                    css: " dropdown-timeframes ",
                    closebyclick: true,
                    changegroupicon: true,
                    grouptype: "timescale",
                    viewtype: "text"
                },
                items: [
                    { type: "button-group-timeframe", id: "timeframe" },
                ]
            },
            {
                type: "button-group",
                id: "group-1",
                localize: "menu.charttype.candlesticks",
                icon: "candlesticks",
                caption: "candlesticks",
                css: "mobile-button-group first-mobile-button-group ",
                group: {
                    type: "tooltip",
                    possition: "bottom",
                    alignv: "auto",
                    alignh: "auto",
                    columns: 1,
                    css: "",
                    closebyclick: true,
                    changegroupicon: true,
                    grouptype: "charttype"
                },
                items: [
                    { type: "button-group-charttype", id: "charttype" }
                ]
            }
        ]
    }];
    //#endregion toolbar

    //#region panel
    objCurrentLayout.chart_panels = {
        id: "chart_panel",
        unit: "px",
        padding: [10, 0, 0, 0],
        spiltmargin: [0, 0, 0, 0],
        margin: [0, 0, 0, 0],
        price: {
            grow: 4,
            axisy: {
                view: true,
                width: 70,
                right: 0,
                padding: [0, 0, 0, 0]
            },
            axisxinmain: {
                view: true,
                height: 11,
                bottom: 0,
                top: 'auto',
                width: '100%',
                padding: [0, 0, 0, 0]
            },
            axisx: {
                view: true,
                height: 27,
                right: 70,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            main: {
                top: 0,
                left: 0,
                right: 70,
                bottom: 27,
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                width: 'none',
                top: 'none',
                height: 'none'
            },
            collapselegend: {
                view: false,
                height: 13,
                top: 2,
                left: 2,
                width: 13,
                collapseopen: true,
                title_1: "+",
                title_2: "-"
            },
            controlpanel: {
                view: true,
                height: 16,
                width: 'none',
                right: 'none'
            },
            zoom: {
                view: true,
                height: 40,
                bottom: 40,
                width: 200,
                padding: [0, 0, 0, 0]
            }
        },
        study: {
            grow: 1,
            axisy: {
                top: 0,
                bottom: 0,
                view: true,
                width: 65,
                right: 0,
                padding: [0, 0, 0, 0]
            },
            axisx: {
                view: false,
                height: 0,
                right: 65,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            main: {
                top: 0,
                left: 0,
                right: 65,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                height: 16,
                top: 2,
                left: 3,
                right: 110,
                padding: [0, 0, 0, 0]
            },
            controlpanel: {
                view: true,
                height: 16,
                width: 43,
                right: 65,
                top: 2
            }
        },
        splitterx: {
            grow: 0,
            height: 0,
            main: {
                top: -6,
                view: true,
                left: 0,
                right: 0,
                bottom: 0,
                height: 10,
                padding: [0, 0, 0, 0]
            }
        },
        signal: {
            grow: 1,
            main: {
                top: 18,
                left: 0,
                right: 0,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                height: 16,
                top: 2,
                left: 3,
                right: 110,
                padding: [0, 0, 0, 0]
            },
            controlpanel: {
                view: true,
                height: 16,
                width: 43,
                right: 65,
                top: 2
            },
            alert: {
                view: true,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                padding: [0, 0, 0, 0]
            }
        }
    };
    //#endregion panel

    //#region menu
    objCurrentLayout.menus = {
        click: true,
        hover: false,
        closebyclick: true,
        items: [
            {
                name: "menu",
                id: "mainmenu",

                more: {
                    auto: true,
                    captionview: true,
                    spaceview: true,
                    possition: "bottom",
                    possition_sub1: "left",
                    alignv: "auto",
                    alignh: "auto"
                },
                items: [
                    {
                        type: "menu-item-group",
                        id: "majors",
                        caption: "Majors",
                        localize: "menu.majors.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                            { type: 'menu-group-majors', id: "group-majors" },
                            { type: 'menu-item', id: "menu-majorform", caption: "More majors", localize: "menu.majors.openmajors" },
                            { type: 'menu-item', id: "menu-headersymbolsearch", caption: "Search", localize: "menu.majors.symbolsearch" }
                        ]
                    },
                    {
                        type: "menu-item-group",
                        id: "charttype",
                        caption: "Chart type",
                        localize: "menu.charttype.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                            { type: 'menu-group-charttype', id: "group-charttype", favorites: true, icons: true }
                        ]
                    },
                    {
                        type: "menu-item-group",
                        id: "timeframe",
                        caption: "Time scales",
                        localize: "menu.timescale.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                            { type: 'menu-group-timeframe', id: "group-timeframe", favorites: true, icons: true }
                        ]
                    },
                    {
                        type: "menu-item-group",
                        id: "studies",
                        caption: "Studies",
                        localize: "menu.indicators.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                            { type: 'menu-group-indicators', id: "group-indicators" },
                            { type: 'menu-item', id: "menu-indicatorform", caption: "Indicators:", localize: "menu.indicators.openindicators" }
                        ]
                    },
                    {
                        type: "menu-item-group",
                        id: "compares",
                        caption: "Compare",
                        localize: "menu.compares.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                            { type: 'menu-group-compares', id: "group-compares" },
                            { type: 'menu-item', id: "menu-compareform", caption: "Compare wizard:", localize: "menu.compares.opencompares" }
                        ]
                    },
                    {
                        type: "menu-item-group",
                        id: "templates",
                        caption: "Templates",
                        localize: "menu.templates.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                        ]
                    },
                    {
                        type: "menu-item-group",
                        id: "localization",
                        caption: "Localization",
                        localize: "menu.localization.title",
                        group: {
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: ""
                        },
                        items: [
                            { type: 'menu-group-localizations', id: "group-localizations" }
                        ]
                    },
                    { type: "menu-item", id: "about", caption: "About", localize: "menu.about.title" },
                    { type: "menu-item", id: "help", caption: "Help", localize: "menu.help.title" }
                ]
            }
        ]
    };

    //#endregion menu

    //#region header
    objCurrentLayout.headers = [{
        id: "header1",
        unit: "px",
        items: [
            {
                type: 'searchbutton',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 'auto',
                    left: 0,
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            },
            {
                type: 'symboltitle',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 'auto',
                    left: 35,
                    top: 'auto',
                    bottom: 'auto',
                    view: false
                }
            }, {
                type: 'searchsymbol',
                search: true,
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 'auto',
                    left: 35,
                    top: 'auto',
                    bottom: 'auto',
                    view: false
                }
            }, {
                type: 'timeframe',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 'auto',
                    left: 170,
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            }, {
                type: 'communic',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 0,
                    left: 'auto',
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            }, {
                type: 'lastupdate',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 25,
                    left: 'auto',
                    top: 'auto',
                    bottom: 'auto',
                    view: true,
                }
            }, {
                type: 'htmlcontainer',
                id: 'htm11',
                content: "",
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 225,
                    left: 'auto',
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            }]
    }];
    //#endregion header

    //#region zoom
    objCurrentLayout.zooms = [{
        id: "zoom1",
        unit: "px",
        items: [{
            type: 'chart_container',
            possition: {
                height: 25,
                width: 'auto',
                right: 0,
                left: 0,
                top: 'auto',
                bottom: 0,
                view: true
            }
        }, {
            type: 'slider1',
            possition: {
                height: 30,
                width: 'auto',
                right: 20,
                left: 20,
                top: 50,
                bottom: 'auto',
                view: false
            }
        }]
    }];
    //#endregion zoom

    //#region mode
    objCurrentLayout.mode = {
        items: [
            {
                id: "collapsed",
                tasks: [
                    { type: "row", name: "header", actions: [{ action: 'hide', properties: {} }] },
                    { type: "row", name: "menu", actions: [{ action: 'hide', properties: {} }] },
                    { type: "row", name: "toolbar", actions: [{ action: 'hide', properties: {} }] },
                    { type: "bottom", name: "mainbottom", actions: [{ action: 'hide', properties: {} }] },
                    { type: "col", name: "toolbar1", actions: [{ action: 'hide', properties: {} }] },
                    { type: "left", name: "", actions: [{ action: 'hide', properties: {} }] },
                    { type: "row", name: "toolbarmode2", actions: [{ action: 'show', properties: {} }] },
                    { type: "col", name: "colleftmode3", actions: [{ action: 'hide', properties: {} }] },
                    { type: "panel", name: "controlpanel", actions: [{ action: 'hide', properties: {} }] },
                    { type: "panel", name: "zoom", actions: [{ action: 'show', properties: {} }] },
                    { type: "panel", name: "legend", actions: [{ action: 'show', properties: {} }] }
                ]
            },
            {
                id: "expanded",
                tasks: [
                    { type: "row", name: "header", actions: [{ action: 'hide', properties: {} }] },
                    { type: "row", name: "menu", actions: [{ action: 'hide', properties: {} }] },
                    { type: "row", name: "toolbar", actions: [{ action: 'show', properties: {} }] },
                    { type: "bottom", name: "mainbottom", actions: [{ action: 'show', properties: {} }] },
                    { type: "col", name: "toolbar1", actions: [{ action: 'show', properties: {} }] },
                    { type: "left", name: "", actions: [{ action: 'show', properties: {} }] },
                    { type: "row", name: "toolbarmode2", actions: [{ action: 'hide', properties: {} }] },
                    { type: "col", name: "colleftmode3", actions: [{ action: 'hide', properties: {} }] },
                    { type: "panel", name: "controlpanel", actions: [{ action: 'show', properties: {} }] },
                    { type: "panel", name: "zoom", actions: [{ action: 'show', properties: {} }] },
                    { type: "panel", name: "legend", actions: [{ action: 'show', properties: {} }] }
                ]
            }
        ]
    };
    //#endregion mode

    return objCurrentLayout;
}