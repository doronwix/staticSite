function ProChart_InitCurrentLayout(chartObject) {
    var objChartMain = chartObject;

    var objCurrentLayout = {
        layout: null,
        toolbars: null,
        menus: null,
        headers: null,
        panels: null,
        zooms: null,
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
        },
        timeframeview: "icon"
    };

    objChartMain.currenlayout = objCurrentLayout;

    objCurrentLayout.layout = {
        width: 600,
        height: 400,
        name: 'layout',
        items: [
            {
                type: "top",
                height: 'inherit',
                width: 'inherit',
                view: true,
                style: '',
                css: '',
                content: 'top',
                items: [
                    {
                        type: 'row',
                        name: 'toolbar',
                        height: 34,
                        width: 'inherit',
                        view: true,
                        style: '',
                        css: '',
                        content: 'row1',
                        items: [
                            { type: 'toolbar', id: "toolbar_main_wide" },
                            { type: 'toolbar', id: "toolbar_main_narrow" }
                        ]
                    }
                ]
            },
            {
                type: "left",
                width: '100',
                height: 'inherit',
                view: false,
                style: '',
                css: '',
                content: 'left',
                items: []
            },
            {
                type: "right",
                width: '0',
                height: 'inherit',
                view: false,
                style: '',
                css: '',
                content: 'right',
                items: []
            },
            {
                type: "main",
                width: 'inherit',
                height: 'inherit',
                style: '',
                css: '',
                content: 'main',
                items: [
                    {
                        type: 'chartcore',
                        id: "chart_panel"
                    },
                    {
                        type: "bottom",
                        width: 'inherit',
                        height: 80,
                        view: false,
                        style: '',
                        css: '',
                        content: 'bottom',
                        items: [
                            {
                                type: 'row',
                                name: 'zoomrow',
                                height: 80,
                                width: 'inherit',
                                style: '',
                                css: '',
                                content: 'row22',
                                items: []
                            }
                        ]
                    }
                ]
            },
            {
                type: "bottom",
                width: 'inherit',
                height: 40,
                view: false,
                style: '',
                css: '',
                content: 'bottom',
                items: []
            }
        ]
    };

    objCurrentLayout.toolbars = [
        {
            name: "toolbar_main_wide",
            id: "toolbar_main_wide",
            css: "toolbar-main toolbar-main-wide ",
            location: 'horizontal',
            items: [
                {
                    type: "button-group",
                    id: "group-7",
                    localize: "menu.charttype.candlesticks",
                    icon: "candlesticks",
                    caption: "candlesticks",
                    css: "mobile-button-group first-mobile-button-group menu-button-chart-type ",
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
                },
                {
                        type: "button-group",
                        id: "group-timescale",
                        localize: "menu.timescale." + (chartObject && chartObject.ExtraData && chartObject.ExtraData.TimeScale ? chartObject.ExtraData.TimeScale : "1M"),
                        title1: "",
                        title2: "",
                        css: "mobile-button-group menu-button-time-scale ",
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
                            { type: "button-group-timeframe", id: "timeframe" }
                        ]
                },
                {
                    type: "button-group",
                    id: "group-7z",
                    localize: "tools.draw.draw_extendedline",
                    icon: "extended-line",
                    caption: "Extended line",
                    css: "mobile-button-group menu-button-draw-extended-line ",
                    group: {
                        type: "tooltip",
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 3,
                        css: "",
                        closebyclick: true,
                        changegroupicon: true
                    },
                    items: [
                        { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                        { type: "button", id: "draw_arrow", localize: "tools.draw.draw_arrow", icon: "arrow", caption: "Arrow" },
                        { type: "button", id: "draw_vline", localize: "tools.draw.draw_vline", icon: "vertical-line", caption: "Vertical Line" },
                        { type: "button", id: "draw_line", localize: "tools.draw.draw_line", icon: "trendline", caption: "Trend line" },
                        { type: "button", id: "draw_hline", localize: "tools.draw.draw_hline", icon: "horizontal-line", caption: "Horizontal Line" },
                        { type: "button", id: "draw_measure", localize: "tools.draw.draw_measure", icon: "measure", caption: "Measure" },
                        { type: "button", id: "draw_extendedline", localize: "tools.draw.draw_extendedline", icon: "extended-line", caption: "Extended line" },
                        { type: "button", id: "draw_parallel", localize: "tools.draw.draw_parallel", icon: "parallel-lines", caption: "Parallel line" },
                        { type: "button", id: "draw_fork", localize: "tools.draw.draw_fork", icon: "adrews_pitchfork", caption: "Andrews Pitchfork" },
                        { type: "button", id: "draw_fibextension", localize: "tools.draw.draw_fibextension", icon: "fib-extension", caption: "Fibo. extension" },
                        { type: "button", id: "draw_fibretrace", localize: "tools.draw.draw_fibretrace", icon: "fib-retracement", caption: "Fibo.Retracement" },
                        { type: "button", id: "draw_fibtimeextension", localize: "tools.draw.draw_fibtimeextension", icon: "fib-time-extentsion", caption: "Time-extension" },
                        { type: "button", id: "draw_fibtimezones", localize: "tools.draw.draw_fibtimezones", icon: "fib-timezone", caption: "Fibo.Time-zones" },
                        { type: "button", id: "draw_gansquare", localize: "tools.draw.draw_gansquare", icon: "fib-gann-square", caption: "Gann square" },
                        { type: "button", id: "draw_fibfan", localize: "tools.draw.draw_fibfan", icon: "fib-fan", caption: "Fibonacci fan" },
                        { type: "button", id: "draw_linearreg", localize: "tools.draw.draw_linearreg", icon: "regression-channel", caption: "Linear regression" },
                        { type: "button", id: "draw_fibarc", localize: "tools.draw.draw_fibarc", icon: "fib-arc", caption: "Fibonacci arc" },
                        { type: "button", id: "draw_cycleline", localize: "tools.draw.draw_cycleline", icon: "cycle-lines", caption: "Cycle lines" },
                        { type: "button", id: "draw_ganfan", localize: "tools.draw.draw_ganfan", icon: "fib-gannfan", caption: "Gann fan" },
                        { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" }
                    ]
                },
                { type: "button-custom", id: "tc-signals-button", viewtype: "text", localize: "tools.general.signals", caption: "Trading Central’s Signal", css: "mobile-button-group" },
                {
                    type: "button",
                    id: "menu-indicatorform",
                    icon: "indicatorform",
                    caption: "Indicators:",
                    css: "mobile-button-group ",
                    localize: "menu.indicators.openindicators"
                },
                {
                    type: "button-group",
                    id: "group-7",
                    localize: "tools.tools.delete_selected",
                    icon: "delete-icon",
                    caption: "Delete Selected Shape",
                    css: "mobile-button-group menu-button-delete ",
                    group: {
                        type: "tooltip",
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 1,
                        css: "",
                        closebyclick: true
                    },
                    items: [
                        { type: "button", id: "delete_allstudies", localize: "tools.tools.delete_allstudies", icon: "delete-indicators", caption: "Delete All Studies" },
                        { type: "button", id: "delete_allshapes", localize: "tools.tools.delete_allshapes", icon: "delete-shapes", caption: "Delete All Shapes" },
                        { type: "button", id: "delete_selected", localize: "tools.tools.delete_selected", icon: "delete-icon", caption: "Delete Selected Shape" }
                    ]
                }
            ]
        },
        {
            name: "toolbar_main_narrow",
            id: "toolbar_main_narrow",
            css: "toolbar-main toolbar-main-narrow ",
            location: 'horizontal',
            items: [
                {
                    type: "button-group",
                    id: "group-7",
                    localize: "menu.charttype.candlesticks",
                    icon: "candlesticks",
                    caption: "candlesticks",
                    css: "mobile-button-group first-mobile-button-group menu-button-chart-type ",
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
                },
                {
                    type: "button-group",
                    id: "group-timescale",
                    localize: "menu.timescale." + (chartObject && chartObject.ExtraData && chartObject.ExtraData.TimeScale ? chartObject.ExtraData.TimeScale : "1M"),
                    title1: "",
                    title2: "",
                    css: "mobile-button-group menu-button-time-scale ",
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
                        { type: "button-group-timeframe", id: "timeframe" }
                    ]
                },
                { type: "button-custom", id: "tc-signals-button", viewtype: "text", localize: "tools.general.signals", caption: "Trading Central’s Signal", css: "mobile-button-group" },
                {
                    type: "button",
                    id: "menu-indicatorform",
                    icon: "indicatorform",
                    caption: "Indicators:",
                    css: "mobile-button-group ",
                    localize: "menu.indicators.openindicators"
                },
                {
                    type: "button-group",
                    id: "group-7",
                    localize: "tools.tools.delete_selected",
                    icon: "delete-icon",
                    caption: "Delete Selected Shape",
                    css: "mobile-button-group menu-button-delete ",
                    group: {
                        type: "tooltip",
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 1,
                        css: "",
                        closebyclick: true
                    },
                    items: [
                        { type: "button", id: "delete_allstudies", localize: "tools.tools.delete_allstudies", icon: "delete-indicators", caption: "Delete All Studies" },
                        { type: "button", id: "delete_allshapes", localize: "tools.tools.delete_allshapes", icon: "delete-shapes", caption: "Delete All Shapes" },
                        { type: "button", id: "delete_selected", localize: "tools.tools.delete_selected", icon: "delete-icon", caption: "Delete Selected Shape" }
                    ]
                }
            ]
        }
    ];

    objCurrentLayout.chart_panels = {
        id: "chart_panel",
        unit: "px",
        padding: [0, 0, 0, 0],
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
                height: 'inherit',
                top: 42,
                left: 12,
                right: 110,
                padding: [0, 0, 0, 0]
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
                view: false,
                height: 16,
                width: 43,
                right: 70,
                top: 2
            },
            zoom: {
                view: false,
                height: 40,
                bottom: 40,
                width: 200,
                left: 'center',
                right: 'center',
                padding: [0, 0, 0, 0]
            }
        },
        study: {
            grow: 1,
            axisy: {
                top: 0,
                bottom: 0,
                view: true,
                width: 70,
                right: 0,
                padding: [0, 0, 0, 0]
            },
            axisx: {
                view: false,
                height: 0,
                right: 70,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            main: {
                top: 0,
                left: 0,
                right: 70,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                height: 16,
                top: 0,
                left: 0,
                right: 72,
                padding: [0, 0, 0, 0]
            },
            controlpanel: {
                view: false,
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
                top: 0,
                left: 0,
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

    objCurrentLayout.menus = {
        click: true,
        hover: false,
        closebyclick: true,
        items: []
    };

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
                    view: true
                }
            },
            {
                type: 'searchsymbol',
                search: true,
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 'auto',
                    left: 35,
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            },
            {
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
            },
            {
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
            },
            {
                type: 'lastupdate',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 25,
                    left: 'auto',
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            },
            {
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
            }
        ]
    }];

    objCurrentLayout.zooms = [{
        id: "zoom1",
        unit: "px",
        items: [
            {
                type: 'chart_container',
                possition: {
                    height: 30,
                    width: 'auto',
                    right: 20,
                    left: 20,
                    top: 20,
                    bottom: 'auto',
                    view: true
                }
            },
            {
                type: 'slider1',
                possition: {
                    height: 30,
                    width: 'auto',
                    right: 20,
                    left: 20,
                    top: 50,
                    bottom: 'auto',
                    view: true
                }
            },
            {
                type: 'daterange',
                possition: {
                    height: 'auto',
                    width: 'auto',
                    right: 'auto',
                    left: 35,
                    top: 'auto',
                    bottom: 'auto',
                    view: true
                }
            }
        ]
    }];

    return objCurrentLayout;
}