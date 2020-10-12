sap.ui.define([
	"com/evorait/evonotify/controller/FormController"
], function (FormController) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.controller.NotificationItemDetail", {

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
				this.saveChanges(mErrors, this.saveCreateSuccessFn.bind(this));
			} else {
				//todo show message
			}
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		saveCreateSuccessFn: function (oResponse) {
			var notificationId = null,
				oChangeData = this.getBatchChangeResponse(oResponse);

			if (oChangeData) {
				notificationId = oChangeData.MaintenanceNotification;

				if (notificationId && notificationId !== "") {
					this.oViewModel.setProperty("/newCreatedNotification", true);
					this.getRouter().navTo("object", {
						objectId: notificationId
					});
				} else {
					var msg = this.getResourceBundle().getText("msg.saveSuccess");
					sap.m.MessageToast.show(msg);
					this.navBack();
				}
			}
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
	});
});