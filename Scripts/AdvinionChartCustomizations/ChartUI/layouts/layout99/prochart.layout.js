function ProChart_InitCurrentLayout(chartObject) {
    var objChartMain = chartObject;

    var objCurrentLayout = {
        layout: null,
        toolbars: null,
        menus: null,
        headers:null,
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
            top:0,
            left:0
        },
        workmode: {
            fullscreen: false,
            alwaysfullscreen: false
        }
    };


    objChartMain.currenlayout = objCurrentLayout;


//#region layout structure
    objCurrentLayout.layout = {
        width: 900,
        height: 900,
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
                        height: 36,
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
                        height: 30,
                        width: 'inherit',
                        name: 'toolbar2',
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
                        type: 'row',
                        name: 'toolbar1',
                        height: 260,
                        width: 'inherit',
                        view: true,
                        style: '',
                        css: '',
                        content: 'row1',
                        items: [
                            { type: 'toolbar', id: "toolbar4" }
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
                items: [
                    { type: 'toolbar', id: "toolbar346" }
                ]
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
                        height: 80,
                        view: true,
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
                { type: "button-custom", id: "global-props", icon: "config-icon", localize: "tools.general.globalproperties", css: "", caption: "Global properties 2" },
                { type: "button", id: "global-props", icon: "config-icon", localize: "tools.general.globalproperties", css: "", caption: "Global properties" },
                { type: "button", id: "screen-shot", icon: "camera", localize: "tools.general.screenshot", css: "", caption: "Screen shot" },
                { type: "button", id: "full-screen", icon: "zoom-full", localize: "tools.general.fullscreen", css: "full-screen", caption: "Full screen" },
                { type: "space", id: "space1" },  
                { type: "button", id: "system-get", icon: "system-get", localize: "tools.system.get", css: "system-get", caption: "Open System" },
                { type: "button", id: "system-set", icon: "system-set", localize: "tools.system.save", css: "system-set", caption: "Save System" },
                { type: "space", id: "space1" },  
                { type: "button", id: "signal_config", icon: "signals-config", localize: "tools.signals.config", css: "signals-config", caption: "Signals" },
                { type: "space", id: "space1" },  
                { type: "button", id: "draw_tradebuy", icon: "buy-icon2", localize: "tools.trade.draw_tradebuy", css: "draw_tradebuy", caption: "Long" },
                { type: "button", id: "draw_tradesell", icon: "sell-icon2", localize: "tools.trade.draw_tradesell", css: "draw_tradesell", caption: "Short" }
            ]
        },
        {
            name: "toolbar",
            id: "toolbar2",
            location: 'horizontal',
            more: {
                auto: true,
                captionview: false,
                spaceview: true,
                closebyclick: true,
                possition: "bottom",
                alignv: "auto",
                alignh: "auto",
                columns: 2
            },
            items: [
                { type: "caption", id: "title-tools", caption: "Tools:", localize: "tools.tools.title" },
                { type: "button", id: "pointer", localize: "tools.tools.pointer", icon: "pointer1-icon", caption: "Pointer" },
                { type: "button", id: "delete_selected", localize: "tools.tools.delete_selected", icon: "delete-icon", caption: "Delete Selected Shape" },
                { type: "button", id: "delete_allshapes", localize: "tools.tools.delete_allshapes", icon: "delete-shapes", caption: "Delete All Shapes" },
                { type: "button", id: "delete_allstudies", localize: "tools.tools.delete_allstudies", icon: "delete-indicators", caption: "Delete All Studies" },
                { type: "button", id: "duplicate_delected", localize: "tools.tools.duplicate_delected", icon: "many-windows-icon", caption: "Duplicate Selected Shape" },
                { type: "item", id: "zoom_in", localize: "tools.view.zoom_in", icon: "zoom-plus", caption: "Zoom-in" },
                { type: "space", id: "space1" },
                { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                { type: "button", id: "draw_vline", localize: "tools.draw.draw_raylineright", icon: "vertical-line", caption: "Vertical Line" },
                { type: "button", id: "draw_hline", localize: "tools.draw.draw_hline", icon: "horizontal-line", caption: "Horizontal Line" },
                { type: "button", id: "draw_extendedline", localize: "tools.draw.draw_extendedline", icon: "extended-line", caption: "Extended line" },
                { type: "button", id: "draw_arrow", localize: "tools.draw.draw_arrow", icon: "arrow", caption: "Arrow" },
                { type: "button", id: "draw_line", localize: "tools.draw.draw_line", icon: "trendline", caption: "Trend line" },
                { type: "button", id: "draw_measure", localize: "tools.draw.draw_measure", icon: "measure", caption: "Measure" },
                { type: "button", id: "draw_parallel", localize: "tools.draw.draw_parallel", icon: "parallel-lines", caption: "Parallel line" },
                { type: "space", id: "space2" },
                {
                    type: "button-group",
                    id: "group-4",
                    localize: "tools.draw.draw_raylineright",
                    icon: "ray-line",
                    caption: "ray-line",
                    group: {
                        type: "tooltip",
                        possition: "top", // top/left/right/bottom
                        alignv: "auto",
                        alignh: "auto",
                        css: "",
                        closebyclick:true
                    },
                    items: [
                        { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                        { type: "button", id: "draw_vline", localize: "tools.draw.draw_raylineright", icon: "vertical-line", caption: "Vertical Line" },
                        { type: "button", id: "draw_hline", localize: "tools.draw.draw_hline", icon: "horizontal-line", caption: "Horizontal Line" },
                        { type: "button", id: "draw_extendedline", localize: "tools.draw.draw_extendedline", icon: "extended-line", caption: "Extended line" },
                        { type: "button", id: "draw_arrow", localize: "tools.draw.draw_arrow", icon: "arrow", caption: "Arrow" },
                        { type: "button", id: "draw_line", localize: "tools.draw.draw_line", icon: "trendline", caption: "Trend line" },
                        { type: "button", id: "draw_measure", localize: "tools.draw.draw_measure", icon: "measure", caption: "Measure" },
                        { type: "button", id: "draw_parallel", localize: "tools.draw.draw_parallel", icon: "parallel-lines", caption: "Parallel line" },
                        { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" },
                        { type: "button", id: "draw_arc", localize: "tools.draw.draw_arc", icon: "draw-arc", caption: "Arc" },
                        { type: "button", id: "draw_ellipse", localize: "tools.draw.draw_ellipse", icon: "ellipce", caption: "Ellipse" },
                        { type: "button", id: "draw_triangle", localize: "tools.draw.draw_triangle", icon: "triangle", caption: "Triangle" },
                        { type: "button", id: "draw_circle", localize: "tools.draw.draw_circle", icon: "circle", caption: "Circle" },
                        { type: "button", id: "draw_polygon", localize: "tools.draw.draw_polygon", icon: "polygon", caption: "Polygon" },
                        { type: "button", id: "draw_text", localize: "tools.draw.draw_text", icon: "text-tool", caption: "Text" }
                    ]
                },
                { type: "space", id: "space3" },
                { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" },
                { type: "button", id: "draw_arc", localize: "tools.draw.draw_arc", icon: "draw-arc", caption: "Arc" },
                { type: "button", id: "draw_ellipse", localize: "tools.draw.draw_ellipse", icon: "ellipce", caption: "Ellipse" },
                { type: "button", id: "draw_circle", localize: "tools.draw.draw_circle", icon: "circle", caption: "Circle" },
                { type: "button", id: "draw_triangle", localize: "tools.draw.draw_triangle", icon: "triangle", caption: "Triangle" },
                { type: "button", id: "draw_polygon", localize: "tools.draw.draw_polygon", icon: "polygon", caption: "Polygon" },
                { type: "button", id: "draw_text", localize: "tools.draw.draw_text", icon: "text-tool", caption: "Text" },
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
                { type: "button", id: "draw_cycleline", localize: "tools.draw.draw_cycleline", icon: "cycle-lines", caption: "Cycle lines" },
                { type: "space", id: "space3" },
                { type: "button", id: "zoom_in", localize: "tools.view.zoom_in", icon: "zoom-plus", caption: "Zoom-in" },
                { type: "button", id: "zoom_out", localize: "tools.view.zoom_out", icon: "zoom-minus", caption: "Zoom-out" },
                { type: "button", id: "zoom_left", localize: "tools.view.zoom_left", icon: "zoom-left", caption: "Zoom left" },
                { type: "button", id: "zoom_right", localize: "tools.view.zoom_right", icon: "zoom-right", caption: "Zoom right" },
                { type: "button", id: "zoom-all", localize: "tools.view.zoom_all", icon: "zoom-all", caption: "View all" },
                { type: "button", id: "zoom-default", localize: "zoom_default", icon: "zoom-default", caption: "Default zoom" }
            ]
        },
        {
            name: "toolbar",
            id: "toolbar3",
            location: 'horizontal',
            more: {
                auto: true,
                captionview: false,
                spaceview: true,
                closebyclick: true,
                possition: "bottom",
                alignv: "auto",
                alignh: "auto",
                columns: 1
            },
            items: [
                {
                    type: "button-group",
                    id: "group-1",
                    localize: "tools.view.zoom_in",
                    icon: "zoom-plus",
                    caption: "Pointer",
                    group: {
                        type: "menu",
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        css: "",
                        closebyclick: true,
                        columns: 2
                    },
                    items: [
                        { type: "item", id: "zoom_in", localize: "tools.view.zoom_in", icon: "zoom-plus", caption: "Zoom-in" },
                        { type: "item", id: "zoom_out", localize: "tools.view.zoom_out", icon: "zoom-minus", caption: "Zoom-out" },
                        { type: "item", id: "zoom_left", localize: "tools.view.zoom_left", icon: "zoom-left", caption: "Zoom left" },
                        { type: "item", id: "zoom_right", localize: "tools.view.zoom_right", icon: "zoom-right", caption: "Zoom right" },
                        { type: "item", id: "zoom-all", localize: "tools.view.zoom_all", icon: "zoom-all", caption: "View all" },
                        { type: "item", id: "zoom-default", localize: "zoom_default", icon: "zoom-default", caption: "Default zoom" }
                    ]
                },
                {
                    type: "button-group",
                    id: "group-2",
                    localize: "tools.view.zoom_in",
                    icon: "zoom-plus",
                    caption: "Pointer",
                    group: {
                        type: "tooltip",
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 1,
                        css: "",
                        closebyclick: false
                    },
                    items: [
                        { type: "button", id: "zoom_in", localize: "tools.view.zoom_in", icon: "zoom-plus", caption: "Zoom-in" },
                        { type: "button", id: "zoom_out", localize: "tools.view.zoom_out", icon: "zoom-minus", caption: "Zoom-out" },
                        { type: "button", id: "zoom_left", localize: "tools.view.zoom_left", icon: "zoom-left", caption: "Zoom left" },
                        { type: "button", id: "zoom_right", localize: "tools.view.zoom_right", icon: "zoom-right", caption: "Zoom right" },
                        { type: "button", id: "zoom-all", localize: "tools.view.zoom_all", icon: "zoom-all", caption: "View all" },
                        { type: "button", id: "zoom-default", localize: "zoom_default", icon: "zoom-default", caption: "Default zoom" }
                    ]
                },
                {
                    type: "button-group",
                    id: "group-3",
                    localize: "menu.charttype.heikinashi",
                    icon: "heikinashi",
                    caption: "Heikinashi",
                    group: {
                        type: "tooltip",
                        possition: "bottom",
                        alignv: "auto",
                        alignh: "auto",
                        columns: 1,
                        css: "",
                        closebyclick: false
                    },
                    items: [
                        { type: "button-group-charttype", id: "charttype" }
                    ]
                },
                { type: "caption", id: "", caption: "Analysis:", localize: "tools.system.title" },
                { type: "button", id: "system-get", icon: "system-get", localize: "tools.system.get", css: "system-get", caption: "Open System" },
                { type: "button", id: "system-set", icon: "system-set", localize: "tools.system.save", css: "system-set", caption: "Save System" },
                { type: "caption", id: "", caption: "Signals:", localize: "tools.signals.title" },
                { type: "button", id: "signal_config", icon: "signals-config", localize: "tools.signals.config", css: "signals-config", caption: "Signals" },
                { type: "caption", id: "", caption: "Trade:", localize: "tools.system.title" },
                { type: "button", id: "draw_tradebuy", icon: "buy-icon2", localize: "tools.trade.draw_tradebuy", css: "draw_tradebuy", caption: "Long" },
                { type: "button", id: "draw_tradesell", icon: "sell-icon2", localize: "tools.trade.draw_tradesell", css: "draw_tradesell", caption: "Short" }
            ]
        },
        {
            name: "toolbar",
            id: "toolbar4",
            location: 'vertical',
            more: {
                auto: true,
                captionview: false,
                spaceview: true,
                closebyclick: true,
                possition: "right",
                alignv: "top",
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
                        columns: 1,
                        css: "",
                        closebyclick: true
                    },
                    items: [
                        { type: "button", id: "draw_rayline", localize: "tools.draw.draw_raylineright", icon: "ray-line", caption: "Ray" },
                        { type: "button", id: "draw_vline", localize: "tools.draw.draw_raylineright", icon: "vertical-line", caption: "Vertical Line" },
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
                        columns: 1,
                        css: "",
                        closebyclick: true
                    },
                    items: [
                        { type: "button", id: "draw_rect", localize: "tools.draw.draw_rect", icon: "rectangle", caption: "Rectangle" },
                        { type: "button", id: "draw_arc", localize: "tools.draw.draw_arc", icon: "draw-arc", caption: "Arc" },
                        { type: "button", id: "draw_ellipse", localize: "tools.draw.draw_ellipse", icon: "ellipce", caption: "Ellipse" },
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
                        columns: 1,
                        css: "",
                        closebyclick: true
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
                { type: "space", id: "space3", location: 'horizontal' },
                { type: "button", id: "zoom_in", localize: "tools.view.zoom_in", icon: "zoom-plus", caption: "Zoom-in" },
                { type: "button", id: "zoom_out", localize: "tools.view.zoom_out", icon: "zoom-minus", caption: "Zoom-out" },
                { type: "button", id: "zoom_left", localize: "tools.view.zoom_left", icon: "zoom-left", caption: "Zoom left" },
                { type: "button", id: "zoom_right", localize: "tools.view.zoom_right", icon: "zoom-right", caption: "Zoom right" },
                { type: "button", id: "zoom-all", localize: "tools.view.zoom_all", icon: "zoom-all", caption: "View all" },
                { type: "button", id: "zoom-default", localize: "zoom_default", icon: "zoom-default", caption: "Default zoom" }
            ]
        }
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
            axisx: {
                view: true,
                height: 27,
                right: 55,
                bottom: 0,
                padding: [0, 0, 0, 0]
            },
            main: {
                top: 0,
                left: 0,
                right: 55,
                bottom: 27,
                padding: [0, 0, 0, 0]
            },
            legend: {
                view: true,
                height: 'inherit',
                top: 12,
                left: 23,
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
            zoom: {
                view: true,
                height: 40,
                bottom: 40,
                width: 185,
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
                    view: true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 0,
                        top: 'auto',
                        bottom: 'auto'
                    }
                },
                {
                    type: 'symboltitle',
                    view: true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 35,
                        top: 'auto',
                        bottom: 'auto'
                    }
                },
                {
                    type:'searchsymbol',
                    view: true,
                    search: true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 35,
                        top: 'auto',
                        bottom: 'auto'
                    }
                },
                {
                    type:'timeframe', 
                    view:true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 'auto',
                        left: 170,
                        top: 'auto',
                        bottom: 'auto'
                    }
                },
                {
                    type:'communic', 
                    view: true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 0,
                        left: 'auto',
                        top: 'auto',
                        bottom: 'auto'
                    }
                },
                {
                    type:'lastupdate', 
                    view: true,
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 25,
                        left: 'auto',
                        top: 'auto',
                        bottom: 'auto'
                    }
                },
                {
                    type: 'htmlcontainer',
                    id:'htm11',
                    view: true,
                    content:"",
                    possition: {
                        height: 'auto',
                        width: 'auto',
                        right: 225,
                        left: 'auto',
                        top: 'auto',
                        bottom: 'auto'
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
        view: true,
        possition: {
            height: 30,
            width: 'auto',
            right: 0,
            left: 0,
            top: 10,
            bottom: 'auto'
        }
    },    
    {
        type: 'slider1',
        view: true,
        possition: {
            height:  30,
            width: 'auto',
            right: 20,
            left: 20,
            top: 50,
            bottom: 'auto'
        }
    },
    {
        type: 'daterange',
        view: true,
        possition: {
            height: 'auto',
            width: 'auto',
            right: 'auto',
            left: 35,
            top: 'auto',
            bottom: 'auto'
        }
    }
]
}];
//#endregion zoom

    
  return objCurrentLayout;
}

 
