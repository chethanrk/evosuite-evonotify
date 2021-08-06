sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/core/Fragment",
	"sap/ui/util/Storage"
], function (FormController, Fragment, Storage) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.NotificationDetail", {

		oViewModel: null,
		aSmartForms: [],

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");

			var oRouter = this.getRouter();
			//route for page create new order
			oRouter.getRoute("NotificationDetail").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);

		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * Object after rendering
		 */
		onAfterRendering: function () {
			this._initializeView();

		},

		/**
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
			if (this._actionSheetSystemStatus) {
				this._actionSheetSystemStatus.destroy(true);
				this._actionSheetSystemStatus = null;
			}
		},

		/**
		 * on press back button
		 * @param oEvent
		 */
		onNavBack: function (oEvent) {
			if (this.oViewModel.getProperty("/newCreatedNotification")) {
				this.oViewModel.setProperty("/newCreatedNotification", false);
				this.getView().unbindElement();
				this.getRouter().navTo("worklist", {}, true);
			} else if (this.oViewModel.getProperty("/editMode") && this.getModel().hasPendingChanges()) {
				//show confirm message
				this.confirmEditCancelDialog(this.sPath, true);
			} else {
				this.getView().unbindElement();
				this.setFormsEditable(this.aSmartForms, false);
				this.oViewModel.setProperty("/editMode", false);
				this.getView().unbindElement();
				this.navBack();
			}
		},

		/**
		 * on edit button
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			this.sPath = this.getView().getBindingContext().getPath();
			this.setFormsEditable(this.aSmartForms, true);
			this.oViewModel.setProperty("/editMode", true);
		},

		/**
		 * on save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.aSmartForms.length > 0) {
				var mErrors = this.validateForm(this.aSmartForms);
				this.saveChanges(mErrors, this.saveSuccessFn.bind(this));
			}
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showSuccessMessage(msg);
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
			this._setNotificationStatusButtonVisibility(this._oContext.getObject());
		},

		/**
		 * cancel creation
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			//show confirm message
			if (this.getModel().hasPendingChanges()) {
				this.confirmEditCancelDialog(this.sPath);
			} else {
				this.setFormsEditable(this.aSmartForms, false);
				this.oViewModel.setProperty("/editMode", false);
			}
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
		},

		/**
		 * Show select status dialog with maybe pre-selected filter
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			var oSource = oEvent.getSource(),
				oItem = oEvent.getParameter("item");

			this.sFunctionKey = oItem ? oItem.data("key") : oSource.data("key");
			if (this._showESign()) {
				if (!this._eSignDialog) {
					Fragment.load({
						name: "com.evorait.evosuite.evonotify.view.fragments.ESignFormDialog",
						controller: this,
						type: "XML"
					}).then(function (oFragment) {
						this._eSignDialog = oFragment;
						this._setESignFragmentBinding();
					}.bind(this));
				} else {
					this._setESignFragmentBinding();
				}

			} else {
				this._updateStatus();
			}
		},

		/**
		 * load new template and set inside dialog
		 * Bind dialog view to generated path
		 */
		_setESignFragmentBinding: function () {
			this.oEsignContext = this.getModel().createEntry("/PMNotificationESignSet");
			this._eSignDialog.setBindingContext(this.oEsignContext);
			this._eSignDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this._initializeESignModel();
			this.getView().addDependent(this._eSignDialog);
			this._eSignDialog.open();
		},

		/**
		 * function to update the satus
		 */
		_updateStatus: function () {
			var oData = this._oContext.getObject(),
				sPath = this._oContext.getPath(),
				message = "";
			this._oContext = this.getView().getBindingContext();

			if (oData["ALLOW_" + this.sFunctionKey]) {
				this.getModel("viewModel").setProperty("/isStatusUpdate", true);
				this.getModel().setProperty(sPath + "/FUNCTION", this.sFunctionKey);
				this.saveChanges({
					state: "success"
				}, this.saveSuccessFn.bind(this), null, this.getView());
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
				this.showInformationDialog(message);
			}
		},

		/**
		 * TemplateRenderer changedBinding Event
		 * set new this._oContext
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoNotify" && sEvent === "changedBinding") {
				var sViewName = this.getView().getViewName() + "#" + this.getView().getId();

				if (oData && (oData.viewNameId === sViewName)) {
					this._oContext = this.getView().getBindingContext();

					if (this.oViewModel.getProperty("/newCreatedNotification") === true) {
						this.oViewModel.setProperty("/newCreatedNotification", false);
						//refresh only this binding and not whole oDataModel
						this.getView().getElementBinding().refresh();
					}

					if (!this._oContext) {
						this.getRouter().navTo("ObjectNotFound");
					} else {
						this._setNotificationStatusButtonVisibility(this._oContext.getObject());
					}
				}
			}
		},

		/**
		 * set visibility on status change dropdown items based on allowance from order status
		 */
		_setSelectFunctionVisibility: function () {
			if (this._oContext) {
				var oData = this._oContext.getObject(),
					oStatusSelectControl = this.getView().byId("idStatusChangeMenu"),
					oMenu = oStatusSelectControl.getMenu();

				oMenu.getItems().forEach(function (oItem) {
					oItem.setVisible(oData["ALLOW_" + oItem.getKey()]);
				}.bind(this));
			}
		},

		/**
		 * set visibility on status change dropdown items based on allowance from order status
		 */
		_setNotificationStatusButtonVisibility: function (oData) {

			var mNotificationAllows = {};
			for (var key in oData) {
				if (key.startsWith("ALLOW_")) {
					mNotificationAllows[key] = oData[key];
				}
			}
			this.oViewModel.setProperty("/NotificationAllows", mNotificationAllows);
		},

		/**
		 * show ActionSheet of system status buttons
		 * @param oEvent
		 */
		onPressChangeSystemStatus: function (oEvent) {
			var oButton = oEvent.getSource();
			// create action sheet only once
			if (!this._actionSheetSystemStatus) {
				Fragment.load({
					name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetSystemStatus",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._actionSheetSystemStatus = oFragment;
					this.getView().addDependent(oFragment);
					this._actionSheetSystemStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._actionSheetSystemStatus.openBy(oButton);
				}.bind(this));
			} else {
				this._actionSheetSystemStatus.openBy(oButton);
			}
		},

		/*
		 * initialize esign model with the default parameters
		 */
		_initializeESignModel: function () {
			this.aESignSmartForm = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("eSignSmartForm"));
			var sPathESign = this.oEsignContext.getPath(),
				oData = this._oContext.getObject();
			this.getModel().setProperty(sPathESign + "/NOTIFICATION_NO", oData.NOTIFICATION_NO);
			this.getModel().setProperty(sPathESign + "/NOTIFICATION_TYPE", oData.NOTIFICATION_TYPE);
			this.getModel().setProperty(sPathESign + "/NOTIFICATION_ITEM", oData.NOTIFICATION_ITEM);
			this.getModel().setProperty(sPathESign + "/USERNAME", this.getModel("user").getProperty("/Username"));
		},

		/*
		 * Function to decide whether esign should be shown on status update
		 */
		_showESign: function () {
			var isEsignEnabled = this.getModel("user").getProperty("/ENABLE_ESIGN");
			var oData = this._oContext.getObject();
			if (isEsignEnabled === "X" && oData.ALLOW_ESIGN && this.sFunctionKey === "COMPLETE") {
				return true;
			}
			return false;
		},

		/**
		 * Closes the ESign dialog
		 */
		onCloseESignDialog: function () {
			if (this.getView().getModel().hasPendingChanges()) {
				this.getView().getModel().resetChanges();
			}
			this._eSignDialog.close();
		},

		/**
		 * on save esign button
		 * @param oEvent
		 */
		onPressESignSave: function (oEvent) {
			if (this.aESignSmartForm.length > 0) {
				var mErrors = this.validateForm(this.aESignSmartForm);
				if (mErrors.state === "success") {
					var sPathESign = this.oEsignContext.getPath();
					var sPassword = this.getModel().getProperty(sPathESign + "/PASSWORD").trim();
					if (sPassword !== "") {
						var encodedPassword = btoa(sPassword);
						this.getModel().setProperty(sPathESign + "/PASSWORD", encodedPassword);
						this.saveChanges({
							state: "success"
						}, this._onESignSuccessFn.bind(this), null, this._eSignDialog);
					}
				}
			}
		},

		/**
		 * success callback after esign validation
		 * @param oResponse
		 */
		_onESignSuccessFn: function (oResponse) {
			this.onCloseESignDialog();
			this._updateStatus();
		},

		handleESignInput: function (oEvent) {
			var sUserInput = oEvent.getParameter("value");
			var oInputControl = oEvent.getSource();
			if (sUserInput) {
				oInputControl.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputControl.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		/**
		 * on click of Create Order button
		 * Button visible only when order is not linked with Notification
		 */
		onPressCreateOrder: function () {
			// get current timestamp
			var notificationObject = this._oContext.getObject();
			var oMyStorage = new Storage(Storage.Type.local);
			oMyStorage.put("NotificationObject", notificationObject);
			this.openEvoAPP("new", "EVOORDER");
		}
	});
});