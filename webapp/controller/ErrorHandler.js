sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox",
	"sap/ui/core/message/Message"
], function (UI5Object, MessageBox, Message) {
	"use strict";

	return UI5Object.extend("com.evorait.evosuite.evonotify.controller.ErrorHandler", {
		
		metadata: {
			methods: {
				constructor: {
					public: true,
					final: true
				}
			}
		},

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias com.evorait.evosuite.evonotify.controller.ErrorHandler
		 */

		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("errorText");
			this._oMessageModel = this._oComponent.getModel("messageManager");

			this._oModel.attachMetadataFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				this._showServiceError(this._extractError(oParams.response));
			}, this);

			this._oModel.attachRequestFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== 404) {
					//this._showServiceError(this._extractError(oParams.response));
				}
			}, this);

			this._oModel.attachBatchRequestCompleted(function (oEvent) {
				var oParams = oEvent.getParameters();

				if (oParams.success) {
					this.sSuccessMessage = "";
					this.sErrorMessage = "";
					for (var i = 0; i < oParams.requests.length; i++) {
						var aEntry = oParams.requests[i];
						//Collect all response from batch request which are successfully updated
						if (aEntry.method === "MERGE") {
							this._extractBatchResponseMessage(aEntry, false);
						} else if (aEntry.method === "POST") {
							this._extractBatchResponseMessage(aEntry, true);
						}
					}
					//Show success or error message in the message box if it exists
					if (this.sSuccessMessage !== "" || this.sErrorMessage !== "") {
						this._showServiceMessage();
					}
				}
			}, this);
		},

		/***
		 * Adds Success Message from Batch response to Message Manager
		 * @param message information to be shown in message manager
		 */
		_addSuccessMessageToMessageManager: function (message) {
			var oMessage = new Message({
				message: message,
				type: sap.ui.core.MessageType.Success,
				processor: this._oMessageModel,
				technical: true
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		/***
		 * Adds the error message from Batch response to Message Manager
		 * @param message information to be shown in message manager
		 */
		_addFailureMessageToMessageManager: function (message) {
			var oMessage = new Message({
				message: message,
				type: sap.ui.core.MessageType.Error,
				processor: this._oMessageModel,
				technical: true
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @private
		 * @param sMessage
		 */
		_showServiceError: function (sMessage) {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			if (typeof sMessage === "object") {
				sMessage = this._extractError(sMessage.response);
			}

			MessageBox.error(
				this._sErrorText, {
					details: sMessage.replace(/\n/g, "<br/>"),
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @private
		 */
		_showServiceMessage: function () {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;

			//if no error message presents, then show information
			if (this.sErrorMessage !== "") {
				var msg = this._oResourceBundle.getText("msg.notificationSubmitFail") + "\n\n";
				MessageBox.error(
					this.sSuccessMessage + "\n" + this._sErrorText + ", " + msg, {
						details: this.sErrorMessage.replace(/\n/g, "<br/>"),
						styleClass: this._oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			} else {
				MessageBox.success(
					this.sSuccessMessage, {
						styleClass: this._oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			}
		},

		/**
		 * Extract success/failure message from a backend message class.
		 * @param oDetails
		 * @param bShowSuccessPopup
		 * @private
		 */
		_extractBatchResponseMessage: function (oDetails, bShowSuccessPopup) {
			if (oDetails.response.headers["return-message"]) {
				this._showMsgByType(oDetails, bShowSuccessPopup);
			} else {
				this._showMsgByStatusText(oDetails, bShowSuccessPopup);
			}
		},

		_aShowMsgNeverSets: ["PMNotificationESignSet"],
		_isNotMsgFromSet: function (sUrl, aSet) {
			for (var i = 0; i < this._aShowMsgNeverSets.length; i++) {
				if (sUrl.indexOf(this._aShowMsgNeverSets[i]) >= 0) {
					return false;
				}
			}
			return true;
		},

		/**
		 * extract message when batch response statusText
		 * When statusText no content has try to fetch data from oDataModel by url
		 * @params oBatchResponse
		 * @params bShowSuccessPopup
		 */
		_showMsgByStatusText: function (oBatchResponse, bShowSuccessPopup) {
			if (oBatchResponse.response.statusCode >= 200 && oBatchResponse.response.statusCode < 300) {
				// on success no content are coming from backend so fetch details from oDataModel
				var oData = this._oModel.getProperty("/" + oBatchResponse.url),
					sNumber = oData ? oData.ObjectKey : "",
					msg = this._oResourceBundle.getText("msg.saveSuccess");

				if (sNumber) {
					msg = this._oResourceBundle.getText("msg.notificationSubmitSuccess", sNumber);
				}
				if (bShowSuccessPopup) {
					if (sNumber) {
						this.sSuccessMessage += msg;
					} else if (this._isNotMsgFromSet(oBatchResponse.url)) {
						this.sSuccessMessage = msg;
					}
				}
				if (this._isNotMsgFromSet(oBatchResponse.url)) {
					this._addSuccessMessageToMessageManager(msg);
				}
			} else {
				var errorMessage = this._extractError(oBatchResponse.response);
				this._addFailureMessageToMessageManager(errorMessage);
				this._showServiceError(errorMessage);
			}
		},

		/**
		 * extract message when batch response type is success 
		 * but an return message is set and in header typ is declared
		 * Success: type = S
		 * Error: type = E
		 * @params oBatchResponse
		 * @params bShowSuccessPopup
		 */
		_showMsgByType: function (oBatchResponse, bShowSuccessPopup) {
			var responseMessage = oBatchResponse.response.headers["return-message"];
			var responseType = oBatchResponse.response.headers.type;
			var aResponseMsg = responseMessage.split("||");

			if (responseType === "E") {
				var strError = "";
				for (var i = 0; i < aResponseMsg.length - 1; i++) {
					strError += String.fromCharCode("8226") + " " + aResponseMsg[i] + "\n\n";
				}
				this.sErrorMessage += strError;
				this._addFailureMessageToMessageManager(strError);
			} else if (responseType === "S") {
				var strSuccess = "";
				for (var j = 0; j < aResponseMsg.length - 1; j++) {
					strSuccess += String.fromCharCode("8226") + " " + aResponseMsg[j] + "\n\n";
				}
				if (bShowSuccessPopup) {
					this.sSuccessMessage += strSuccess;
				}
				this._addSuccessMessageToMessageManager(strSuccess);
			}
		},

		/**
		 * Extract errors from a backend message class
		 * either messages from the backend message class or return the initial error object
		 * @param oResponse
		 * @returns {{responseText}|*|string|string|{responseText}|*}
		 * @private
		 */
		_extractError: function (oResponse) {
			if (!oResponse) {
				return this._oResourceBundle.getText("errorText");
			}
			if (oResponse.responseText) {
				var parsedJSError = null;
				try {
					parsedJSError = jQuery.sap.parseJS(oResponse.responseText);
				} catch (err) {
					return oResponse;
				}
				if (parsedJSError && parsedJSError.error && parsedJSError.error.code) {
					var strError = "";
					//check if the error is from our backend error class
					if (parsedJSError.error.innererror && parsedJSError.error.innererror.errordetails) {
						var aInnerDetails = parsedJSError.error.innererror.errordetails;
						if (aInnerDetails.length > 0) {
							for (var i = 0; i < aInnerDetails.length; i++) {
								strError += String.fromCharCode("8226") + " " + aInnerDetails[i].message + "\n\n";
							}
						} else {
							strError = parsedJSError.error.code + ": " + parsedJSError.error.message.value;
						}
					} else {
						//if there is no message class found
						return oResponse;
					}
					return strError;
				}
			} else if (oResponse.body) {
				return oResponse.body;
			}
			return oResponse;
		}
	});
});