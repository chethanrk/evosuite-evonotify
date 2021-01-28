sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evosuite/evonotify/model/Constants",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (Controller, JSONModel, History, Dialog, Button, Text, MessageToast, Filter, FilterOperator, Constants, formatter) {
	"use strict";

	return Controller.extend("com.evorait.evosuite.evonotify.controller.BaseController", {

		formatter: formatter,
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
					text: sMsg
				}),
				beginButton: new Button({
					text: sBtn,
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
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
		 * submit a new entry to SAP
		 * @param sParamId
		 * @param sNavPath
		 */
		saveNewEntry: function (mParams) {
			var sParamId = mParams.entryKey,
				sNavPath = mParams.navPath;

			var oView = mParams.view || this.getView(),
				oModel = oView.getModel(),
				oViewModel = oView.getModel("viewModel");

			oViewModel.setProperty("/busy", true);
			oModel.submitChanges({
				success: function (response) {
					var batch = response.__batchResponses[0],
						sCreatedEntryId = null;

					oViewModel.setProperty("/busy", false);
					//success
					if (response.__batchResponses[0].response && response.__batchResponses[0].response.statusCode === "400") {
						if (mParams.error) {
							mParams.error();
						}
					} else {
						oView.getModel().refresh(true);
						if (batch.__changeResponses) {
							if (batch && (batch.__changeResponses[0].data)) {
								sCreatedEntryId = batch.__changeResponses[0].data[sParamId];
							}
							if (sCreatedEntryId && sCreatedEntryId !== "" && sNavPath) {
								oViewModel.setProperty("/newCreatedNotification", true);
								this.getRouter().navTo("object", {
									objectId: sCreatedEntryId
								});
							} else {
								var msg = oView.getModel("i18n").getResourceBundle().getText("msg.saveSuccess");
								this.showMessageToast(msg);

								if (mParams.success) {
									mParams.success();
								}
							}
						}
					}
				}.bind(this),
				error: function (oError) {
					oViewModel.setProperty("/busy", false);
					if (mParams.error) {
						mParams.error();
					}
				}.bind(this)
			});
		},

		/**
		 * save entry who was in edit mode
		 */
		saveChangedEntry: function (mParams) {
			var oView = mParams.view || this.getView(),
				oViewModel = oView.getModel("viewModel");

			oViewModel.setProperty("/busy", true);

			oView.getModel().submitChanges({
				success: function (response) {
					if (response.__batchResponses && response.__batchResponses[0].response && response.__batchResponses[0].response.statusCode ===
						"400") {
						oViewModel.setProperty("/busy", false);
						if (mParams.error) {
							mParams.error();
						}
					} else {
						var successMsg = oView.getModel("i18n").getResourceBundle().getText("msg.submitSuccess");
						this.showMessageToast(successMsg);
						oView.getModel().refresh(true);
						setTimeout(function () {
							if (mParams.success) {
								mParams.success();
							}
							oViewModel.setProperty("/busy", false);
							oViewModel.setProperty("/editMode", false);
						}.bind(this), 1500);
					}
				}.bind(this),
				error: function (oError) {
					oViewModel.setProperty("/busy", false);
					if (mParams.error) {
						mParams.error();
					}
				}.bind(this)
			});
		},

		/**
		 * show a message toast for 5 seconds
		 * @param msg
		 */
		showMessageToast: function (msg) {
			sap.m.MessageToast.show(msg, {
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
		 * fetch based on context NotifcationType parameters 
		 * and open the Add Dialog
		 */
		getDependenciesAndCallback: function (callbackFn) {
			var oContextData = this.getView().getBindingContext().getObject();
			this.getNotifTypeDependencies(oContextData).then(function (result) {
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
				if (!oData.NotificationType) {
					reject();
					return;
				}
				var sPath = this.getModel().createKey("SHNotificationTypeSet", {
					Qmart: oData.NotificationType || oData.Notificationtype
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
		 * Show dialog when user wants to cancel order change/creations
		 * @private
		 * @param sPath
		 * @param doNavBack
		 */
		_confirmEditCancelDialog: function (sPath, doNavBack) {
			var oResoucreBundle = this.getResourceBundle(),
				oViewModel = this.getModel("viewModel"),
				isNew = oViewModel.getProperty("/isNew");

			var dialog = new sap.m.Dialog({
				title: oResoucreBundle.getText("tit.cancelCreate"),
				type: "Message",
				content: new sap.m.Text({
					text: oResoucreBundle.getText("msg.leaveWithoutSave")
				}),
				beginButton: new sap.m.Button({
					text: oResoucreBundle.getText("btn.confirm"),
					press: function () {
						dialog.close();
						var oContext = this.getView().getBindingContext();

						if (isNew) {
							//delete created entry
							this.navBack();
							this.getModel().deleteCreatedEntry(oContext);
							oViewModel.setProperty("/isNew", false);
						} else {
							//reset changes from object path
							this.getModel().resetChanges(sPath);
							if (doNavBack) {
								//on edit cancel and nav back unbind object
								this.getView().unbindElement();
								this.navBack();
							}
						}
						oViewModel.setProperty("/editMode", false);
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: oResoucreBundle.getText("btn.no"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
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
		showInformationDialog: function(msg, successFn, errorFn){
			var oBundle = this.getModel("i18n").getResourceBundle();

			var dialog = new Dialog({
				title: oBundle.getText("tit.informationTitle"),
				type: 'Message',
				content: new Text({ text: msg }),
				beginButton: new Button({
					type: sap.m.ButtonType.Emphasized,
					text: oBundle.getText("btn.ok"),
					press: function () {
						if(successFn) successFn();
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		/**
		 * On click, open Message Popover
		 */
		openMessageManager: function (oView, oEvent) {
			this.getOwnerComponent().MessageManager.open(oView, oEvent);
		},

		/**
		 * Create Success, Warning, Info, Error message and add to MessageManager
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
		 * Clear all message present in the MessageManager
		 */
		clearAllMessages: function () {
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();
		}
	});

});