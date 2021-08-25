/* globals Uint8Array */
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evonotify.controller.UploadFilesController", {

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
		 * read file and send to backend
		 * @param blobOrFile
		 * @param oInfo
		 * @param successCallback
		 * @param errorCallback
		 * @param progressCallback
		 */
		uploadFileToServer: function (blobOrFile, oInfo, successCallback, errorCallback, progressCallback) {
			var fileReader = new FileReader(),
				_this = this;

			fileReader.onloadend = function () {
				var fileIntArray = new Uint8Array(fileReader.result);
				oInfo.slug = oInfo.id + "|" + oInfo.name;
				oInfo.type = blobOrFile.type;

				_this.uploadFileXhr(oInfo.path, oInfo, fileIntArray, successCallback, errorCallback, progressCallback, _this);
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
		uploadFileXhr: function (sPath, oInfo, fileStream, successCallback, errorCallback, _this) {
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
				this.showSaveErrorPrompt(this.getResourceBundle().getText("msg.savingError"));
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
				this.showSaveErrorPrompt(this.getResourceBundle().getText("msg.uploadError", [xhr.status, xhr.statusText]));
			}.bind(this);

			this.uploadFileToServer(uploadItem, uploadInfos, successFn, erroFn);
		}
	});
});