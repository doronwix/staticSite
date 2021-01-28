function PivotLibrary(objChartContainer){


	var marrHLineIDS = [], strTargetLine=null,strTargetLabel=null,strAlternateLine=null,strAlternateLabel=null,strTrendLine=null, strPreTrendLine=null, strCSPatMarker = null;
	var marrImportantRates;
	var objThis = this;
	var IChart = objChartContainer.chart;
	var IShapes = IChart.Shapes;
	var mobjResource = IChart["LocalizationManager"]["gui"];
	var mstrLegendUID = "";
	
	//This logic will update the data object with data based on partial given data from TC and data from the Chart
	this["PerformTCLogicOnData"] = function (objDataItem, iSma20, iSma50, iSma20And50, iMacd0, iMacdSL, iBBands, iRsi30, iRsi70, iVolume) {
		
		var objPivot = objDataItem.pivot;
		
		//
		// Pivot
		//
		//Don't draw line which are similar to pivot
		if (objPivot.res1 == objPivot.pivot) {
			objPivot.res1 = 0;	//Don't draw it
			objPivot.direction = -1;	//It's a bear
			objPivot.target = objPivot.sup1;
			objPivot.failure = objPivot.res2;
		}
		else if (objPivot.sup1 == objPivot.pivot) {
			objPivot.sup1 = 0;	//Don't draw it
			objPivot.direction = 1;	//It's a bull
			objPivot.target = objPivot.res1;
			objPivot.failure = objPivot.sup2;
		}
		else
			objPivot.direction = 0;	//It's a side
		
		
		//
		// RSI
		//
		if (iRsi30 != null || iRsi70 != null)
		{//{"direction": -1, "parameter1": 14, "valueB": 75.0, "valueA": 61.0, "parameter2": 9, "dateA": 1528278000000, "dateB": 1528344000000, "type": "overbought"}
			var objRSI = {};
			objDataItem.rsi = objRSI;
			
			objRSI.direction = objPivot.direction;
			objRSI.parameter1 = 14;
			objRSI.parameter2 = 9;
			objRSI.valueA = 0;
			objRSI.valueB = 0;
			objRSI.dateA = 0;
			objRSI.dateB = 0;
			objRSI.type = (iRsi30 != null ? "oversold" : "overbought");
		}
		
		//
		// SMA
		//
		if (iSma20 != null || iSma50 != null || iSma20And50 != null)
		{/*{"valueF": 10658.0, "direction": -1, "valueD": 10662.0, "parameter1": 5, "valueA": 10659.0, "parameter3": 20, "parameter2": 10, "valueE": 10662.0, 
				"dateA": 1528276800000, "dateB": 1528277400000, "valueC": 10657.0, "type": "crossover", "valueB": 10660.0} */
			var objSMA = {};
			objDataItem.sma = objSMA;
			
			objSMA.direction = objPivot.direction;
			
			if (iSma20And50 != null) {
				objSMA.parameter1 = 20;
				objSMA.parameter2 = 50;	
				objSMA.parameter3 = 0;
				if (iSma20And50 == 1)
					objSMA.type = "crossover";
				else if (iSma20And50 == -1)
					objSMA.type = "crossunder";
			}
			else if (iSma20 != null) {
				objSMA.parameter1 = 20;
				objSMA.parameter2 = 0;	
				objSMA.parameter3 = 0;
				if (iSma20 == 1)
					objSMA.type = "crossover";
				else if (iSma20 == -1)
					objSMA.type = "crossunder";
			}
			else if (iSma50 != null) {
				objSMA.parameter1 = 50;
				objSMA.parameter2 = 0;	
				objSMA.parameter3 = 0;
				if (iSma50 == 1)
					objSMA.type = "crossover";
				else if (iSma50 == -1)
					objSMA.type = "crossunder";
			}
			
			objSMA.valueA = 0;
			objSMA.valueB = 0;
			objSMA.valueC = 0;
			objSMA.valueD = 0;
			objSMA.valueE = 0;
			objSMA.valueF = 0;
			objSMA.dateA = 0;
			objSMA.dateB = 0;
			objSMA.type = (iRsi30 != null ? "oversold" : "overbought");
		}
		
		//
		// MACD
		//
		if (iMacd0 != null || iMacdSL != null)
		{//{"direction": -1, "parameter1": 14, "valueB": 75.0, "valueA": 61.0, "parameter2": 9, "dateA": 1528278000000, "dateB": 1528344000000, "type": "overbought"}
			var objMACD = {};
			objDataItem.macd = objMACD;
			
			objMACD.direction = objPivot.direction;
			objMACD.parameter1 = 12;
			objMACD.parameter2 = 26;
			objMACD.parameter3 = 9;
			objMACD.valueA = 0;
			objMACD.valueB = 0;
			objMACD.dateA = 0;
			objMACD.dateB = 0;
			if (iMacd0 == 1)
				objMACD.type = "upsidemomentum";
			else if (iMacd0 == -1)
				objMACD.type = "downsidemomentum";
			
			if (iMacdSL == 1)
				objMACD.type = "crossover";
			else if (iMacdSL == -1)
				objMACD.type = "crossunder";
		}
		
		//
		// BBANDS
		//
		if (iBBands != null)
		{//{"direction": -1, "parameter1": 20, "valueB": 10810.0, "valueA": 10795.0, "parameter2": 2.0, "dateA": 1528356000000, "dateB": 1528357200000, "type": "crossup"}
			var objBBAND = {};
			objDataItem.bbands = objBBAND;
			
			objBBAND.direction = objPivot.direction;
			objBBAND.parameter1 = 20;
			objBBAND.parameter2 = 2;
			objBBAND.valueA = 0;
			objBBAND.valueB = 0;
			objBBAND.dateA = 0;
			objBBAND.dateB = 0;
			objBBAND.type = (iBBands == -1 ? "crossdown" : "crossup");
		}
		
	}
	
	
	this["GetCleanDataObject"] = function() {
		
		return { "source" : "" ,
				"type": "signals",
				"subtype": "", 
				"target": "",
				"data": [
					{
						"rsi": null, 
						"created": 0, 
						"bbands": null,  
						"symbol": "EUR/USD", 
						"symbolname": "EUR/USD",
						"timescale": "1m", 
						"precision": 0, 
						"gap": null, 
						"cspattern": null, 
						"pivot": {
							"direction": 1, 
							"res1": 0,
							"res2": 0, 
							"res3": 0, 
							"sup1": 0, 
							"sup2": 0, 
							"sup3": 0, 
							"pivot": 0, 
							"valueA": 0,
							"valueB": 0, 
							"valueC": 0, 
							"dateA": 0, 
							"dateB": 0, 
							"dateC": 0, 
							"targetdate": 0, 
							"target": 0,
							"failure": 0 
						}, 
						"timezone": "0", 
						"sma": null
					}], 
					"story":""
			}
		
		
		
		
	}
	
	
	function AddLegend(objTAConfig, objTA) {
		
		var objLegend = {
				"uid": "",
				"closeBtn": true,
				"editIdx": "",
				"colors": [],
				"captions": [],
				"values": null,
				"type": "signals.tc",
				"sources": null,
				"params": null,
				"visible": true,
				"name": "TC"
			};
			
		var strTerm = (objTA.pivot.term !=null ? objTA.pivot.term.toLowerCase() : "st");
		
			
		//Add capption
		objLegend.captions.push(mobjResource["returnLocalizationString"]("signals.tradingcentral.legend."+strTerm, "TC"))
		//Set legend color from config
		var objStyle = objTAConfig["configuration"]["legend"];
		objLegend.colors.push(objStyle.color);
		mstrLegendUID = IChart.GetGUID();
		objLegend.uid = mstrLegendUID;
		objLegend.editIdx = IChart.GetGUID();
		IChart.AddExtrenalLegend(mstrLegendUID, objLegend);
		
	}
	
	this["ClearView"] = function() {
		//Delete previous lines
		for (var i=0 ; i<marrHLineIDS.length ; i++)
			IShapes.DeleteHLine("price",marrHLineIDS[i]);
		marrHLineIDS = [];
		
		
		IShapes.DeleteLine("price",strTargetLine);
		IShapes.DeleteLine("price",strAlternateLine);
		IShapes.DeleteLabel("price",strTargetLabel);
		IShapes.DeleteLabel("price",strAlternateLabel);
		IShapes.DeleteLine("price",strTrendLine);
		IShapes.DeleteLine("price",strPreTrendLine);
		IShapes.DeleteVRange("price", strCSPatMarker);
		IChart.AddInViewValues("price", "showallpoints", []);
		
		if (mstrLegendUID!=null && mstrLegendUID != "")
			IChart.DeleteExtrenalLegend(mstrLegendUID);
	};
	
	this["RenderTC"] = function(objTAConfig, objData) {
		this["RenderPivot"](objTAConfig, objData);
	}

	this["RenderPivot"] = function(objTAConfig, objTA) {

		var strStatus, strReason;
		var strColor;
		
		
		if (objTA == null || objTAConfig == null)
			return;
		
		this["ClearView"]();
		
		//$("#linkList").empty();
		
		objPivot = objTA.pivot;
		
		//Pivot not found (there must be atleast target or failure)
		if (objPivot.target == 0 && objPivot.failure ==0)
			return;
		
		/* For debug :: print values
		$.each( objTA, function( key, val ) {
		
			if (key == "complete")
				strColor = "blue";
			else if (key == "failed" || key == "faileddate" || key == "failedprice")
				strColor = "red";
			else if (key == "expired" || key == "expireddate")
				strColor = "orange";
			else if (key == "target" || key == "succeeded")
				strColor = "green";
			else
				strColor = "black";
				
			if (key == "statereason") {
				switch(val) {
					case 0: val = "scanning"; break;
					case 1: val = "reached target"; break;
					case 2: val = "expired"; break;
					case 3: val = "break under lastprice"; break;
					case 4: val = "break above lastprice"; break;
					case 5: val = "break above c"; break;
					case 6: val = "break under c"; break;
					case 7: val = "break above d"; break;
					case 8: val = "break under d"; break;
					case 9: val = "break above stoploss"; break;
					case 10: val = "break under stoploss"; break;
					case 11: val = "didnot reach target"; break;
					case 12: val = "monitoring for target"; break;
					default: val = "Unknown code " + val;
				}
				
				strReason = val;
			}
			
			if (val !== null && typeof val === 'object')  {
				//strTitle = JSON.stringify(val);
				//$("#linkList").append( "<li title='"+strTitle+"' id='" + key + "' style='color:"+strColor+"'>" + key + " = <...> </li>" );
				$.each( val, function( key1, val1 ) {
					if (key1 == "found" || key1.indexOf("date")>=0) 
						$("#linkList").append( "<li id='" + val + "' data='" + val1 + "' style='color:purple'><a href='#'>" + key +"." + key1 + " = " + val1 + "</a></li>" );
					else
						$("#linkList").append( "<li title='"+val+"' id='" + key1 + "' style='color:purple'>" + key +"." + key1 + " = " + val1 + "</li>" );
				});
				
			}
				
			else if (key == "found" || key.indexOf("date")>=0) 
				$("#linkList").append( "<li id='" + key + "' data='" + val + "' style='color:"+strColor+"'><a href='#'>" + key + " = " + val + "</a></li>" );
			else
				$("#linkList").append( "<li title='"+val+"' id='" + key + "' style='color:"+strColor+"'>" + key + " = " + val + "</li>" );
		  });
		  
		 $( "#linkList li a" ).each(function(index) {
			$(this).on("click", function(){
				  var date4Zoom = parseInt(this.parentElement.getAttribute("data"));
				  IChart.SetZoomOnDates(date4Zoom,date4Zoom,10,10);
			});
		});
		  
		//Sort list
		var mylist = $('#linkList');
		var listitems = mylist.children('li').get();
		listitems.sort(function(a, b) {
		   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
		})
		$.each(listitems, function(idx, itm) { mylist.append(itm); });
		*/

		
		strSymbol = objTA.symbol;
		strSymbolName = objTA.symbolname;
		strTimeScale = objTA.timescale.toUpperCase();	//TimeScales defined as uppercase
		
		lngLastDate4History = 0;
		lngHistorySize = 1000;	//Set last date
		
		//Make sure all important rates inside view port
		marrImportantRates = [];
		
		
		//Example for using resources
		//mstrTCTimeScale = mobjResource["returnLocalizationString"]("signals.tradingcentral.lines", "pivot");
		
		//Draw support and resistance
		var strField, strLabel;
		var objLineStyle;
		for (var i=1 ; i<=3 ; i++) {
			strField = "sup" + i;
			
			objLineStyle = objTAConfig["configuration"]["pivotlines"]["support" + i];
			if (objPivot[strField]!=0) {
				strLabel = mobjResource["returnLocalizationString"]("signals.tradingcentral.lines."+strField, strField);
				marrHLineIDS.push(IShapes.AddHLine("price",objPivot[strField],strLabel,objLineStyle.lineColor,objLineStyle.lineWidth,
									objLineStyle.dashStyle,objLineStyle.labelColor,objLineStyle.font,objLineStyle.alignment,
									objLineStyle.hPadding,objLineStyle.margins,objLineStyle.inPriceRange,objLineStyle.labelBKColor));
									
				//Show label on Price-Axis
				strLabel = mobjResource["returnLocalizationString"]("signals.tradingcentral.outOfRangeLabel."+strField, strField);
				IShapes.UpdateShape("price", marrHLineIDS[marrHLineIDS.length-1], 
								["outOfRangeAxisMarker", objLineStyle.outOfRangeAxisMarker, 
								"outOfRangeBoxColor", objLineStyle.outOfRangeBoxColor, 
								"outOfRangeTextColor", objLineStyle.outOfRangeTextColor, 
								"outOfRangeLabel", strLabel, 
								"boxColor" , objLineStyle.boxColor, 
								"boxTextColor", objLineStyle.boxTextColor], false);
				marrImportantRates.push(objPivot[strField]);
			}
			strField = "res" + i;
			objLineStyle = objTAConfig["configuration"]["pivotlines"]["resistance" + i];
			if (objPivot[strField]!=0) {
				strLabel = mobjResource["returnLocalizationString"]("signals.tradingcentral.lines."+strField, strField);
				marrHLineIDS.push(IShapes.AddHLine("price",objPivot[strField],strLabel,objLineStyle.lineColor,objLineStyle.lineWidth,
								objLineStyle.dashStyle,objLineStyle.labelColor,objLineStyle.font,objLineStyle.alignment,
								objLineStyle.hPadding,objLineStyle.margins,objLineStyle.inPriceRange,objLineStyle.labelBKColor));
				//Show label on Price-Axis
				strLabel = mobjResource["returnLocalizationString"]("signals.tradingcentral.outOfRangeLabel."+strField, strField);
				IShapes.UpdateShape("price", marrHLineIDS[marrHLineIDS.length-1], 
								["outOfRangeAxisMarker", objLineStyle.outOfRangeAxisMarker, 
								"outOfRangeBoxColor", objLineStyle.outOfRangeBoxColor, 
								"outOfRangeTextColor", objLineStyle.outOfRangeTextColor, 
								"outOfRangeLabel", strLabel, 
								"boxColor" , objLineStyle.boxColor, 
								"boxTextColor", objLineStyle.boxTextColor], false);
				marrImportantRates.push(objPivot[strField]);
			}
		
		}

		if (objPivot.pivot!=0) {
			strField = "pivot";
			objLineStyle = objTAConfig["configuration"]["pivotlines"]["pivot"];
			strLabel = mobjResource["returnLocalizationString"]("signals.tradingcentral.lines."+strField, strField);
			marrHLineIDS.push(IShapes.AddHLine("price",objPivot[strField],strLabel,objLineStyle.lineColor,objLineStyle.lineWidth,
								objLineStyle.dashStyle,objLineStyle.labelColor,objLineStyle.font,objLineStyle.alignment,
								objLineStyle.hPadding,objLineStyle.margins,objLineStyle.inPriceRange,objLineStyle.labelBKColor));
			//Show label on Price-Axis
			strLabel = mobjResource["returnLocalizationString"]("signals.tradingcentral.outOfRangeLabel."+strField, strField);
			IShapes.UpdateShape("price", marrHLineIDS[marrHLineIDS.length-1], 
							["outOfRangeAxisMarker", objLineStyle.outOfRangeAxisMarker, 
							"outOfRangeBoxColor", objLineStyle.outOfRangeBoxColor, 
							"outOfRangeTextColor", objLineStyle.outOfRangeTextColor, 
							"outOfRangeLabel", strLabel, 
							"boxColor" , objLineStyle.boxColor, 
							"boxTextColor", objLineStyle.boxTextColor], false)
			marrImportantRates.push(objPivot.pivot);
		}
		
		//IShapes.AddLine("price", strDate1, fValue1, strDate2, fValue2, strLineColor, iLineWidth, arrDashStyle, blnClipOutside);
		objLineStyle = objTAConfig["configuration"]["pivotlines"]["target"];
		strTargetLine = IShapes.AddLine("price", objPivot.dateC, objPivot.valueC, objPivot.targetdate, objPivot.target, objLineStyle.lineColor, 2, [], true);
		IShapes.UpdateShape("price", strTargetLine, [ "drawArrow", true, "arrowHeadSize", objLineStyle.arrowHeadSize]);
			
		
		
		//strTargetLabel = IShapes.AddLabel("price", objPivot.target, "Target", 60, 16, "green", "green", ["rgba(255,255,255,0.5"], [0,1], "Verdana 20", "date", 0, objPivot.targetdate, "left", 0);
		//marrImportantRates.push(objPivot.target);
		//strAlternateLine = IShapes.AddLine("price", objPivot.dateC, objPivot.valueC, objPivot.targetdate, objPivot.failure , "red", 2, [], true);
		//strAlternateLabel = IShapes.AddLabel("price", objPivot.failure, "Alternate", 60, 16, "red", "red", ["rgba(255,255,255,0.5"], [0,1], "Verdana 20", "date", 0, objPivot.targetdate, "left", 0);
		//marrImportantRates.push(objPivot.failure);
		
		strPreTrendLine = IShapes.AddLine("price", objPivot.dateA, objPivot.valueA, objPivot.dateB, objPivot.valueB, "black", 2, [], true);
		strTrendLine = IShapes.AddLine("price", objPivot.dateB, objPivot.valueB, objPivot.dateC, objPivot.valueC, "black", 2, [], true);
		
		objCSPat = objTA.cspattern;
		if (objCSPat != null ){
			strCSPatMarker = IShapes.AddVRange("price", objCSPat.valueA, objCSPat.valueB,"rgba(51,153,255,0.4)",false, [2,10,2,10]);
			objChartMain1.chart.Shapes.UpdateShape("price", strCSPatMarker, ["limitfromdate", objCSPat.dateA,"limittodate", objCSPat.dateB, "borderColor", "rgba(0,51,102,0.4)", "borderWidth", 2]);
		}
		
		objSMA = objTA.sma;
		objRSI = objTA.rsi;
		objBBands = objTA.bbands;
		objMACD = objTA.macd;
		
		
		objChartMain1.chart.DeleteAllStudies();
		
		if (objSMA != null ){
			var strStudyID = objChartMain1.chart.AddStudyExtended("sma",[[objSMA.parameter1]],null);
			var objStyle = objChartMain1.chart.GetStudyStyle(strStudyID);
			objStyle.stroke = "purple";
			objStyle.strokeWidth = 2;
			
			strStudyID = objChartMain1.chart.AddStudyExtended("sma",[[objSMA.parameter2]],null);
			objStyle = objChartMain1.chart.GetStudyStyle(strStudyID);
			objStyle.stroke = "red";
			objStyle.strokeWidth = 2;
			
			strStudyID = objChartMain1.chart.AddStudyExtended("sma",[[objSMA.parameter3]],null);
			objStyle = objChartMain1.chart.GetStudyStyle(strStudyID);
			objStyle.stroke = "orange";
			objStyle.strokeWidth = 2;
		}
		
		
		if (objRSI != null ){
			var strStudyID = objChartMain1.chart.AddStudyExtended("rsi",[[objRSI.parameter1], [objRSI.parameter2]],null);
		}
		
		if (objBBands != null ){
			var strStudyID = objChartMain1.chart.AddStudyExtended("bbands",[[objBBands.parameter1], [objBBands.parameter2]],null);
		}
		
		if (objMACD != null ){
			var strStudyID = objChartMain1.chart.AddStudyExtended("bbands",[[objMACD.parameter1], [objMACD.parameter2], [objMACD.parameter3]],null);
		}
		
		IChart.SetZoomOnDates(objPivot.dateB,objPivot.targetdate,100,40);
		
		AddLegend(objTAConfig, objTA);
		
		//For now no need to force all lines into view
		//if (marrImportantRates!=null && marrImportantRates.length > 0)
		//	IChart.AddInViewValues("price", "showallpoints", marrImportantRates);
	}
};