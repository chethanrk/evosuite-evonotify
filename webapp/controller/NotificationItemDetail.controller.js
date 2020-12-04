sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evosuite/evonotify/model/Constants"
], function (FormController, Filter, FilterOperator, Constants) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.NotificationItemDetail", {

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
			oRouter.getRoute("NotificationItemDetail").attachMatched(function (oEvent) {
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
				var sPath = this.getView().getBindingContext().getPath();
				this.confirmEditCancelDialog(sPath, true);
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
			this.oSmartForm.setEditable(true);
			this.oViewModel.setProperty("/editMode", true);
		},

		/**
		 * on save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.oSmartForm) {
				var mErrors = this.validateForm(this.oSmartForm),
					oContext = this.getView().getBindingContext();
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
				var sPath = this.getView().getBindingContext().getPath();
				this.confirmEditCancelDialog(sPath);
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
		},

		/**
		 * navigate on breadcrumb link back to notifcation detail page
		 * @public
		 */
		onNavToNotification: function () {
			var obj = this.getView().getBindingContext().getObject();
			this.getRouter().navTo("NotificationDetail", {
				ObjectKey: obj.ObjectKey
			}, true);
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
					} else {
						if (!this.getModel("viewModel").getProperty("/enableNotificationChange")) {
							this._getNotificationDetails(this._oContext.getObject().HeaderObjectKey);
						}
					}
				}
			}
		},

		_getNotificationDetails: function (filterParameter) {
			var oFilter1 = new Filter("ObjectKey", FilterOperator.EQ, filterParameter);
			this.getOwnerComponent().readData("/PMNotificationSet", [
				[oFilter1]
			]).then(function (oData) {
				this.getModel("viewModel").setProperty("/enableNotificationChange", oData.results[0].ENABLE_NOTIFICATION_CHANGE);
			}.bind(this));
		}
	});
});