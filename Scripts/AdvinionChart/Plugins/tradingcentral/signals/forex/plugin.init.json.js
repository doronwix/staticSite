{
    "id": "tradingcentral_forex",
    "providerId": "tradingcentral",
    "userCallback": null,
    "showTooltip": false,
    "countEnabled": false,
    "userCallback": null,
    "showOnlyLast": true,
    "defaultLanguage": "en-US",
    "rtFrequency": 300000,    
    "timeout": 60000,
    "request": "https://feed.tradingcentral.com/ws_ta.asmx/GetFeed?culture=$LANG&type_product=null&product=$PROD&term=$TERM&days=$DAYS&last_ta=$LAST&partner=$USER&token=$PASS",

    "font": "Verdana",
    "levelFontsize": 10,
    "levelsWidth": 1,
    "levelResistanceColor": "rgba(0,255,0,1)",
    "levelSupportColor": "rgba(255,0,0,1)",
    "levelPivotColor": "rgba(0,0,255,1)",
    "levelSidewayColor": "rgba(191,192,192,1)",
    "levelResistanceArrowColor": "rgba(0,128,0,1)",
    "levelSupportArrowColor": "rgba(128,0,0,1)",
    "levelResistanceValueColor": "rgba(255,255,255,1)",
    "levelSupportValueColor": "rgba(255,255,255,1)",
    "levelPivotValueColor": "rgba(255,255,255,1)",
    "showPreference": true,
    "preferenceFontSize": 17,
    "preferencePadHBorder": 10,
    "preferencePadVBorder": 18,
    "preferenceRiseColor": "rgba(0,255,0,1)",
    "preferenceDeclineColor": "rgba(255,0,0,1)",
    "showStory": true,
    "storyTextSize": 13,
    "storyColor": "rgba(0,0,0,1)",
    "storyBKColor": "rgba(255,255,255,1)",
    "showLegend": true,
    "legendTextSize": 13,
    "legendBKColor": "rgba(255,255,255,1)",
    "arrowHeadSize": 12,
    "panelRightPadForArrow":50,
    
    "leftBoxWidth": 30,
    "leftBoxPreLabelsGapX": 20,
    "leftBoxPreLabelsGapY": 6,
    "leftBoxArrowHeadWidth": 0,
    "leftBoxMarkersCornerRadius": 3,

    "rightBoxWidth": 45,
    "rightBoxPreLabelsGapX": 0,
    "rightBoxPreLabelsGapY": 6,
    "rightBoxArrowHeadWidth": 3,
    "rightBoxMarkersCornerRadius": 3,
    
    "languageCodesToAdvinion": {
        "japanese": "JP",
        "russian": "RU",
        "english": "EN",
        "french": "FR",
        "italian": "IT",
        "swiss": "SW",
        "german": "GR",
        "portuguese": "PT",
        "arabic": "AR",
        "spanish": "SP",
        "chinese": "CH",
        "korean": "KR",
        "DEFAULT": "English"
    },
    "languageCodesFromAdvinion": {
        "JP": "en-US",
        "RU": "ru-RU",
        "EN": "en-US",
        "FR": "fr-FR",
        "IT": "it-IT",
        "SW": "en-US",
        "GR": "de-DE",
        "DE": "de-DE",
        "PT": "en-US",
        "AR": "ar-AE",
        "SP": "es-ES",
        "ES": "es-ES",
        "CH": "zh-CN",
        "KR": "en-US",
        "TR": "tr-TR",
        "PL": "pl-PL",
        "MY": "ms-MY",
        "CZ": "cs-CZ",
        "HU": "hu-HU",
        "DEFAULT": "en-US"
    },

    "timescale": {
        "1m": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "5m": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "10m": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "15m": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "30m": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "60m": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "2h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "4h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "6h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "5h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "8h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "10h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "12h": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "1d": { "rtFreq" : 300000, "timescale" : "intraday", "days" : 1 },
        "1w": { "rtFreq" : 300000, "timescale" : "st", "days" : 7 },
        "1mon": { "rtFreq" : 300000, "timescale" : "st", "days" : 7 },
        "1y": { "rtFreq" : 300000, "timescale" : "st", "days" : 7 },
        "1q": { "rtFreq" : 300000, "timescale" : "st", "days" : 7 }
    },

    "texts": {
        "legend": [
                    { "label": "R1, R2, R3: Lines Represent Resistances", "font": "$font", "fontSize": "$legendTextSize", "color": "$levelResistanceColor" },
                    { "label": "S1, S2, S3: Lines Represent Support Levels", "font": "$font", "fontSize": "$legendTextSize", "color": "$levelSupportColor" },
                    { "label": "Pivot: Line is the pivot (or invalidation) point i.e.", "font": "$font", "fontSize": "$legendTextSize", "color": "$levelPivotColor" },
                    { "label": "where we would turn bullish from bearish, or bearish from bullish", "font": "$font", "fontSize": "$legendTextSize", "color": "$levelPivotColor" }
                    ],

        "preference": [
                    { "label": "Trading Central Preference", "font": "$font", "fontSize": "$preferenceFontSize", "color": "$dir_color" },
                    { "label": "$timeframe_range $dir_string", "font": "$font", "fontSize": "$preferenceFontSize", "color": "$dir_color" }
                    ],

        "story": [
                    { "label": "$story", "font": "$font", "fontSize": "$storyTextSize", "color": "$storyColor" }
                    ]
    }
   
}