define([
	"handlers/Ajaxer",
	"JSONHelper",
	"knockout",
	"global/UrlResolver",
	"handlers/general",
	"handlers/StringBuilder",
	"extensions/Date",
], function (tAjaxer, jsonhelper, ko, UrlResolver, General) {
	var _lastTimeRequest = timeStamp();

	function openDeal(newDeal, callback) {
		var ajaxer = new tAjaxer();
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.NewDeal;
			var result = analyzeResponse(responseText, eOrderActionType.NewDeal);

			callback(result, callerId, newDeal.instrumentID, newDeal);
		};

		var sb = new StringBuilder();

		sb.append(String.format("DealType={0}&", newDeal.dealType));
		sb.append(String.format("InstrumentId={0}&", newDeal.instrumentID));
		sb.append(String.format("Amount={0}&", newDeal.amount));
		sb.append(String.format("MarketRate={0}&", newDeal.marketRate));
		sb.append(String.format("OtherRateSeen={0}&", newDeal.otherRateSeen));
		sb.append(String.format("OrderDirection={0}&", newDeal.orderDir));
		sb.append(String.format("TakeProfitRate={0}&", newDeal.tpRate));
		sb.append(String.format("StopLossRate={0}&", newDeal.slRate));
		sb.append(String.format("SecurityToken={0}", systemInfo.securityToken));

		ajaxer.post("dalOrder/openDeal", "Deals/OpenDeal", sb.toString(), OnLoadComplete, function (error) {
			ErrorManager.onError("dalOrder/openDeal", error.message, eErrorSeverity.medium);
		});
	}

	function closeDeals(items, callback, config) {
		var ajaxer = new tAjaxer(),
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null;
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.CloseDeal;

			var result = analyzeResponse(responseText, eOrderActionType.CloseDeal);
			callback(result, callerId, unWrappedItems);
		};

		var sb = [],
			unWrappedItems = [];
		for (var i = 0, len = items.length; i < len; i++) {
			unWrappedItems[i] = ko.toJS(items[i]);
			sb.push(
				String.format(
					"{0}#{1}#{2}",
					unWrappedItems[i].positionNumber,
					unWrappedItems[i].spotRate,
					unWrappedItems[i].fwPips
				)
			);
		}

		var positions = sb.join("_");

		ajaxer.post(
			"dalOrder/closeDeals",
			"Deals/CloseDeals",
			String.format("positions={0}&SecurityToken={1}", positions, systemInfo.securityToken),
			OnLoadComplete,
			function (error) {
				ErrorManager.onError("dalOrder/closeDeals", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			}
		);
	}

	function addLimit(limit, callback, controller) {
		var ajaxer = new tAjaxer(),
			data = {
				limit: limit,
				SecurityToken: systemInfo.securityToken,
			};
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = limit.mode === eLimitMode.PriceAlert ? eOrderAction.NewPriceAlert : eOrderAction.NewLimit;
			var result = analyzeResponse(
				responseText,
				limit.mode === eLimitMode.PriceAlert ? eOrderActionType.NewPriceAlert : eOrderActionType.NewLimit
			);

			callback(result, callerId, limit.instrumentID, limit);
		};

		//--------------------------------
		if (controller) {
			ajaxer.jsonPost("dalOrder/addLimit", "Limits/AddLimit", JSON.stringify(data), OnLoadComplete, function (
				error
			) {
				ErrorManager.onError("dalOrder/addLimit", error.message, eErrorSeverity.medium);
			});
		} else {
			ajaxer.post(
				"dalOrder/addLimit",
				"api/limits/AddLimit",
				JSON.stringify(data),
				OnLoadComplete,
				function (error) {
					ErrorManager.onError("dalOrder/addLimit", error.message, eErrorSeverity.medium);
				}
			);
		}
	}

	function editLimit(limit, callback) {
		var ajaxer = new tAjaxer(),
			data = {
				limit: limit,
				SecurityToken: systemInfo.securityToken,
			};
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.EditLimit;
			var result = analyzeResponse(responseText, eOrderActionType.EditLimit);

			callback(result, callerId, limit);
		};

		ajaxer.post(
			"dalOrder/editLimit",
			"api/limits/EditLimit",
			JSON.stringify(data),
			OnLoadComplete,
			function (error) {
				ErrorManager.onError("dalOrder/editLimit", error.message, eErrorSeverity.medium);
			}
		);
	}

	function saveLimits(limits, callback) {
		var ajaxer = new tAjaxer(),
			data = {
				limits: limits,
				SecurityToken: systemInfo.securityToken,
			};
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.SaveLimits;
			var result = analyzeResponse(responseText);
			callback(result, callerId, null, limits);
		};

		ajaxer.post(
			"dalOrder/editLimit",
			"api/limits/SaveLimits",
			JSON.stringify(data),
			OnLoadComplete,
			function (error) {
				ErrorManager.onError("dalOrder/saveLimits", error.message, eErrorSeverity.medium);
			}
		);
	}

	function deleteLimit(limit, callback) {
		var ajaxer = new tAjaxer(),
			data = {
				limit: limit,
				SecurityToken: systemInfo.securityToken,
			};
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.DeleteLimit;

			var result = analyzeResponse(
				responseText,
				limit.mode === eLimitMode.PriceAlert ? eOrderActionType.DeletePriceAlert : eOrderActionType.DeleteLimit
			);
			callback(result, callerId, limit);
		};

		ajaxer.post(
			"dalOrder/deleteLimit",
			"api/limits/DeleteLimit",
			JSON.stringify(data),
			OnLoadComplete,
			function (error) {
				ErrorManager.onError("dalOrder/deleteLimit", error.message, eErrorSeverity.medium);
			}
		);
	}

	function deleteLimits(limits, callback) {
		var ajaxer = new tAjaxer(),
			data = {
				limits: limits,
				SecurityToken: systemInfo.securityToken,
			};
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.DeleteLimit;

			var result = analyzeResponse(
				responseText,
				limits[0].mode === eLimitMode.PriceAlert
					? eOrderActionType.DeletePriceAlert
					: eOrderActionType.DeleteLimit
			);
			callback(result, callerId, limits);
		};

		ajaxer.post(
			"dalOrder/deleteLimits",
			"api/limits/DeleteLimits",
			JSON.stringify(data),
			OnLoadComplete,
			function (error) {
				ErrorManager.onError("dalOrder/deleteLimits", error.message, eErrorSeverity.medium);
			}
		);
	}

	function deletePriceAlerts(priceAlerts, callback) {
		var ajaxer = new tAjaxer(),
			data = {
				limits: priceAlerts,
				SecurityToken: systemInfo.securityToken,
			};
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.DeleteLimit;

			var result = analyzeResponse(
				responseText,
				priceAlerts[0].mode === eLimitMode.PriceAlert
					? eOrderActionType.DeletePriceAlert
					: eOrderActionType.DeleteLimit
			);
			callback(result, callerId, priceAlerts);
		};

		ajaxer.post(
			"dalOrder/deleteLimits",
			"api/limits/DeleteLimits",
			JSON.stringify(data),
			OnLoadComplete,
			function (error) {
				ErrorManager.onError("dalOrder/deleteLimits", error.message, eErrorSeverity.medium);
			}
		);
	}

	function cashBackVolumes() {
		var ajaxer = new tAjaxer();
		_lastTimeRequest = timeStamp();

		var params = new StringBuilder();
		params.append(String.format("SecurityToken={0}", systemInfo.securityToken));

		var noCache = false;
		return ajaxer.promises
			.get(
				"dalOrder/cashBackVolumes",
				"Deals/CashBackGetVolumes",
				params.toString(),
				null,
				null,
				null,
				null,
				null,
				noCache
			)
			.then(function (responseText) {
				var result = analyzeResponse(responseText, eOrderActionType.CashBack);

				return result;
			})
			.fail(function (error) {
				ErrorManager.onError("dalOrder/cashBackVolumes", error.message, eErrorSeverity.medium);

				throw error;
			});
	}

	function getDealMarginDetails(instrumentId) {
		_lastTimeRequest = timeStamp();
		var ajaxer = tAjaxer();

		var params = new StringBuilder();
		params.append(String.format("instrumentId={0}", instrumentId));

		return ajaxer.promises
			.get(
				"dalOrder/getDealMarginDetails",
				"Deals/GetDealMarginDetails",
				params.toString(),
				null,
				null,
				1,
				null,
				null,
				false
			)
			.then(analyzeResponse)
			.fail(function (error) {
				ErrorManager.onError("dalOrder/getDealMarginDetails", error.message, eErrorSeverity.medium);

				throw error;
			});
	}

	function getMinDealAmounts() {
		var ajaxer = new tAjaxer();

		var minDealGroupId = UrlResolver.getMinDealGroupId();
		var minDealsVersion = UrlResolver.getMinDealsVersion();
		var minDealsHash = UrlResolver.getMinDealsHash();

		var staticInitialDataMinDealAmountsUrl = function () {
			return UrlResolver.getStaticInitialDataMinDealAmountsUrl(minDealGroupId, minDealsVersion, minDealsHash);
		};

		var initialDataMinDealAmountsFromOriginUrl = function () {
			return "InitialData/MinDealAmountsFromOrigin?groupId=" + minDealGroupId;
		};

		return ajaxer.promises
			.get("TDALNotificationData/getMinDealAmounts", staticInitialDataMinDealAmountsUrl())
			.then(analyzeResponse)
			.fail(function (headers) {
				ErrorManager.onWarning(
					"Min deal group version sync retry failed. Url: " +
						staticInitialDataMinDealAmountsUrl() +
						". Headers: " +
						headers
				);

				return ajaxer.promises
					.get("TDALNotificationData/getMinDealAmounts", initialDataMinDealAmountsFromOriginUrl())
					.then(analyzeResponse);
			});
	}

	function getOvernightFinancing(instrumentId, amount) {
		_lastTimeRequest = timeStamp();
		var ajaxer = tAjaxer();

		var params = new StringBuilder();
		params.append(String.format("instrumentId={0}&", instrumentId));
		params.append(String.format("amount={0}", amount));

		return ajaxer.promises
			.get(
				"dalOrder/getOvernightFinancing",
				"Deals/GetOvernightFinancing",
				params.toString(),
				null,
				null,
				null,
				null,
				false
			)
			.then(function (responseText) {
				var result = analyzeResponse(responseText, eOrderActionType.GetOvernightFinancing);

				return result;
			})
			.fail(function (error) {
				ErrorManager.onError("dalOrder/getOvernightFinancing", error.message, eErrorSeverity.medium);

				throw error;
			});
	}

	function analyzeResponse(responseText, caller) {
		var results = jsonhelper.STR2JSON("dalOreder:analyzeResponse", responseText),
			args;

		if (!results) {
			return [{ status: 0, msgKey: "OrderError1", itemId: "", arguments: null }];
		}

		results.arguments = null;
		//if not array of results - make it as array if one result
		if (!results.length) {
			results = [results];
		}

		for (var i = 0, ii = results.length; i < ii; i++) {
			var resultI = results[i];

			updateMsgKey(resultI, General.isDefinedType(caller) ? caller : resultI.action);

			resultI.arguments = null;

			// parse additional arguments if exists
			if (resultI.responseArgumentsJson) {
				args = jsonhelper.STR2JSON("dalOreder:analyzeResponse", resultI.responseArgumentsJson);

				if (Array.isArray(args)) {
					resultI.arguments = args;
				} else {
					resultI.arguments = [];
					resultI.arguments.push(args);
				}
			}
		}

		return results;
	}

	function updateMsgKey(result, caller) {
		if (result.status == eResult.Success) {
			if (caller == eOrderActionType.NewPriceAlert) {
				result.msgKey = "SuccessPriceAlertAdd";
			} else if (caller == eOrderActionType.NewLimit) {
				result.msgKey = "SuccessLimitAdd";
			} else if (caller == eOrderActionType.EditLimit) {
				result.msgKey = "SuccessLimitEdit";
			} else if (caller == eOrderActionType.DeleteLimit) {
				result.msgKey = "SuccessLimitDelete";
			} else if (caller == eOrderActionType.DeletePriceAlert) {
				result.msgKey = "SuccessPriceAlertDelete";
			} else if (caller == eOrderActionType.NewDeal) {
				result.msgKey = "SuccessDealAdd";
			} else if (caller == eOrderActionType.CloseDeal) {
				result.msgKey = "SuccessDealClose";
			}
		} else {
			result.msgKey = result.result;
		}
	}

	function lastTimeRequest() {
		return _lastTimeRequest;
	}

	function resetTimeRequest() {
		_lastTimeRequest = timeStamp();
	}

	return {
		OpenDeal: openDeal,
		CloseDeals: closeDeals,
		AddLimit: addLimit,
		EditLimit: editLimit,
		SaveLimits: saveLimits,
		DeleteLimit: deleteLimit,
		DeleteLimits: deleteLimits,
		DeletePriceAlerts: deletePriceAlerts,
		lastTimeRequest: lastTimeRequest,
		resetTimeRequest: resetTimeRequest,
		CashBackVolumesInfo: cashBackVolumes,
		GetDealMarginDetails: getDealMarginDetails,
		GetOvernightFinancing: getOvernightFinancing,
		GetMinDealAmounts: getMinDealAmounts,
	};
});
