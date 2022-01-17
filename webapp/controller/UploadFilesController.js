/* globals Uint8Array */
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evonotify.controller.UploadFilesController", {

		metadata: {
			methods: {
				init: {
					public: true,
					final: true
				},
				setContext: {
					public: true,
					final: true
				},
				startUploadFiles: {
					public: true,
					final: true
				}
			}
		},

		oView: null,
		oViewModel: null,
		oContext: null,

		init: function (oController) {
			this.oView = oController.getView();
			this.oViewModel = oController.getModel("viewModel");

			this.oViewModel.setProperty("/FileList", []);
			this.oViewModel.setProperty("/hasFiles", false);
		},

		/**
		 * set notification context for upload
		 * @param oContext
		 */
		setContext: function (oContext) {
			this.oContext = oContext;
		},

		/**
		 * Upload one file
		 * @param uploadItem
		 */
		startUploadFiles: function (uploadItem) {
			// no file left for upload
			this.getView().getModel("viewModel").setProperty("/busy", true);
			if (!uploadItem) {
				return;
			}
			var oContextObj = this.oContext.getObject(),
				uploadInfos = {
					id: oContextObj.NOTIFICATION_NO,
					path: this.oViewModel.getProperty("/serviceUrl") + "PMNotificationAttachmentSet",
					token: this.oView.getModel().getSecurityToken(),
					name: uploadItem.name
				};

			if (!uploadInfos.id || !uploadInfos.path || !uploadInfos.token) {
				var sErrorMsg = this.getResourceBundle().getText("msg.savingError");
				this.showSaveErrorPrompt(sErrorMsg);
				this.addMsgToMessageManager(this.mMessageType.Error, sErrorMsg, "/Detail");
				this.getView().getModel("viewModel").setProperty("/busy", false);
				return;
			}
			//upload success handler
			var successFn = function (oData) {
				this.getView().getModel("viewModel").setProperty("/busy", false);
				var eventBus = sap.ui.getCore().getEventBus();
				eventBus.publish("TemplateRendererEvoNotify", "uploadFinished", {
					info: oData
				});
			}.bind(this);
			//error handler
			var erroFn = function (e, xhr, sName) {
				this.getView().getModel("viewModel").setProperty("/busy", false);
				var sErrorText = this._extractMessages(xhr),
					sErrorFormatedMsg = this.getResourceBundle().getText("msg.uploadError", [xhr.status, sErrorText]);

				this.showSaveErrorPrompt(sErrorFormatedMsg);
				this.addMsgToMessageManager(this.mMessageType.Error, sErrorFormatedMsg, "/Detail");
			}.bind(this);

			this._uploadFileToServer(uploadItem, uploadInfos, successFn, erroFn);
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * read file and send to backend
		 * @param blobOrFile
		 * @param oInfo
		 * @param successCallback
		 * @param errorCallback
		 * @param progressCallback
		 */

		_uploadFileToServer: function (blobOrFile, oInfo, successCallback, errorCallback, progressCallback) {
			var fileReader = new FileReader(),
				_this = this;

			fileReader.onloadend = function () {
				var fileIntArray = new Uint8Array(fileReader.result);
				oInfo.slug = oInfo.id + "|" + oInfo.name;
				oInfo.type = blobOrFile.type;

				_this._uploadFileXhr(oInfo.path, oInfo, fileIntArray, successCallback, errorCallback, progressCallback, _this);
			};
			fileReader.readAsArrayBuffer(blobOrFile);
		},

		/**
		 * Create XHR request
		 * @param sPath
		 * @param oInfo
		 * @param fileStream
		 * @param successCallback
		 * @param errorCallback
		 * @param _this
		 */
		_uploadFileXhr: function (sPath, oInfo, fileStream, successCallback, errorCallback, _this) {
			var xhr = new XMLHttpRequest();

			xhr.onerror = function (e) {
				errorCallback(e, xhr, oInfo.name);
			};
			xhr.onload = function (e) {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) {
						successCallback(oInfo);
					} else {
						errorCallback(e, xhr, oInfo.name);
					}
				}
			};

			xhr.open("POST", sPath, true); // XMLRequest an den Server
			xhr.setRequestHeader("Content-Type", oInfo.type);
			xhr.setRequestHeader("slug", oInfo.slug);
			xhr.setRequestHeader("x-csrf-token", oInfo.token);
			xhr.send(fileStream);
		},

		/**
		 * Extract error messages from xml error response
		 * @param xhr
		 */
		_extractMessages: function (xhr) {
			var sErrorMsgg = "";
			var sResponseText = xhr.responseText;
			try {
				var node = (new DOMParser()).parseFromString(sResponseText, "text/xml").documentElement;
				var nodes = node.querySelectorAll("*");

				for (var i = 0; i < nodes.length; i++) {
					if (nodes[i].tagName === "message") {
						sErrorMsgg = sErrorMsgg + nodes[i].textContent + "\n\n";
					}
				}
			} catch (err) {
				sErrorMsgg = "";
			}
			return sErrorMsgg;
		}
	});
});