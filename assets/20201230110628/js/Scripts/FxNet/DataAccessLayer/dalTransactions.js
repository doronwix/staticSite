define("dataaccess/dalTransactions", ["extensions/Date", "handlers/general", "JSONHelper", "knockout", "handlers/Ajaxer"], function (
	date,
	general,
	jsonhelper,
	ko,
  TAjaxer
) {
	var _lastTimeRequest = timeStamp();

	//-----------------------------------------------------------------
	// openDeal
	//-----------------------------------------------------------------
	var openDeal = function (newDeal, callback, config) {
		var ajaxer = new TAjaxer(),
			forceRetry = config && config.hasOwnProperty("forceRetry") ? config.forceRetry : false,
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null;
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.NewDeal;
			var result = analyzeResponse(responseText, eOrderActionType.NewDeal);

			callback(result, callerId, newDeal.instrumentID, newDeal);
		};

		//---------------------------------

		var openDealRequest = {
			DealType: newDeal.dealType,
			InstrumentId: newDeal.instrumentID,
			Amount: newDeal.amount,
			MarketRate: newDeal.marketRate,
			OtherRateSeen: newDeal.otherRateSeen,
			OrderDirection: newDeal.orderDir,
			TakeProfitRate: newDeal.tpRate,
			StopLossRate: newDeal.slRate,
			SecurityToken: newDeal.securityToken,
			ExecDate: newDeal.execDate,
		};

		if (forceRetry) {
			openDealRequest.Retry = 1;
		}

		//--------------------------------

		ajaxer.promises
			.jsonPost(
				"dalTransactions/openDeal",
				"api/backoffice/transactions/opendeal",
				JSON.stringify(openDealRequest)
			)
			.then(OnLoadComplete)
			.fail(function (error) {
				ErrorManager.onError("dalTransactions/openDeal", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			});
	};

	//-----------------------------------------------------------------
	// closeDeals
	//-----------------------------------------------------------------
	/**
	 *
	 * @param items - array of deals to be closed
	 * @param callback - action to take when the call succeeds
	 * @param config - object containing options to customize de behaviour of the action
	 * config.cancelCallback -*optional* action to take when call fails
	 * config.forceRetry -*optional*  will format the payload and payload string adding the "Retry=1" extra param to the call
	 * config.hasUnwrappedItems -*optional* the items are already parsed from a previous call
	 */
	var closeDeals = function (items, callBack, config) {
		var ajaxer = new TAjaxer(),
			forceRetry = config && config.hasOwnProperty("forceRetry") && config.forceRetry,
			hasUnwrappedItems = config && config.hasOwnProperty("hasUnwrappedItems") ? config.hasUnwrappedItems : false,
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null,
			unWrappedItems = hasUnwrappedItems ? items : [],
			OnLoadComplete = function (responseText) {
				var callerId = eOrderAction.CloseDeal;
				var result = analyzeResponse(responseText, eOrderActionType.CloseDeal);
				if (callBack) {
					callBack(result, callerId, unWrappedItems);
				}
			},
			sb = [],
			url = "api/backoffice/transactions/closedeals?retry=" + (forceRetry ? 1 : 0),
			positions;
		_lastTimeRequest = timeStamp();

		for (var i = 0, len = items.length; i < len; i++) {
			if (!hasUnwrappedItems) {
				unWrappedItems[i] = ko.toJS(items[i]);
			}
			sb.push(
				String.format(
					"{0}#{1}#{2}",
					unWrappedItems[i].positionNumber,
					unWrappedItems[i].spotRate,
					unWrappedItems[i].fwPips
				)
			);
		}

		positions = sb.join("_");

		ajaxer.promises
			.jsonPost("dalTransactions/closeDeals", url, JSON.stringify(positions))
			.then(OnLoadComplete)
			.fail(function (error) {
				ErrorManager.onError("dalTransactions/closeDeals", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			});
	};

	//-----------------------------------------------------------------
	// addLimit
	//-----------------------------------------------------------------
	var addLimit = function (limit, callback, config) {
		var ajaxer = new TAjaxer(),
			forceRetry = config && config.hasOwnProperty("forceRetry") ? config.forceRetry : false,
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null;
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.NewLimit;
			var result = analyzeResponse(responseText, eOrderActionType.NewLimit);

			callback(result, callerId, limit.instrumentID, limit);
		};

		if (forceRetry) {
			limit.retry = 1;
		}

		//--------------------------------

		ajaxer.promises
			.jsonPost("dalTransactions/addLimit", "api/backoffice/transactions/addlimit", JSON.stringify(limit))
			.then(OnLoadComplete)
			.fail(function (error) {
				ErrorManager.onError("dalTransactions/addLimit", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			});
	};

	//-----------------------------------------------------------------
	// editLimit
	//-----------------------------------------------------------------

	var editLimit = function (limit, callback, config) {
		_lastTimeRequest = timeStamp();
		var ajaxer = new TAjaxer(),
			forceRetry = config && config.hasOwnProperty("forceRetry") && config.forceRetry,
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null;

		if (forceRetry) {
			general.extendType(limit, { retry: 1 });
		}

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.EditLimit;
			var result = analyzeResponse(responseText, eOrderActionType.EditLimit);

			callback(result, callerId, limit);
		};

		//--------------------------------
		ajaxer.promises
			.jsonPost("dalTransactions/editLimit", "api/backoffice/transactions/editlimit", JSON.stringify(limit))
			.then(OnLoadComplete)
			.fail(function (error) {
				ErrorManager.onError("dalTransactions/editLimit", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			});
	};

	//-----------------------------------------------------------------
	// deleteLimit
	//-----------------------------------------------------------------
	var deleteLimit = function (limit, callback, config) {
		var ajaxer = new TAjaxer(),
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null;
		_lastTimeRequest = timeStamp();

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.DeleteLimit;
			var result = analyzeResponse(responseText, eOrderActionType.DeleteLimit);

			callback(result, callerId, limit);
		};

		ajaxer.promises
			.jsonPost("dalTransactions/deleteLimit", "api/backoffice/transactions/deletelimit", JSON.stringify(limit))
			.then(OnLoadComplete)
			.fail(function (error) {
				ErrorManager.onError("dalTransactions/deleteLimit", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			});
	};

	//-----------------------------------------------------------------
	// saveLimits
	//-----------------------------------------------------------------
	var saveLimits = function (limits, callback, config) {
		_lastTimeRequest = timeStamp();
		var ajaxer = new TAjaxer(),
			forceRetry = config && config.hasOwnProperty("forceRetry") && config.forceRetry,
			failCallback =
				config && config.hasOwnProperty("failCallback") && typeof config.failCallback === "function"
					? config.failCallback
					: null;

		if (forceRetry) {
			limits.map(function (limit) {
				general.extendType(limit, { retry: 1 });
			});
		}

		var OnLoadComplete = function (responseText) {
			var callerId = eOrderAction.SaveLimits;
			var result = analyzeResponse(responseText);

			callback(result, callerId, null, limits);
		};

		//--------------------------------
		ajaxer.promises
			.jsonPost("dalTransactions/editLimit", "api/backoffice/transactions/savelimits", JSON.stringify(limits))
			.then(OnLoadComplete)
			.fail(function (error) {
				ErrorManager.onError("dalTransactions/saveLimits", error.message, eErrorSeverity.medium);
				if (failCallback) {
					failCallback();
				}
			});
	};

	//-----------------------------------------------------------------
	// analyzeResponse
	//-----------------------------------------------------------------
	var analyzeResponse = function (responseText, caller) {
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

			updateMsgKey(resultI, general.isDefinedType(caller) ? caller : resultI.action);

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
	};

	//-----------------------------------------------------------------
	var updateMsgKey = function (result, caller) {
		if (result.status == eResult.Success) {
			if (caller == eOrderActionType.NewLimit) result.msgKey = "SuccessLimitAdd";
			else if (caller == eOrderActionType.EditLimit) result.msgKey = "SuccessLimitEdit";
			else if (caller == eOrderActionType.DeleteLimit) result.msgKey = "SuccessLimitDelete";
			else if (caller == eOrderActionType.NewDeal) result.msgKey = "SuccessDealAdd";
			else if (caller == eOrderActionType.CloseDeal) result.msgKey = "SuccessDealClose";
		} else {
			result.msgKey = result.result;
		}
	};

	//-----------------------------------------------------------------
	// TimeRequest
	//-----------------------------------------------------------------
	var lastTimeRequest = function () {
		return _lastTimeRequest;
	};

	//-----------------------------------------------------------------
	var resetTimeRequest = function () {
		_lastTimeRequest = timeStamp();
	};

	return {
		OpenDeal: openDeal,
		AddLimit: addLimit,
		CloseDeals: closeDeals,
		EditLimit: editLimit,
		SaveLimits: saveLimits,
		DeleteLimit: deleteLimit,
		lastTimeRequest: lastTimeRequest,
		resetTimeRequest: resetTimeRequest,
	};
});
