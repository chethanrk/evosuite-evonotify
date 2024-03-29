sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evosuite/evonotify/model/Constants",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/core/Fragment",
	"sap/ui/core/message/Message",
	"sap/ui/core/library"
], function (Controller, JSONModel, History, Dialog, Button, Text, MessageToast, MessageBox, Filter, FilterOperator, Constants, formatter,
	Fragment, Message, library) {
	"use strict";

	return Controller.extend("com.evorait.evosuite.evonotify.controller.BaseController", {

		metadata: {
			methods: {
				getRouter: {
					public: true,
					final: true
				},
				getModel: {
					public: true,
					final: true
				},
				setModel: {
					public: true,
					final: true
				},
				getCurrentHash: {
					public: true,
					final: true
				},
				navBack: {
					public: true,
					final: true
				},
				onNavToList: {
					public: true,
					final: true
				},
				getResourceBundle: {
					public: true,
					final: true
				},
				getViewUniqueName: {
					public: true,
					final: true
				},
				getFormLocalStorage: {
					public: true,
					final: true
				},
				setFormFieldData2Storage: {
					public: true,
					final: true
				},
				setFormStorage2FieldData: {
					public: true,
					final: true
				},
				deleteExpiredStorage: {
					public: true,
					final: true
				},
				translateStatusKey: {
					public: true,
					final: true
				},
				isFormValidation: {
					public: true,
					final: true
				},
				generateHelperJsonModel: {
					public: true,
					final: true
				},
				getTableRowObject: {
					public: true,
					final: true
				},
				showSaveErrorPrompt: {
					public: true,
					final: true
				},
				saveNewStatus: {
					public: true,
					final: true
				},
				showMessageToast: {
					public: true,
					final: true
				},
				addMsgToMessageManager: {
					public: true,
					final: true
				},
				getDependenciesAndCallback: {
					public: true,
					final: true
				},
				openEvoAPP: {
					public: true,
					final: true
				},
				openApp2AppPopover: {
					public: true,
					final: true
				},
				showInformationDialog: {
					public: true,
					final: true
				},
				onIconPress: {
					public: true,
					final: true
				},
				onCloseDialog: {
					public: true,
					final: true
				},
				onMessageManagerPress: {
					public: true,
					final: true
				},
				clearAllMessages: {
					public: true,
					final: true
				},
				displayLongText: {
					public: true,
					final: true
				}
			}
		},

		formatter: formatter,

		mMessageType: library.MessageType,
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			if (this.getOwnerComponent()) {
				return this.getOwnerComponent().getModel(sName);
			}
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * get current hash 
		 */
		getCurrentHash: function () {
			var oRouter = this.getRouter();
			if (oRouter.getHashChanger) {
				return oRouter.getHashChanger().getHash();
			}
			var browserUrl = window.location.hash,
				sHash = browserUrl.replace("#", "");
			return sHash;
		},

		/**
		 * navigate a history page back or to home page
		 */
		navBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		onNavToList: function () {
			this.getRouter().navTo("worklist", {}, true);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			if (this.getOwnerComponent()) {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			}
			return this.getView().getModel("i18n").getResourceBundle();
		},

		/**
		 * gets unique view id setted by TemplateRenderer
		 * @return string
		 */
		getViewUniqueName: function () {
			var sViewId = this.getView().getId(),
				sViewName = this.getView().getViewName();
			return sViewName + "#" + sViewId;
		},

		getFormLocalStorage: function () {
			return this.getOwnerComponent().oFormStorage;
		},

		/**
		 * Saves a SmartField property name and value into local storage
		 * @param {string} sSourceName
		 * @param {string} sValue
		 */
		setFormFieldData2Storage: function (sSourceName, sValue, bOverwrite) {
			var sViewNameId = this.getViewUniqueName(),
				oParsedData = this.getFormLocalStorage().get(sViewNameId);
			try {
				oParsedData = JSON.parse(oParsedData);
				if (!oParsedData) {
					oParsedData = {};
				}
				if (sSourceName.startsWith("id")) {
					sSourceName = sSourceName.replace("id", "");
				}
				if (!oParsedData[sSourceName] || (oParsedData[sSourceName] && bOverwrite)) {
					if (Object.prototype.toString.call(sValue) === "[object Date]") {
						oParsedData[sSourceName] = {
							type: "date",
							value: sValue
						};
					} else {
						oParsedData[sSourceName] = sValue;
					}
				}
				this.getFormLocalStorage().put(sViewNameId, JSON.stringify(oParsedData));
				this.getFormLocalStorage().put("_expires", JSON.stringify(Date.now() + (3600 * 1000 * 12))); //12h in future
			} catch (error) {
				//do nothing
			}
		},

		/**
		 * get local storage saved form values by view unique id 
		 * and set then to binded context path
		 * @param {string} sPath
		 */
		setFormStorage2FieldData: function (sPath) {
			var sViewNameId = this.getViewUniqueName(),
				oParsedData = this.getFormLocalStorage().get(sViewNameId);
			try {
				oParsedData = JSON.parse(oParsedData);
				if (oParsedData) {
					for (var key in oParsedData) {
						var sValue = oParsedData[key];
						if (sValue && typeof sValue === "object" && sValue.type === "date") {
							sValue = new Date(sValue.value);
						}
						this.getModel().setProperty(sPath + "/" + key, sValue);
					}
				}
			} catch (error) {
				//do nothing
			}
		},

		/**
		 * delete from local storage special view form fields
		 * or when date was expried after 12h delete all form field storage
		 * @param {string} sViewId
		 */
		deleteExpiredStorage: function (sViewId, bDeleteAll) {
			if (sViewId) {
				this.getFormLocalStorage().remove(sViewId);
			}
			if (bDeleteAll) {
				this.getFormLocalStorage().removeAll();
			}
			try {
				var expiresAt = this.getFormLocalStorage().get("_expires");
				expiresAt = JSON.parse(expiresAt);
				if (expiresAt && expiresAt < Date.now()) {
					this.getFormLocalStorage().removeAll();
				}
			} catch (error) {
				//do nothing
			}
		},

		/**
		 * translate the stausKey from model to app lagunage
		 * @param sValue
		 * @returns {string|*}
		 */
		translateStatusKey: function (sValue) {
			if (sValue) {
				return this.getResourceBundle().getText(sValue);
			}
			return "";
		},

		/**
		 * check if form is valid
		 * @param oEvent
		 */
		isFormValidation: function (oEvent) {
			var oParams = oEvent.getParameters(),
				oContext = this.getView().getBindingContext();

			if (oParams.state === "success") {
				return true;
			} else if (oParams.state === "error") {
				return false;
			}
			return false;
		},

		/**
		 * generates a json model with a list of expanded entity properties
		 * helper for reuse table blockviews
		 */
		generateHelperJsonModel: function (oContext, sPropertyName, sModelName) {
			var arr = [],
				aPaths = oContext.getProperty(sPropertyName);
			if (aPaths) {
				for (var i = 0; i < aPaths.length; i++) {
					arr.push(this.getModel().getProperty("/" + aPaths[i]));
				}
			}
			this.setModel(new JSONModel({
				modelData: arr
			}), sModelName);
		},

		getTableRowObject: function (oParameters, sModelName) {
			var oRow = sap.ui.getCore().byId(oParameters.id);
			var sPath = oRow.getBindingContextPath();
			var oObj = this.getModel().getProperty(sPath);

			if (!oObj && sModelName) {
				var sBinding = oRow.getBindingContext(sModelName);
				return sBinding.getObject();
			}
			return this.getModel().getProperty(sPath);
		},

		/**
		 * save error dialog
		 */
		showSaveErrorPrompt: function (error) {
			var oBundle = this.getResourceBundle();
			var sTitle = oBundle.getText("tit.error");
			var sMsg = oBundle.getText("msg.errorText");
			var sBtn = oBundle.getText("btn.close");

			var dialog = new Dialog({
				title: sTitle,
				type: "Message",
				state: "Error",
				content: new Text({
					text: sMsg + "\n\n" + error
				}),
				beginButton: new Button({
					text: sBtn,
					tooltip: sBtn,
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			dialog.open();
		},

		/**
		 * saves a new status for notifcation header or task
		 */
		saveNewStatus: function (sRequestName, obj) {
			var oViewModel = this.getModel("viewModel");

			this.getModel().callFunction(sRequestName, {
				method: "POST",
				urlParameters: obj,
				success: function (oData, response) {
					oViewModel.setProperty("/busy", false);
					var sMsg = "";
					var errMsg = sap.ui.getCore().getMessageManager().getMessageModel().getData();
					for (var i = 0; i < errMsg.length; i++) {
						sMsg = sMsg + errMsg[i].message;
					}
					if (sMsg === "") {
						sMsg = oData.MaintenanceNotification + "/" + (oData.MaintenanceNotificationTask || "") + " " + this.getResourceBundle().getText(
							"msg.saveStatusSuccess");
					}
					this.showMessageToast(sMsg);

				}.bind(this), // callback function for success

				error: function (oError) {
					oViewModel.setProperty("/busy", false);
				}.bind(this)
			});
		},

		/**
		 * show a message toast for 5 seconds
		 * @param msg
		 */
		showMessageToast: function (msg) {
			MessageToast.show(msg, {
				duration: 5000, // default
				my: "center center", // default
				at: "center center", // default
				of: window, // default
				offset: "0 20", // default
				collision: "fit fit", // default
				onClose: null, // default
				autoClose: true, // default
				animationTimingFunction: "ease", // default
				animationDuration: 1000, // default
				closeOnBrowserNavigation: true // default
			});
		},

		/**
		 * Create Success, Warning, Info, Error message and add to MessageManager
		 * @param sType
		 * @param sMessage
		 * @param sTarget
		 */
		addMsgToMessageManager: function (sType, sMessage, sTarget) {
			var oMessage = new Message({
				message: sMessage,
				type: sType,
				target: sTarget,
				processor: this.getModel("messageManager"),
				technical: true
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		/**
		 * fetch based on context NotifcationType parameters 
		 * and open the Add Dialog
		 */
		getDependenciesAndCallback: function (callbackFn) {
			this.resetModelChanges();
			var oContextData = this.getView().getBindingContext().getObject();
			this._getNotifTypeDependencies(oContextData).then(function (result) {
				callbackFn(oContextData, result);
			}.bind(this)).catch(function (error) {
				callbackFn(oContextData);
			}.bind(this));
		},

		/**
		 * based on Notifcation type get default catalogs and groups
		 * @return Promise
		 */
		getNotifTypeDependencies: function (oData) {
			return new Promise(function (resolve, reject) {
				if (!oData.NOTIFICATION_TYPE) {
					reject();
					return;
				}
				var sPath = this.getModel().createKey("SHNotificationTypeSet", {
					QMART: oData.NOTIFICATION_TYPE || oData.NOTIFICATION_TYPE
				});

				this.getModel().read("/" + sPath, {
					success: function (result) {
						resolve(result);
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},

		/**
		 * confirm messageBox for all cases of confirmations
		 * @param msg
		 */
		confirmDialog: function (msg, successCallback, cancelCallback) {
			MessageBox.confirm(msg, {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === MessageBox.Action.OK && successCallback) {
						successCallback();
					} else if (cancelCallback) {
						cancelCallback();
					}
				}
			});
		},

		/**
		 *	Navigates to evoOrder detail page with static url.
		 * @param sKeyParameter
		 * @param sAppID
		 */
		openEvoAPP: function (sParamValue, sAppID) {
			var sUri, sSemanticObject, sParameter,
				sAction,
				sAdditionInfo,
				sLaunchMode = this.getModel("viewModel").getProperty("/launchMode"),
				oAppInfo = this._getAppInfoById(sAppID);

			// if there is no configuration maintained in the backend
			if (oAppInfo === null) {
				return;
			}

			if (sLaunchMode === Constants.LAUNCH_MODE.FIORI) {
				sAdditionInfo = oAppInfo.Value1 || "";
				sSemanticObject = sAdditionInfo.split("\\\\_\\\\")[0];
				sAction = sAdditionInfo.split("\\\\_\\\\")[1] || "Display";
				sParameter = sAdditionInfo.split("\\\\_\\\\")[2];
				if (sSemanticObject && sAction) {
					this._navToApp(sSemanticObject, sAction, sParameter, sParamValue);
				}
				return;
			} else {
				sAdditionInfo = oAppInfo.Value1;
				sUri = (sAdditionInfo).replace("\\\\place_h1\\\\", sParamValue);
				window.open(sUri, "_blank");
			}
		},

		/**
		 * render a popover with button inside
		 * next to Notification ID or Equipment ID
		 * @param oSource
		 * @param sProp
		 */
		openApp2AppPopover: function (oSource, sProp) {
			var oNavLinks = this.getModel("templateProperties").getProperty("/navLinks"),
				oContext = oSource.getBindingContext();

			if (oContext && oNavLinks[sProp]) {
				var sPath = oContext.getPath() + "/" + oNavLinks[sProp].Property;
				var oPopover = new sap.m.ResponsivePopover({
					placement: sap.m.PlacementType.Right,
					showHeader: false,
					showCloseButton: true,
					afterClose: function () {
						oPopover.destroy(true);
					}
				});
				var oButton = new sap.m.Button({
					text: this.getResourceBundle().getText("btn.App2App", oNavLinks[sProp].ApplicationName),
					icon: "sap-icon://action",
					press: function () {
						oPopover.close();
						oPopover.destroy(true);
						this.openEvoAPP(this.getModel().getProperty(sPath), oNavLinks[sProp].ApplicationId);
					}.bind(this)
				});
				oPopover.insertContent(oButton);
				oPopover.openBy(oSource);
			}
		},

		/**
		 * show showInformationDialog dialog with ok
		 * Yes execute successFn
		 * No execute errorFn
		 * @param successFn
		 * @param errorFn
		 */
		showInformationDialog: function (msg, successFn, errorFn) {
			var oBundle = this.getModel("i18n").getResourceBundle();

			var dialog = new Dialog({
				title: oBundle.getText("tit.informationTitle"),
				type: 'Message',
				content: new Text({
					text: msg
				}),
				beginButton: new Button({
					type: sap.m.ButtonType.Emphasized,
					text: oBundle.getText("btn.ok"),
					tooltip: oBundle.getText("btn.ok"),
					press: function () {
						if (successFn) successFn();
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			dialog.open();
		},

		/**
		 * Initialize and open the Information dialog with necessary details
		 * @param oEvent Button press event
		 */
		onIconPress: function (oEvent) {
			// create popover
			if (!this._infoDialog) {
				Fragment.load({
					name: "com.evorait.evosuite.evonotify.view.fragments.InformationPopover",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._infoDialog = oFragment;
					this.getView().addDependent(oFragment);
					this._infoDialog.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._infoDialog.open();
				}.bind(this));
			} else {
				this._infoDialog.open();
			}
		},

		/**
		 * Closes the information dialog
		 */
		onCloseDialog: function () {
			this._infoDialog.close();
		},

		/**
		 * Open Message Manager on click
		 * @param oEvent
		 */
		onMessageManagerPress: function (oEvent) {
			this._openMessageManager(this.getView(), oEvent);
		},

		/**
		 * Clear all message present in the MessageManager
		 */
		clearAllMessages: function () {
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		/**
		 * Display Long text on MessageBox
		 * @param longText
		 */
		displayLongText: function (longText) {
			var title = this.getView().getModel("i18n").getResourceBundle().getText("tit.longText");
			MessageBox.show(longText, {
				title: title,
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				actions: [MessageBox.Action.OK]
			});
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * On click, open Message Popover
		 */
		_openMessageManager: function (oView, oEvent) {
			this.getOwnerComponent().MessageManager.open(oView, oEvent);
		},

		/**
		 * based on Notifcation type get default catalogs and groups
		 * @return Promise
		 */
		_getNotifTypeDependencies: function (oData) {
			return new Promise(function (resolve, reject) {
				if (!oData.NOTIFICATION_TYPE) {
					reject();
					return;
				}
				var sPath = this.getModel().createKey("SHNotificationTypeSet", {
					QMART: oData.NOTIFICATION_TYPE || oData.NOTIFICATION_TYPE
				});

				this.getModel().read("/" + sPath, {
					success: function (result) {
						resolve(result);
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},

		/**
		 * get respective navigation details
		 * @param sAppID
		 */
		_getAppInfoById: function (sAppID) {
			var aNavLinks = this.getModel("templateProperties").getProperty("/navLinks");
			for (var i in aNavLinks) {
				if (aNavLinks[i].ApplicationId === sAppID) {
					return aNavLinks[i];
				}
			}
			return null;
		},
		/**
		 * @param sSemanticObject
		 * @param sAction
		 * @param sParameter
		 * @param sKeyParameter
		 */
		_navToApp: function (sSemanticObject, sAction, sParameter, sParamValue) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"),
				mParams = {};

			mParams[sParameter] = [sParamValue];
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: sSemanticObject,
					action: sAction
				},
				params: mParams
			});
		},

		/** Reset model changes on page reload */
		resetModelChanges: function () {
			if(this.getModel().hasPendingChanges()) {
				this.getModel().resetChanges();
			}
		}

	})

});