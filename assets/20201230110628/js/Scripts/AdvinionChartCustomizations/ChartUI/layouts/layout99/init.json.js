{
  "init": {
    "charttype": [
      {
        "n": "Candlesticks",
        "id": "candlesticks",
        "f": 1
      }
    ],
    "size":
        {
          "panels":
            {
                "price":
                {
                    "legend":
                    {
                        "left": 1000
                    }
                },
                "legend":
                    {
                        "price":
                        {
                            "left": 1000
                        }
                    }
            }  
        }
  },
  "templates": [
    {
      "id": "default",
      "name": "default",
      "filecss": "",
      "folder": "/ChartUI/layouts/layout1/templates/default/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    },
    {
      "id": "template1",
      "name": "template1",
      "filecss": "template.css",
      "folder": "/ChartUI/layouts/layout1/templates/template1/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    },
    {
      "id": "template2",
      "name": "template2",
      "filencss": "template.css",
      "folder": "/ChartUI/layouts/layout1/templates/template2/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    },
    {
      "id": "template3",
      "name": "template3",
      "filencss": "template.css",
      "folder": "/ChartUI/layouts/layout1/templates/template3/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    },
    {
      "id": "template4",
      "name": "template4",
      "filencss": "template.css",
      "folder": "/ChartUI/layouts/layout1/templates/template4/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    },
    {
      "id": "template5",
      "name": "template5",
      "filencss": "template.css",
      "folder": "/ChartUI/layouts/layout1/templates/template5/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    },
    {
      "id": "template6",
      "name": "template6",
      "filencss": "template.css",
      "folder": "/ChartUI/layouts/layout1/templates/template6/",
      "previewimg": "preview.png",
      "color": "",
      "description": "",
      "author": "",
      "date": ""
    }
  ],
  "chart": {
    "Symbol": "USD/GBP",
    "TimeScale": "30M",
    "PriceChartType": "area",
    "ShowBarData": "false"
  },
  "gui": {
      "size":
      {
          "panels":
          {
              "price":
              {
                  "legend":
                  {
                      "left": 1000
                  }
              },
              "legend":
                  {
                      "price":
                      {
                          "left": 1000
                      }
                  }
          }  
      },
    "header": {
      "visible": true
    },
    "toolbox": {
      "visible": true,
      "tools": {
        "visible": true
      },
      "trade": {
        "visible": true
      },
      "draw": {
        "visible": true
      },
      "signal": {
        "visible": true
      },
      "view": {
        "visible": true
      }
    },
    "menu": {
      "visible": true,
      "majors": {
        "visible": true
      },
      "template": {
        "visible": true
      },
      "charttype": {
        "visible": true
      },
      "timeframe": {
        "visible": true
      },
      "studies": {
        "visible": true
      },
      "compares": {
        "visible": true
      },
      "localization": {
        "visible": true
      },
      "help": {
        "visible": true
      },
      "about": {
        "visible": true
      }
    },
    "toolbar": {
      "visible":true,
      "charttype": {
        "visible": true
      },
      "timeframe": {
        "visible": true
      },
      "systems": {
        "visible": true
      },
      "other": {
        "visible": true
      }
    },
    "zoom": {
      "visible": true,
      "zoomtoolbar": {
        "visible": true
      }
    }
  },
  "panels" : {
        "unit": "px",
        "padding": [0, 0, 0, 0],
        "spiltmargin": [0, 0, 0, 0],
        "margin": [0, 0, 0, 0],
        "price": {
            "grow": 4,
            "axisy": {
                "view": true,
                "width": 55,
                "right": 0,
                "padding": [0, 0, 0, 0]
            },
            "axisx": {
                "view": true,
                "height": 27,
                "right": 55,
                "bottom": 0,
                "padding": [0, 0, 0, 0]
            },
            "main": {
                "top": 0,
                "left": 0,
                "right": 55,
                "bottom": 27,
                "padding": [0, 0, 0, 0]
            },
            "legend": {
                "view": true,          
                "height": "inherit",
                "top": 2,
                "left": 3,
                "right": 110,
                "padding": [0, 0, 0, 0]
            },
            "controlpanel": {
                "view": true,
                "height": 16,
                "width": 48,
                "right": 65,
                "top": 2
            },
            "zoom": {
                "view": true,
                "height": 40,
                "bottom": 40,
                "width": 185,
                "left": "center",
                "right": "center",
                "padding": [0, 0, 0, 0]
            }
        },
        "study": {
            "grow": 1,
            "axisy": {
                "top": 0,
                "bottom": 0,
                "view": true,
                "width": 55,
                "right": 0,
                "padding": [0, 0, 0, 0]
            },
            "axisx": {
                "view": false,
                "height": 0,
                "right": 55,
                "bottom": 0,
                "padding": [0, 0, 0, 0]
            },
            "main": {
                "top": 0,
                "left": 0,
                "right": 55,
                "bottom": 0,
                "padding": [0, 0, 0, 0]
            },
            "legend": {
                "view": true,
                "height": 16,
                "top": 2,
                "left": 3,
                "right": 110,
                "padding": [0, 0, 0, 0]
            },
            "controlpanel": {
                "view": true,
                "height": 16,
                "width": 48,
                "right": 65,
                "top":2
            }
        },
        "splitterx": {
            "grow": 0,
            "height": 0,
            "main": {
                "top": -6,
                "view": true,
                "left": 0,
                "right": 0,
                "bottom": 0,
                "height": 10,
                "padding": [0, 0, 0, 0]
            }
        },
        "signal": {
            "grow":1,
            "main": {
                "top": 18,
                "left": 0,
                "right": 0,
                "bottom": 0,
                "padding": [0, 0, 0, 0]
            },
            "legend": {
                "view": true,           
                "height": 16,
                "top": 2,
                "left": 3,
                "right": 110,
                "padding": [0, 0, 0, 0]
            },
            "controlpanel": {
                "view": true,
                "height": 16,
                "width": 48,
                "right": 65,
                "top": 2
            },
            "alert": {
                "view": true,
                 "top":0,
                 "left": 0,
                 "bottom":0,
                 "right":0,
                 "padding": [0, 0, 0, 0]
            }
    }
  } 
}