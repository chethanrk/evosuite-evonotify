sap.ui.define([
	"com/evorait/evonotify/controller/FormController"
], function (FormController) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.controller.NotificationDetail", {

		oViewModel: null,

		oSmartForm: null,

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

		onPressSmartField: function (oEvent) {
			var oSource = oEvent.getSource();
			this.openApp2AppPopover(oSource, oSource.getUrl());
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
				this.oSmartForm.setEditable(false);
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
			this.oSmartForm.setEditable(true);
			this.oViewModel.setProperty("/editMode", true);
		},

		/**
		 * on save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.oSmartForm) {
				var mErrors = this.validateForm(this.oSmartForm);
				//if form is valid save created entry
				this.saveChanges(mErrors, this.saveSuccessFn.bind(this));
			} else {
				//todo show message
			}
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			sap.m.MessageToast.show(msg);
			this.oSmartForm.setEditable(false);
			this.oViewModel.setProperty("/editMode", false);			
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
				this.oSmartForm.setEditable(false);
				this.oViewModel.setProperty("/editMode", false);
			}
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		_initializeView: function () {
			this.oSmartForm = this.getView().byId("smartFormTemplate");
			this.oSmartForm.setEditable(false);
			this.oViewModel.setProperty("/editMode", false);
			this.oViewModel.setProperty("/operationsRowsCount", 0);

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
				}, null, null, this.getView());
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NotificationNo);
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