/* global UrlResolver, ErrorManager, Loader,Q*/
// singleton web socket connection wrapperisReady

define([
	"Q",
	"global/UrlResolver",
	"generalmanagers/ErrorManager",
	"fxnet/loader",
	"handlers/websocketstate",
], function (Q, UrlResolver, ErrorManager, Loader, wsState) {
	var //_wsUrl,
		_socket = null,
		_timestamps,
		hasStarted,
		messageHandler,
		reconnectedHandler,
		notAvailableHandler,
		disconnectedHandler,
		isShutDownMode = false,
		isStartMode = true,
		retriesOnDisconnectedFailedConnection = 0, // initial value
		disconnectedMaxRetries = 1, // =1 on init and then =3 on network failure
		receiveActions = {
			reconnected: "reconnected",
			ack: "ack",
			reconnectOnError: "reconnectOnError",
			disconnect: "disconnect",
		},
		lastKeepAliveMsg,
		isNotFirstKeepAlive = false,
		//receiveTimeoutPeriod = 15,
		receiveKeepAliveTimeout = null,
		socketConfig = null,
		defaultKeepAlivePeriod = 5,
		defaultKeepAliveBuffer = 1,
		eventsCalledOnce,
		onDisconnectedIsAlreadyRunning = false;

	function log(message) {
		var connectionToken = wsState.GetConnectionToken(),
			messageData = {
				Location: "SocketConnection (" + connectionToken + ") ",
				Info: message,
			},
			params = {
				loggedErrorString: JSON.stringify(messageData),
			},
			xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST", UrlResolver.getUrlWithRndKeyValue("Error/Warn"));
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(params));
	}

	//event - socket performace  event
	//value - current value for that event
	//conditionalInitValue -  for items that need to be updated once, update only when previous value equals to conditionalInitValue (0)
	function updatePerformanceCounter(event, value, conditionalInitValue) {
		if (_timestamps.sockets) {
			var temp = _timestamps.sockets[event];

			if (typeof conditionalInitValue !== "undefined") {
				if (temp === conditionalInitValue) {
					_timestamps.sockets[event] = value;
				}

				return;
			}
			_timestamps.sockets[event] = value;
		}

		return; // for better code readability
	}

	function updatefirstFrameCounter(event) {
		if (!eventsCalledOnce[event]) {
			updatePerformanceCounter(event, Date.now(), 0);
			eventsCalledOnce[event] = true;
		}
	}

	function onReceived(messageEvent) {
		// time stamp on first frame
		updatefirstFrameCounter("firstFrame");

		if (messageEvent && messageEvent.data) {
			if (messageEvent.data === "OK") {
				return;
			}
			var messageData = JSON.parse(messageEvent.data);
			var receivedMessage = { msgId: 0 };

			if (messageData && messageData.M && messageData.M.length > 0) {
				for (var i = 0; i < messageData.M.length; i++) {
					try {
						if (messageData.M[i] === "OK") {
							continue;
						}
						var msgObj = JSON.parse(messageData.M[i]);

						receivedMessage.msgId = msgObj.msgId || receivedMessage.msgId;

						if (msgObj.clientStateResult) {
							// time stamp on first quote
							updatefirstFrameCounter("firstQuote");
						}
						// acknowledgment action
						if (msgObj.action === receiveActions.ack) {
							sendAck(msgObj.msgId);
						}
						//server error and it still connected but asks to reconnect - we will reconnect
						else if (msgObj.action === receiveActions.reconnected) {
							onReconnectedAction();
							return;
						} else if (msgObj.action === receiveActions.reconnectOnError) {
							onDisconnected();
							return;
						} else if (msgObj.action === receiveActions.disconnect) {
							onDisconnected();
							return;
						}

						if (messageHandler) {
							messageHandler(msgObj);
						}
					} catch (err) {
						log("onReceived - failed to parse message data:" + messageData.M[i]);
					}
				}

				onReceivedKeepAlive(receivedMessage);
			}
		}
	}

	function clearKeepAliveTimeInterval() {
		log("clearKeepAliveTimeInterval");

		if (receiveKeepAliveTimeout) {
			clearInterval(receiveKeepAliveTimeout);
			receiveKeepAliveTimeout = null;
		}
	}

	function onReceivedKeepAlive(message) {
		retriesOnDisconnectedFailedConnection = 0;
		lastKeepAliveMsg = { date: new Date(), id: message.msgId };
	}

	function checkKeepAlive() {
		if (!lastKeepAliveMsg) {
			return;
		}

		var actualDate = new Date();

		var timeBetweenMessages = Math.abs((actualDate.getTime() - lastKeepAliveMsg.date.getTime()) / 1000);

		if (
			!isStartMode &&
			!isShutDownMode &&
			timeBetweenMessages > socketConfig.keepAlivePeriod + socketConfig.keepAliveBuffer &&
			isNotFirstKeepAlive
		) {
			log(
				"Time out...try to reconnect at: " +
					actualDate +
					", last keep alive message date: " +
					lastKeepAliveMsg.date +
					", last keep alive message id: " +
					lastKeepAliveMsg.id
			);
			isNotFirstKeepAlive = false;
			onDisconnected();
			return;
		}

		isNotFirstKeepAlive = true;
	}

	function onerror(event, source) {
		try {
			if (typeof event !== "undefined" && typeof source !== "undefined") {
				log(
					"Socket_connection_error,source=" +
						source +
						",reason=" +
						(typeof event === "string"
							? event
							: (event.reason || "CloseEvent") +
							  ",code=" +
							  (event.code || 0) +
							  ",wasClean=" +
							  (event.wasClean || true) +
							  ",message=" +
							  (event.message || "") +
							  ",target=" +
							  (event.target || ""))
				);
			}

			wsState.ResetConnectionData();
			tryCloseSocket(true);
			hasStarted.reject(event);
		} catch (e) {
			if (e && e.message) {
				log("onerror failed, error: " + e.message);
			}
		}
	}

	function connect(error) {
		try {
			if (!wsState.CanConnect()) {
				hasStarted.reject("cannot connect");
				return;
			}

			if (error) {
				log("get jwt failed, error: " + error.message);
				hasStarted.reject(error);

				return;
			}

			_timestamps.jwtComplete = Date.now();

			//account is not websockets abtesting and no session storage
			var jwtToken = wsState.GetJwtToken(),
				connectionToken = wsState.GetConnectionToken(),
				url =
					//_wsUrl +
					"wss://csmdev.fihtrader.com/csmstream/connect?transport=webSockets&clientProtocol=1.5&connectionToken=" +
					connectionToken +
					"&jwt=" +
					jwtToken;

			_socket = new WebSocket(url);

			_socket.onerror = function (event) {
				onerror(event, "socket_onerror");
			};

			_socket.onopen = function onOpen() {
				updatePerformanceCounter("connectionComplete", Date.now());

				isStartMode = false;
				if (_socket.readyState === WebSocket.OPEN) {
					log("start connection done, transport = webSockets");
					disconnectedMaxRetries = 25;
					retriesOnDisconnectedFailedConnection = 0;
					hasStarted.resolve(true);

					if (!receiveKeepAliveTimeout) {
						receiveKeepAliveTimeout = setInterval(checkKeepAlive, socketConfig.keepAlivePeriod * 1000);
					}
					return;
				}
				hasStarted.reject();
			};

			// set event handlers
			_socket.onmessage = onReceived;
			_socket.onclose = function (event) {
				// Only handle a socket close if the close is from the current socket.
				// Sometimes on disconnect the server will push down an onclose event
				// to an expired socket.
				if (this !== _socket) {
					log("onclose called on a wrong socket instance");
					return;
				}

				if (!isStartMode && typeof event.wasClean !== "undefined" && event.wasClean === false) {
					// Ideally this would use the websocket.onerror handler (rather than checking wasClean in onclose) but
					// I found in some circumstances Chrome won't call onerror. This implementation seems to work on all browsers.
					onerror(event, "socket_onclose_unclean_disconnect");
					return;
				}

				tryCloseSocket(true);
				hasStarted.reject();
			};
		} catch (e) {
			hasStarted.reject(e);

			if (e && e.message) {
				log("start connection failed, error: " + e.message);
			}
		}
	}

	function start() {
		isStartMode = true;
		updatePerformanceCounter("connectionStart", Date.now());
		hasStarted = Q.defer();

		wsState
			.TryConnect()
			.then(connect)
			.catch(function onFallback(error) {
				hasStarted.reject(error);
			})
			.done();

		return hasStarted.promise;
	}

	function isConnected() {
		return !socketIsNull() && _socket.readyState === WebSocket.OPEN;
	}
	function canSend(method) {
		var isconnected = isConnected();
		var isconnectionAvailable = !isShutDownMode && isconnected;

		if (!isconnectionAvailable) {
			log(
				"canSend=false" +
					",method=" +
					method +
					",isShutDownMode=" +
					isShutDownMode +
					",isconnected=" +
					isconnected +
					",sockeState=" +
					(_socket === null ? "null" : _socket.readyState)
			);
		}
		return isconnectionAvailable;
	}

	function sendAck(msgId) {
		if (canSend("ack")) {
			_socket.send(JSON.stringify({ ack: msgId }));
		}
	}

	//server send reconnect action
	function onReconnectedAction() {
		if (reconnectedHandler) {
			reconnectedHandler();
		}
	}
	// #endregion Private methods

	function init(url, timestamps, hashParams) {
		_wsUrl = url.replace("https://", "wss://").replace("http://", "ws://");
		_timestamps = timestamps;

		setDefaultConfig();

		wsState.Init(hashParams);
		return start();
	}

	function isNullOrNaN(value) {
		return typeof value === "undefined" || value === null || value === "" || isNaN(parseFloat(value));
	}

	function setDefaultConfig() {
		var csmPushServicekeepAlivePeriod = window.environmentData.csmPushServicekeepAlivePeriod;
		var csmPushServicekeepAliveBuffer = window.environmentData.csmPushServicekeepAliveBuffer;

		socketConfig = {
			keepAlivePeriod: !isNullOrNaN(csmPushServicekeepAlivePeriod)
				? parseFloat(csmPushServicekeepAlivePeriod)
				: defaultKeepAlivePeriod,
			keepAliveBuffer: !isNullOrNaN(csmPushServicekeepAliveBuffer)
				? parseFloat(csmPushServicekeepAliveBuffer)
				: defaultKeepAliveBuffer,
		};
		isShutDownMode = false;
		isStartMode = true;
		lastKeepAliveMsg = null;
		eventsCalledOnce = {
			firstFrame: false,
			firstQuote: false,
		};
	}

	function socketIsNull() {
		return _socket === null || typeof _socket === "undefined";
	}

	function tryCloseSocket(disposeOnly) {
		if (socketIsNull()) {
			return false;
		}
		disposeOnly = disposeOnly || false;
		_socket.onopen = null;
		_socket.onerror = null;
		_socket.onmessage = null;
		_socket.onclose = null;
		if (!disposeOnly) _socket.close();
		_socket = null;

		return true;
	}

	function stopConnection(shutDownMode) {
		if (!tryCloseSocket()) return;
		if (shutDownMode) {
			clearKeepAliveTimeInterval();
		}
		var stack = new Error().stack ? new Error().stack : "not supported by this browser";
		log("stopping, stack: " + stack.toString().substring(0, 1500));
		isShutDownMode = shutDownMode;
	}

	function onDisconnected() {
		if (onDisconnectedIsAlreadyRunning) {
			return;
		}

		onDisconnectedIsAlreadyRunning = true;

		try {
			clearKeepAliveTimeInterval();
			tryCloseSocket();

			if (disconnectedHandler) {
				disconnectedHandler();
			}

			if (isShutDownMode) {
				log("disconnect reason: isShutDownMode");
			} else if (isStartMode) {
				log("disconnect reason: connection not successful on start");

				if (hasStarted) {
					hasStarted.reject("disconnected while is starting connection");
				}
			} else {
				reconnect();
			}
		} catch (e) {
			onDisconnectedIsAlreadyRunning = false;
		}
	}

	function reconnect() {
		retriesOnDisconnectedFailedConnection += 1;
		if (retriesOnDisconnectedFailedConnection < 5 || retriesOnDisconnectedFailedConnection % 5 === 0) {
			log("onDisconnected- retry: " + retriesOnDisconnectedFailedConnection);
		}

		if (retriesOnDisconnectedFailedConnection <= disconnectedMaxRetries) {
			wsState.ResetConnectionData();
			start()
				.then(function () {
					onReconnected(retriesOnDisconnectedFailedConnection);
					onDisconnectedIsAlreadyRunning = false;
				})
				.fail(reconnect)
				.done();
		} else {
			var errorMessage = "socket disconnect max retries breached";

			log(errorMessage);

			if (notAvailableHandler) {
				notAvailableHandler();
			}

			stopConnection(false);
			onDisconnectedIsAlreadyRunning = false;
		}
	}

	function onReconnected(retries) {
		if (reconnectedHandler) {
			reconnectedHandler();
		}

		if (retries > 1) {
			log("Reconnected after " + retries + " attempts");
		}
	}

	function send(methodName, params) {
		if (canSend(methodName)) {
			_socket.send(JSON.stringify({ methodName: methodName, params: params }));
		}
	}

	return {
		init: init,
		setNotAvailableHandler: function (fnHandler) {
			notAvailableHandler = fnHandler;
		},
		hasStarted: function () {
			return hasStarted.promise;
		},
		setMessageHandler: function (fnHandler) {
			messageHandler = fnHandler;
		},
		setReconnectedHandler: function (fnHandler) {
			reconnectedHandler = fnHandler;
		},
		setDisconnectedHandler: function (fnHandler) {
			disconnectedHandler = fnHandler;
		},
		send: send,
		stop: function () {
			stopConnection(true);
		},
		isConnected: isConnected,
		setdisconnectedMaxRetries: function (maxRetries) {
			disconnectedMaxRetries = maxRetries;
		},
	};
});
