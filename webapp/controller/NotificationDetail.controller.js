sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController"
], function (FormController) {
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
			sap.m.MessageToast.show(msg);
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
			this._setSelectFunctionVisibility();
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

			if (this.oViewModel.getProperty("/newCreatedNotification") === true) {
				this.getModel().refresh(true);
			}
		},

		/**
		 * Show select status dialog with maybe pre-selected filter
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			this._oContext = this.getView().getBindingContext();
			var sSelFunctionKey = oEvent.getParameter("item").getKey(),
				oData = this._oContext.getObject(),
				sPath = this._oContext.getPath(),
				message = "";

			if (oData["ALLOW_" + sSelFunctionKey]) {
				this.getModel().setProperty(sPath + "/FUNCTION", sSelFunctionKey);
				this.saveChanges({
					state: "success"
				}, this.saveSuccessFn.bind(this), null, this.getView());
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
				this.showInformationDialog(message);
				//this.addMsgToMessageManager(this.mMessageType.Error, message, "/WorkList");
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
					if (!this._oContext) {
						this.getRouter().navTo("ObjectNotFound");
					}
					this._setSelectFunctionVisibility();
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
		}
	});
});