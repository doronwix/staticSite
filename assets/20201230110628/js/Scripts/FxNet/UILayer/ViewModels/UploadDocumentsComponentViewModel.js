define("viewmodels/UploadDocumentsComponentViewModel", [
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"Q",
	"modules/environmentData",
	"Dictionary",
	"initdatamanagers/Customer",
	"global/UrlResolver",
	"dataaccess/dalClaims",
	"dataaccess/dalCommon",
	"devicemanagers/StatesManager",
	"dataaccess/dalCompliance",
	"FxNet/UILayer/Managers/InterWindowsCommunicator",
	"modules/permissionsmodule",
	"configuration/initconfiguration",
	"FxNet/UILayer/ViewModels/UploadDocumentsPopUpsManager",
	"FxNet/Common/Utils/Version/versionPci.require",
	"StateObject!VerificationDocument",
], function UploadDocumentsComponentDef(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		Q = require("Q"),
		environmentData = require("modules/environmentData").get(),
		Dictionary = require("Dictionary"),
		Customer = require("initdatamanagers/Customer"),
		urlResolver = require("global/UrlResolver"),
		dalClaims = require("dataaccess/dalClaims"),
		dalCommon = require("dataaccess/dalCommon"),
		dalCompliance = require("dataaccess/dalCompliance"),
		InterWindowsCommunicator = require("FxNet/UILayer/Managers/InterWindowsCommunicator"),
		StatesManager = require("devicemanagers/StatesManager"),
		permissionsModule = require("modules/permissionsmodule"),
		settings = require("configuration/initconfiguration").UploadDocumentsConfiguration,
		uploadDocumentsPopUpsManager = require("FxNet/UILayer/ViewModels/UploadDocumentsPopUpsManager"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		StateVerificationDocument = require("StateObject!VerificationDocument"),
		versionPci = require("FxNet/Common/Utils/Version/versionPci.require");

	var UploadDocumentsComponentViewModel = general.extendClass(
		KoComponentViewModel,
		function UploadDocumentsComponentClass(params) {
			var self = this,
				parent = this.parent, // inherited from KoComponentViewModel
				data = this.Data, // inherited from KoComponentViewModel
				id = params.id || "unknown",
				hashTag = params.hashTag || "",
				communicator = InterWindowsCommunicator(window, id.toString() + hashTag),
				claimGuid,
				currentFile,
				timeoutDefered = Q.defer(),
				uploadFrameInterval,
				currentRetryCount = 0,
				frameId = general.createGuid(),
				documentTypeName = params.documentTypeName,
				customSuccessMessage = params.customSuccessMessage || "",
				recordType = params.recordType || eClaimRecordType.generalDocument,
				form = {},
				logDataExtra = null;

			function init() {
				parent.init.call(self);

				form.idByShufti = Customer.prop.idByShufti;
				form.ubByShufti = Customer.prop.ubByShufti;

				setVerificationDocState();
				setObservables();
				setComputables();
				setSubscribers();
				setUpRetryMechanism();
				registerCommunicator();

				dalCommon.LogUploadCommunication("VM load", "load promise timeout started", "written");
                    StatesManager.StartGetDocumentsStatus();
			}

			function setObservables() {
				form.progressVisible = ko.observable(false);
				form.textFileUpload = ko.observable();
				form.iframeReady = ko.observable(false);
				form.autoUpload = params.autoUpload || false;
				form.iframeElement = ko.observable();
				form.canBrowse = ko.observable(true);
				form.canUpload = ko.observable(false);
				form.files = ko.observableArray();
				form.iframeSrc = ko.observable(getIframeSrc()).extend({ notify: "always" });
				form.successFirst = ko.observable(false);

				setVerificationDocObservables();
			}

			function setVerificationDocState() {
				if (StateVerificationDocument.containsKey(documentTypeName)) {
                       return;
				}

				StateVerificationDocument.set(documentTypeName, {
					normalUpload: false,
					enableConfirm: true,
					showDocStatusText: true,
				});
			}

			function setVerificationDocObservables() {
				var state = StateVerificationDocument.containsKey(documentTypeName)
					? StateVerificationDocument.get(documentTypeName)
					: null;

				form.enableConfirm = ko.observable(state ? state.enableConfirm : false);
				form.normalUpload = ko.observable(state ? state.normalUpload : false);
				form.showDocStatusText = ko.observable(state ? state.showDocStatusText : true);
			}

			function setComputables() {
				form.isBrowseEnabled = ko.computed(function () {
					return form.iframeReady() && form.canBrowse();
				});

				form.isBrowseUploadOneClickEnabled = ko.computed(function () {
					return (
						form.iframeReady() && form.canBrowse() && permissionsModule.CheckPermissions("uploadDocuments")
					);
				});

				form.isUploadEnabled = ko.computed(function () {
					return (
						form.iframeReady() && form.canUpload() && permissionsModule.CheckPermissions("uploadDocuments")
					);
				});

				form.CddCompleted = ko.computed(function () {
					return StatesManager.GetStates().CddStatus() === eCDDStatus.Complete;
				});

				form.isIdByShuftiEnabled = ko.pureComputed(function () {
					return form.idByShufti === true && form.CddCompleted() === true && !form.normalUpload();
				}, form);

				form.isUbByShuftiEnabled = ko.pureComputed(function () {
					return form.ubByShufti === true && form.CddCompleted() === true && !form.normalUpload();
				}, form);
			}

			function setSubscribers() {
				ko.postbox.subscribe(eAppEvents.dialogClosed, function () {
					if (params.isCloseable) {
						form.iframeSrc("");
					}
				});

				StateVerificationDocument.subscribe(documentTypeName, function (value) {
					form.normalUpload(value.normalUpload);
					form.enableConfirm(value.enableConfirm);
					form.showDocStatusText(value.showDocStatusText);
				});
			}

			function setUpRetryMechanism() {
				timeoutDefered.promise
					.timeout(settings.interWindowsCommunicationLimit)
					.then(
						function (result) {
							dalCommon.LogUploadCommunication(
								"VM load",
								"load promise timeout was resolved with result: " + result,
								"written"
							);
						},
						function () {
							uploadFrameInterval = setInterval(reloadUploadFrame, settings.uploadFrameReloadTimeout);
						}
					)
					.done();
			}

			function getIframeSrc() {
				return getFrameUrl() + getFrameIdentifiersForUrl();
			}

			function getIframeSrcWithCacheBuster() {
				var url = getFrameUrl();

				return urlResolver.getUrlWithRndKeyValue(url) + getFrameIdentifiersForUrl();
			}

			function getFrameUrl() {
				return (
					environmentData.pciPath +
					environmentData.pciFileUploadPage +
					"?id=" +
					id +
					"&v=" +
					versionPci +
					"&d=" +
					window.location.host.replace(/\./g, "_")
				);
			}

			function getFrameIdentifiersForUrl() {
				var frameDetails = "an=" + Customer.prop.accountNumber + "&guid=" + frameId;

				return typeof params.hashTag !== "undefined"
					? "#" + id + params.hashTag + "&" + frameDetails
					: "#" + frameDetails;
			}

			function reloadUploadFrame() {
				if (currentRetryCount > settings.uploadFrameRetryCount) {
					clearInterval(uploadFrameInterval);
					var frameSrc = form.iframeSrc();

					dalCommon.LogFrameNotLoadedMessage(
						eTokenizationError.frameNotLoaded,
						encodeURI(frameSrc),
						general.extractGuid(frameSrc)
					);

					return;
				}

				currentRetryCount++;

				form.iframeSrc(getIframeSrcWithCacheBuster());
			}

			//message handlers
			function handleReady() {
				clearInterval(uploadFrameInterval);
				timeoutDefered.resolve("ready");
				form.iframeReady(true);
				postMessage({ msg: "ready" });
			}

			function handleFileData(value) {
				value.errorText = getError(value.errorType);
				form.textFileUpload(value.name);
				form.canUpload(!value.isFinished);
				currentFile = value;

				if (value.isFinished) {
					form.files.push(currentFile);
					handleFileDataStatus(currentFile, eTokenizationError.uploadError, value);
				}

				if (value.errorType) {
					notifyDependencies();
				}

				if (!value.isFinished && form.autoUpload) {
					upload();
				}
			}

			function handleUploadStatus(value) {
				form.canBrowse(true);
				form.canUpload(false);

				var fileData = value.data;
				var index = form.files().length - 1;

				fileData.errorText = getError(fileData.errorType);
				fileData.name = form.files()[index].name;
				form.files.replace(form.files()[index], fileData);

				handleFileDataStatus(fileData, eTokenizationError.uploadError, value);

				if (fileData.errorType) {
					notifyDependencies();
				}

				if (value.result) {
					form.textFileUpload("");
				}
			}

			function handleLogFileUploadData(fileData) {
				var guid =
					!fileData.uploadResult || !fileData.uploadResult.guid ? claimGuid : fileData.uploadResult.guid;
				var fileName =
					!fileData.uploadResult || !fileData.uploadResult.name
						? form.textFileUpload()
						: fileData.uploadResult.name;
				var fileSize = !fileData.uploadResult || !fileData.uploadResult.size ? "" : fileData.uploadResult.size;
				var contType =
					!fileData.uploadResult || !fileData.uploadResult.contenttype
						? ""
						: fileData.uploadResult.contenttype;
				var errNum = -1; // -1 Unknown error (default)
				var errorType = fileData.errType || fileData.uploadResult.error;

				// validationErrorCode existing
				if (
					fileData.uploadResult &&
					fileData.uploadResult.validationErrorCode &&
					/^\d+$/.test(fileData.uploadResult.validationErrorCode)
				) {
					errNum = fileData.uploadResult.validationErrorCode;
				} else if (fileData.uploadResult && !fileData.uploadResult.validationErrorCode) {
					// validationErrorCode isn't exists
					errNum = fileSize > 0 && fileName.length && contType.length > 0 ? 0 : errNum; // 0 - uploaded success
				}

				notifyDependencies();

				if (errNum === 0) {
					if (recordType === eUploadDocumentType.ProofOfID) {
						StatesManager.States.docProofOfID(eUploadDocumentStatus.Processing);
					} else if (recordType === eUploadDocumentType.ProofOfResidence) {
						StatesManager.States.docProofOfResidence(eUploadDocumentStatus.Processing);
					}

					uploadDocumentsPopUpsManager.showPopUp(recordType, customSuccessMessage);
				}

				var dalComplianceLogData = {
					ErrNum: errNum,
					ErrType: errorType,
					FileName: fileName,
					FileSize: fileSize,
					ContType: contType,
					GuId: guid,
					RecType: recordType,
				};

				if (logDataExtra) {
					dalComplianceLogData.LogDataExtra = JSON.stringify(logDataExtra);
					logDataExtra = null;
				}

				dalCompliance.logUploadResult(dalComplianceLogData);
			}

			function notifyDependencies() {
				if (general.isFunctionType(params.uploadResponseCallback)) {
					params.uploadResponseCallback();
				}
			}

			//actions
			function browse() {
				postMessage({ msg: "browse" });
			}

			function upload() {
				form.canUpload(false);
				form.canBrowse(false);
				form.files.push(currentFile);

				getClaim();
			}

			function uploadStringImage(imageDetails, extraInfo) {
				postMessage({
					msg: "uploadStringImage",
					value: {
						base64Image: imageDetails.content,
						fileName: imageDetails.fileName,
					},
				});

				logDataExtra = extraInfo || null;
			}

			function removeFileLog(fileData) {
				form.files.remove(fileData);
			}

			//helper functions
			function postMessage(message) {
				communicator.postMessage(form.iframeElement(), message, environmentData.pciPath);
			}

			function getClaim() {
				dalClaims
					.getClaim(eClaimActionType.Save, recordType, Customer.prop.accountNumber)
					.then(processClaim)
					.then(postClaim)
					.fail(onClaimError)
					.done();
			}

			function processClaim(claimResponseText) {
				var claimResponse = JSONHelper.STR2JSON(
					"UploadDocumentsComponentViewModel:processClaim",
					claimResponseText
				);

				if (!claimResponse || claimResponse.error) {
					throw new Error(claimResponseText);
				} else {
					return claimResponse;
				}
			}

			function postClaim(claimResponse) {
				postMessage({
					msg: "upload",
					value: claimResponse,
				});

				if (form.successFirst()) {
					return;
				}

				form.successFirst(true);
			}

			function onClaimError(errorData) {
				form.canBrowse(true);
				form.canUpload(false);
				form.textFileUpload("");

				var index = form.files().length - 1;
				var fileData = $.extend({}, form.files()[index]);

				fileData.errorText = getError("uploadError");
				fileData.errorType = "uploadError";
				fileData.isSuccessfull = false;
				fileData.showProgress = false;
				fileData.isFinished = true;
				form.files.replace(form.files()[index], fileData);

				var errorText = errorData.status ? "Claim request failed with status " + errorData.status : errorData;
				handleFileDataStatus(fileData, eTokenizationError.claimError, errorText);

				form.canUpload(false);
				form.canBrowse(true);

				notifyDependencies();
			}

			function handleFileDataStatus(fileData, errorType, errorData) {
				if (!fileData.isSuccessfull && shouldWriteUploadErrorActivityLog(fileData)) {
					dalCommon.LogUploadActivityMessage(
						errorType,
						encodeURI(form.iframeSrc()) + " " + getErrorData(errorData)
					);
				}
			}

			//error related functions
			function getErrorData(errorData) {
				if (!errorData) {
					return "";
				}

				if (errorData instanceof Error) {
					return errorData.message + " StackTrace: " + (errorData.stack || "");
				}

				return JSON.stringify(errorData);
			}

			function shouldWriteUploadErrorActivityLog(fileData) {
				if (!fileData.errorType) {
					return false;
				}

				if (!permissionsModule.CheckPermissions("uploadDocuments")) {
					return false;
				}

				return fileData.errorType === "uploadError";
			}

			function getError(errorType) {
				if (errorType) {
					switch (errorType) {
						case "noFileToUpload":
						case "uploadError":
							return Dictionary.GetItem("lblErrMsgSendindFaildTitle");

						case "fileTypeError":
							return Dictionary.GetItem("lblFileTypeError");

						case "fileNumberError":
							return Dictionary.GetItem("lblFileCountError");

						case "invalidFileName":
							return Dictionary.GetItem("lblFileNameError");

						case "maxSize":
							return Dictionary.GetItem("lblFileSizeError");

						default:
							return errorType;
					}
				}

				return Dictionary.GetItem("lblSuccessfullyUploaded");
			}

			function dispose() {
				form.iframeSrc("");
				communicator.unregisterMessageHandler();
				timeoutDefered.resolve("dispose");

				if (uploadFrameInterval) {
					clearInterval(uploadFrameInterval);
				}

				parent.dispose.call(self); // inherited from KoComponentViewModel
			}

			function registerCommunicator() {
				communicator.registerMessageHandler(environmentData.pciPath, {
					uploadStatus: handleUploadStatus,
					ready: handleReady,
					logUploadData: handleLogFileUploadData,
					fileData: handleFileData,
				});
			}

			return {
        init:init,
				dispose: dispose,
				Data: data,
				Upload: upload,
				UploadStringImage: uploadStringImage,
				Browse: browse,
				RemoveFileLog: removeFileLog,
				Form: form,
			};
		}
	);

  var createViewModel = function(params) {
		var viewModel = new UploadDocumentsComponentViewModel(params);

		viewModel.init();

		return viewModel;
	};

	return {
		viewModel: { createViewModel: createViewModel },
	};
});
