{
    "plugins": [
        {
            "id": "advinion_patterns",
            "description": "Advinion Chart Patterns",
            "path": "Plugins/advinion/signals/patterns/",
            "types": ["signals"],
            "initfunction": "ProChart_Init_plugin_advinion_patterns",
            "use": true
        },
		{
            "id": "advinion_fibonacci",
            "description": "Advinion Retracement",
            "path": "Plugins/advinion/signals/fibonacci/",
            "types": ["signals"],
            "initfunction": "ProChart_Init_plugin_advinion_fibonacci",
            "use": true
        },
		{
            "id": "advinion_cspatterns",
            "description": "Advinion CandleSticks Patterns",
            "path": "Plugins/advinion/signals/cspatterns/",
            "types": ["signals"],
            "modules": [{ "path": "Plugins/advinion/advinion.module1.js"}],
            "initfunction": "ProChart_Init_plugin_advinion_cspatterns",
            "use": true
        },
        {
            "id": "advinion_supportandresistance",
            "description": "Advinion Support And Resistance",
            "path": "Plugins/advinion/signals/supportandresistance/",
            "types": ["signals"],
            "initfunction": "ProChart_Init_plugin_advinion_supportandresistance",
            "use": true
        }],
	"disabledplugins": [{
           "id": "tradingcentral_bo",
           "description": "Trading Central For High Frequency",
           "path": "Plugins/tradingcentral/signals/bo/",
           "types": ["signals"],
           "initfunction": "ProChart_Init_plugin_tradingcentral_bo",
           "use": true
       },
        {
            "id": "tradingcentral_forex",
            "description": "Trading Central Signals For Forex",
            "path": "Plugins/tradingcentral/signals/forex/",
            "types": ["signals"],
            "initfunction": "ProChart_Init_plugin_tradingcentral_forex",
            "use": true
        }
    ]
}