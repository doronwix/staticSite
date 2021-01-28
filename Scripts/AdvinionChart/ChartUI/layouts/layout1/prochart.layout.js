// version 2.1
function ProChart_InitCurrentLayout(chartObject) {
    var objChartMain = chartObject;

    var objCurrentLayout = {
        version: "2.1",
        layout: null,
        toolbars: null,
        menus: null,
        headers:null,
        panels: null,
        zooms: null,
        mode:null,
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
            top:0,
            left:0
        },
        workmode: {
            fullscreen: false,
            alwaysfullscreen: false
        },
        timeframeview:"text", // icon/text
        buttontype: "icon" // 'fonticon' / 'icon'
    };


    objChartMain.currenlayout = objCurrentLayout;


//#region layout structure
    objCurrentLayout.layout = {
        width: 900,
        height: 600,
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
                     },
                     {
                        type: 'row',
                        name: 'menu',
                        height: 30,
                        width: 'inherit',
                        view: true,
                        style: '',
                        css: '',
                        content: 'row0',
                        items: [
                            { type: "menu", id: "mainmenu" }
                        ]
                    },
                    {
                        type: 'row',
                        name: 'toolbar',
                        height: 32,
                        width: 'inherit',
                        view: true,
                        style: '',
                        css: '',
                        content: 'row1',
                        items: [
                            { type: 'toolbar', id: "toolbar1" }
                           
                        ]
                    } 
                ]
            },
            {
                type: "left",
                width: '40',
                height: 'inherit',
                view: true,
                style: '',
                css: '',
                content: 'left',
                items: [
                    {
                        type: 'col',
                        name: 'toolbar1',
                        height: 'inherit',
                        width: '40',
                        left: '0',
                        top: '5',
                        view: true,
                        style: '',
                        css: '',
                        content: 'col',
                        items: [
                            { type: 'toolbar', id: "toolbar_left_vertical" }
                        ]
                    }
                    
                ]
            },
            {
                type: "right",
                width: '0',
                height: 'inherit',
                view: true,
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
                    { type: 'chartcore', id: "chart_panel" },
                    {
                        type: "bottom",
                        width: 'inherit',
                        height: 30,
                        view: true,
                        style: '',
                        css: '',
                        content: 'bottom',
                        name:"mainbottom",
                        items: [
                              {
                                type: 'row',
                                name: 'zoomrow',
                                height: 30,
                                width: 'inherit',
                                style: '',
                                css: '',
                                content: 'row22',
                                items: [
                                    { type: 'zoom', id: "zoom1" }
                                ]
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
//#endregion layout structure

//#region toolbar

    objCurrentLayout.toolbars = [
//#region toolbar1    
        {
            name: "toolbar",
            id: "toolbar1",
            location:'horizontal',
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
                { type: "button", id: "pointer", localize: "tools.tools.pointer", icon: "pointer1-icon", caption: "Pointer" },
                { type: "space", id: "space1" }, 
                 { type: "button-group-charttype", id: "charttype" },
                { type: "space", id: "space1" },  
                { type: "button-group-timeframe", id: "timeframe" },
                { type: "space", id: "space1" },
                //{ type: "button", id: "df", icon: "config-icon", localize: "", css: "", caption: "Test" ,  action:"eval" , evaldata:'objChartMain.api.props.alerts.gui.news.color="#ffffff"' },
                { type: "button", id: "global-props", icon: "config-icon", localize: "tools.general.globalproperties", css: "", caption: "Global properties" },
                { type: "button", id: "screen-shot", icon: "camera", localize: "tools.general.screenshot", css: "", caption: "Screen shot" },
                { type: "button", id: "full-screen", icon: "zoom-full", localize: "tools.general.fullscreen", css: "full-screen", caption: "Full screen" , buttonalign:'right'},
                { type: "space", id: "space1" },  
                { type: "button", id: "system-get", icon: "system-get", localize: "tools.system.get", css: "system-get", caption: "Open System" },
                { type: "button", id: "system-set", icon: "system-set", localize: "tools.system.save", css: "system-set", caption: "Save System" },
               ]
        },
 //#endregion toolbar1    
//#region toolbar_left_vertical        
        {
            name: "toolbar",
            id: "toolbar_left_vertical",
            location: 'vertical',
            more: {
                auto: true,
                captionview: false,
                spaceview: true,
                closebyclick: true,
                possition: "right",
                alignv: "bottom",
                alignh: "auto",
                columns: 3
            },
            items: [
                { type: "button", id: "delete_selected", localize: "tools.tools.delete_selected", icon: "delete-icon", caption: "Delete Selected Shape" },
                { type: "button", id: "delete_allshapes", localize: "tools.tools.delete_allshapes", icon: "delete-shapes", caption: "Delete All Shapes" },
                { type: "button", id: "delete_allstudies", localize: "tools.tools.delete_allstudies", icon: "delete-indicators", caption: "Delete All Studies" },
                { type: "button", id: "duplicate_delected", localize: "tools.tools.duplicate_delected", icon: "many-windows-icon", caption: "Duplicate Selected Shape" },
                { type: "space", id: "space1", location: 'horizontal' },
                {
                    type: "button-group",
                    id: "group-6",
                    localize: "tools.draw.draw_raylineright",
                    icon: "ray-line",
                    caption: "ray-line",
                    group: {
                        type: "tooltip",
                        possition: "right",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 8,
                        css: "",
                        closebyclick: true,
                        changegroupicon: true
                    },
                    items: [
                        { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                        { type: "button", id: "draw_vline", localize: "tools.draw.draw_vline", icon: "vertical-line", caption: "Vertical Line" },
                        { type: "button", id: "draw_hline", localize: "tools.draw.draw_hline", icon: "horizontal-line", caption: "Horizontal Line" },
                        { type: "button", id: "draw_extendedline", localize: "tools.draw.draw_extendedline", icon: "extended-line", caption: "Extended line" },
                        { type: "button", id: "draw_arrow", localize: "tools.draw.draw_arrow", icon: "arrow", caption: "Arrow" },
                        { type: "button", id: "draw_line", localize: "tools.draw.draw_line", icon: "trendline", caption: "Trend line" },
                        { type: "button", id: "draw_measure", localize: "tools.draw.draw_measure", icon: "measure", caption: "Measure" },
                        { type: "button", id: "draw_parallel", localize: "tools.draw.draw_parallel", icon: "parallel-lines", caption: "Parallel line" }
                    ]
                },
                {
                    type: "button-group",
                    id: "group-5",
                    localize: "tools.draw.draw_rect",
                    icon: "rectangle",
                    caption: "Rectangle",
                    group: {
                        type: "tooltip",
                        possition: "right",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 7,
                        css: "",
                        changegroupicon: true,
                        closebyclick: true
                    },
                    items: [
                        { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" },
                        { type: "button", id: "draw_arc", localize: "tools.draw.draw_arc", icon: "draw-arc", caption: "Arc" },
                        { type: "button", id: "draw_ellipse", localize: "tools.draw.draw_ellipse", icon: "ellipce", caption: "Ellipse" },
                        { type: "button", id: "draw_circle", localize: "tools.draw.draw_circle", icon: "circle", caption: "Circle" },
                        { type: "button", id: "draw_triangle", localize: "tools.draw.draw_triangle", icon: "triangle", caption: "Triangle" },
                        { type: "button", id: "draw_polygon", localize: "tools.draw.draw_polygon", icon: "polygon", caption: "Polygon" },
                        { type: "button", id: "draw_text", localize: "tools.draw.draw_text", icon: "text-tool", caption: "Text" }
                    ]
                },
                               
                {
                    type: "button-group",
                    id: "group-8",
                    localize: "tools.draw.draw_fibretrace",
                    icon: "fib-retracement",
                    caption: "Fibo Retracement",
                    group: {
                        type: "tooltip",
                        possition: "right",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 6,
                        css: "",
                        closebyclick: false
                    },
                    items: [
                        { type: "button", id: "draw_fork", localize: "tools.draw.draw_fork", icon: "adrews_pitchfork", caption: "Andrews Pitchfork" },
                        { type: "button", id: "draw_fibretrace", localize: "tools.draw.draw_fibretrace", icon: "fib-retracement", caption: "Fibo.Retracement" },
                        { type: "button", id: "draw_fibtimezones", localize: "tools.draw.draw_fibtimezones", icon: "fib-timezone", caption: "Fibo.Time-zones" },
                        { type: "button", id: "draw_fibfan", localize: "tools.draw.draw_fibfan", icon: "fib-fan", caption: "Fibonacci fan" },
                        { type: "button", id: "draw_fibarc", localize: "tools.draw.draw_fibarc", icon: "fib-arc", caption: "Fibonacci arc" },
                        { type: "button", id: "draw_ganfan", localize: "tools.draw.draw_ganfan", icon: "fib-gannfan", caption: "Gann fan" },
                        { type: "button", id: "draw_fibextension", localize: "tools.draw.draw_fibextension", icon: "fib-extension", caption: "Fibo. extension" },
                        { type: "button", id: "draw_fibtimeextension", localize: "tools.draw.draw_fibtimeextension", icon: "fib-time-extentsion", caption: "Time-extension" },
                        { type: "button", id: "draw_gansquare", localize: "tools.draw.draw_gansquare", icon: "fib-gann-square", caption: "Gann square" },
                        { type: "button", id: "draw_linearreg", localize: "tools.draw.draw_linearreg", icon: "regression-channel", caption: "Linear regression" },
                        { type: "button", id: "draw_cycleline", localize: "tools.draw.draw_cycleline", icon: "cycle-lines", caption: "Cycle lines" } 
                    ]
                },
                                {
                    type: "button-group",
                    id: "group-9",
                    localize: "tools.autotimescale.title",
                    icon: "",
                    caption: "Auto time scale",
                    title1: "A",
                    title2: "ts",
                    group: {
                        type: "menu",
                        possition: "right",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 9,
                        css: "",
                        closebyclick: true,
                        changegroupicon: false,
                        viewtype:"text"
                    },
                    items: [
                        { type: "item", id: "all", localize: "tools.autotimescale.all", icon: "", caption: "All" , action:"autotimescale" },
                        { type: "item", id: "5y", localize: "tools.autotimescale.5y", icon: "", caption: "5y",action:"autotimescale" },
                        { type: "item", id: "1y", localize: "tools.autotimescale.1y", icon: "", caption: "1y",action:"autotimescale" },
                        { type: "item", id: "ytd", localize: "tools.autotimescale.ytd", icon: "", caption: "ytd" ,action:"autotimescale"},
                        { type: "item", id: "6m", localize: "tools.autotimescale.6m", icon: "", caption: "6m" ,action:"autotimescale"},
                        { type: "item", id: "3m", localize: "tools.autotimescale.3m", icon: "", caption: "3m" ,action:"autotimescale"},
                        { type: "item", id: "1m", localize: "tools.autotimescale.1m", icon: "", caption: "1m" ,action:"autotimescale"},
                        { type: "item", id: "5d", localize: "tools.autotimescale.5d", icon: "", caption: "5d" ,action:"autotimescale"},
                        { type: "item", id: "1d", localize: "tools.autotimescale.1d", icon: "", caption: "1d",action:"autotimescale"}
                    ]
                },
                { type: "space", id: "space3", location: 'horizontal' },
                { type: "button", id: "zoom_in", localize: "tools.view.zoom_in", icon: "zoom-plus", caption: "Zoom-in" },
                { type: "button", id: "zoom_out", localize: "tools.view.zoom_out", icon: "zoom-minus", caption: "Zoom-out" },
                { type: "button", id: "zoom_left", localize: "tools.view.zoom_left", icon: "zoom-left", caption: "Zoom left" },
                { type: "button", id: "zoom_right", localize: "tools.view.zoom_right", icon: "zoom-right", caption: "Zoom right" },
                { type: "button", id: "zoom_all", localize: "tools.view.zoom_all", icon: "zoom-all", caption: "View all" },
                { type: "button", id: "zoom_default", localize: "tools.view.zoom_default", icon: "zoom-default", caption: "Default zoom" }
            ]
        },
//#endregion toolbar_left_vertical         
//#region toolbar_header_timeframe         
        {
            name: "toolbar",
            id: "toolbar_header_timeframe",
            location: 'horizontal',
            style:"background-color:transparent",
            more: {
                auto: true,
                captionview: true,
                spaceview: true,
                closebyclick: true,
                possition: "right",
                alignv: "right",
                alignh: "auto",
                columns: 1
            },
            items: [{
                        type: "button-group",
                        id: "group-header",
                        localize: "menu.timescale.1T",
                        icon: "tick",
                        caption: "tick",
                        style:"background-color:transparent; width:65px; ",
                        title1:"",
                        title2:"",
                        css: "header-timeframe",
                        captionview:true,
                        group: {
                            type: "menu",
                            possition: "bottom",
                            alignv: "auto",
                            alignh: "auto",
                            columns: 1,
                            css: "",
                            closebyclick: true,
                            changegroupicon: true,
                            grouptype: "timescale",
                            viewtype:"text" 
                            
                        },
                        items: [
                            { type: "button-group-timeframe", id: "timeframe" , captionview:true, viewall:false , css:"" } 

                        ]
                    }]
        }
//#endregion toolbar_header_timeframe    
    ];

    //#endregion toolbar

//#region panel
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
                width: 55,
                right: 0,
                padding: [0, 0, 0, 0]
            },
            axisxinmain: {
                view: true,
                height: 11,
                right: 55,
                //bottom: 0,
                bottom:0,
                top:'auto',
                padding: [0, 0, 0, 0]
            },
            axisx: {
                view: true,
                height: 27,
                right: 55,
                //bottom: 0,
                bottom:"relative",
                bottomrelative: "axisxmsg",
                padding: [0, 0, 0, 0]
            },
            axisxmsg: {
                view: false,
                height: 22,
                right: 55,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            main: {
                top: 0,
                left: 0,
                right: 55,
                //bottom: 27,
                bottom:"relative",
                bottomrelative: "axisx,axisxmsg",
                padding: [0, 0, 0, 0]
            },
            volume: {
                view: false,
                height: 60,
                right: 55,
                //bottom:"relative",
                //bottomrelative: "axisx,axisxalert", 
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                height: 'inherit',
                width: 'inherit',
                top: 12,
                left: 23,
                right: 'auto',
                padding: [0, 0, 0, 0],
                more:true
            },
            // from version 2.1
            collapselegend: {
                view: true,
                height: 13,
                top: 12,
                left: 2,
                width: 13,
                collapseopen:false,
                title_1:"+",
                title_2:"-"
            },
            watermark: {
                view: true,
                bottom: 20,
                left: 20,
                width:104,
                height:34,
                padding: [0, 0, 0, 0]
            },
            controlpanel: {
                view: true,
                height: 16,
                width: 43,
                right: 65,
                top: 2
            },
            zoom: {
                view: true,
                height: 40,
                //bottom:50,
                bottom: "relative",
                bottomrelative: "axisx,axisxmsg, 30",
                width: 185,
                left: 'center',
                right: 'center',
                padding: [0, 0, 0, 0]
            },
            htmlcontainers:{
                items:[
                    {
                        view: false,
                        height: 'inherit',
                        width: 'inherit',
                        right: 'auto',
                        left: 40,
                        top: 50,
                        content:'',
                        css:"",
                        bottom: 'auto',
                        items: [{ type: "toolbar", id: "toolbar_mainpanel_timeframe" }]
                    }
                ]
            }
        },
        study: {
            grow: 1,
            axisy: {
                top: 0,
                bottom: 0,
                view: true,
                width: 55,
                right: 0,
                padding: [0, 0, 0, 0]
            },
            axisx: {
                view: false,
                height: 0,
                right: 55,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            main: {
                top: 0,
                left: 0,
                right: 55,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                height: 'inherit',
                width: 'inherit',
                top: 2,
                left: 3,
                right: 'auto',
                padding: [0, 0, 0, 0]
            },
            controlpanel: {
                view: true,
                height: 16,
                width: 66,
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
                view: false,
                height: 16,
                top: 2,
                left: 3,
                right: 110,
                padding: [0, 0, 0, 0]
            },
            controlpanel: {
                view: true,
                height: 16,
                width: 55,
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
        closebyclick:true,
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
                    id: "majors",
                    caption: "Majors2",
                    localize: "menu.majors2.title",
                    group: {
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 1,
                        css: ""
                    },
                    items: [
                        { type: 'menu-group-majors2', id: "group-majors2" }
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
    ]};

//#endregion menu

//#region header
    objCurrentLayout.headers = [{
            id: "header1",
            unit: "px",
            items: [
                {
                    type:'searchbutton',  
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 0,
                        top: 'auto',
                        bottom: 'auto',
                        view: true,
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
                        view: true,
                    }
                },
                {
                    type:'searchsymbol',
                    search: true,
                    select:true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 35,
                        top: 'auto',
                        bottom: 'auto',
                        view: true,
                    }
                },
                {
                    type:'timeframe', 
                    relativeobject:'symboltitle2',
                    relativepossition:'right',
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 290,
                        top: 'auto',
                        bottom: 'auto',
                        view:false
                    }
                },
                {
                    type:'communic', 
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 0,
                        left: 'auto',
                        top: '5',
                        bottom: 'auto',
                        view: true
                    }
                },
                {
                    type:'lastupdate', 
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
                    type: 'toolbar',
                    id:'toolbar_header_timeframe',
                    toolbarid:"toolbar_header_timeframe1",
                    relativeobject:'symboltitle',
                    relativepossition:'right',
                    possition: {
                        height: 'auto',
                        width: 'inherit',
                        right: 'auto',
                        left: 10,
                        top: 2,
                        bottom: 'auto',
                        view: true
                    }
                }
                

            ]
    }];
//#endregion header


//#region zoom
objCurrentLayout.zooms = [{
    id: "zoom1",
    unit: "px",
    items: [
    {
        type: 'chart_container',
        possition: {
            height: 25,
            width: 'auto',
            right: 0,
            left: 0,
            top: 'auto',
            bottom: 0,
            view: true,
        }
    },    
    {
        type: 'slider1',
        possition: {
            height:  30,
            width: 'auto',
            right: 20,
            left: 20,
            top: 50,
            bottom: 'auto',
            view: false
        }
    },
    {
        type: 'daterange',
        possition: {
            height: 10,
            width: 200,
            right: 10,
            left: 'auto',
            top: 'auto',
            bottom: 'auto',
            view: false 
        }
    }
]
}];
//#endregion zoom


//mode
    objCurrentLayout.mode = {
        items: []};

    return objCurrentLayout;
}

 
