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
				oInfo.slug = oInfo.id + "|" + oInfo.name + "|" + oInfo.description;
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
			xhr.setRequestHeader("slug", encodeURIComponent(oInfo.slug));
			xhr.setRequestHeader("x-csrf-token", oInfo.token);
			xhr.send(fileStream);
		},

		/**
		 * Upload one file
		 * @param uploadItem
		 */
		startUploadFiles: function (uploadItem, sDescription) {
			// no file left for upload
			this.getView().getModel("viewModel").setProperty("/busy", true);
			if (!uploadItem) {
				return;
			}
			var oContextObj = this.oContext.getObject(),
				uploadInfos = {
					id: oContextObj.ORDER_NUMBER,
					description: sDescription ? sDescription : undefined,
					path: this.oViewModel.getProperty("/serviceUrl") + "WOAttachmentSet",
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
		},

		/**
		 * show dialog to enter description
		 * @param sTitle
		 * @param successCallback
		 * @param cancelCallback
		 */
		showDescriptionDialog: function (sTitle, oFileUploader, successCallback, cancelCallback) {
			var dialog = new sap.m.Dialog({
				title: sTitle,
				type: "Message",
				content: new sap.m.TextArea({
					value: "",
					width: "100%",
					liveChange: this.onDescriptionLiveChange
				}),
				beginButton: new sap.m.Button({
					text: this.getResourceBundle().getText("btn.upload"),
					press: function () {
						this.onPressFileUploadOnDialog(dialog, oFileUploader, successCallback);
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: this.getResourceBundle().getText("btn.cancel"),
					press: function () {
						if (cancelCallback) {
							cancelCallback(oFileUploader);
						}
						dialog.close();
					}.bind(this)
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},

		/**
		 * Live change event for attachement description
		 * @param oEvent
		 */
		onDescriptionLiveChange: function (oEvent) {
			var oTextArea = oEvent.getSource();
			if (oTextArea.getValue() === "") {
				oTextArea.setValueState("Error");
			} else {
				oTextArea.setValueState("None");
			}
		},

		/**
		 * press function for dialog begin button
		 * @param dialog object
		 * @param fileuploader object
		 * @param successCallback function
		 **/
		onPressFileUploadOnDialog: function (dialog, oFileUploader, successCallback) {
			var textArea = dialog.getContent()[0],
				sValue = textArea.getValue();
			if (sValue !== "") {
				textArea.setValueState("None");
				dialog.close();
				successCallback(sValue, oFileUploader);
			} else {
				textArea.setValueState("Error");
			}
		}
	});
});