sap.ui.define([
	"com/evorait/evonotify/controller/FormController"
], function (FormController) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.controller.ObjectNew", {

		oViewModel: null,
		oForm: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			//route for page create new order
			oRouter.getRoute("CreateNotification").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * life cycle event after view rendering
		 */
		onAfterRendering: function () {
			this._initializeView();
		},
		
		/**
		 * 
		 */
		_initializeView: function () {
			this.oViewModel = this.getModel("viewModel");
			this.oViewModel.setProperty("/route", "CreateNotification");
			this.oViewModel.setProperty("/editMode", true);
			this.oViewModel.setProperty("/isNew", true);

			setTimeout(function () {
				this.oForm = this.getView().byId("smartFormTemplate");
			}.bind(this), 500);
		},

		/**
		 * on press back button
		 * @param oEvent
		 */
		onNavBack: function () {
			//show confirm message
			this.confirmEditCancelDialog();
		},

		/**
		 * Object on exit
		 */
		onExit: function () {

		},

		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				sFieldName = oSource.getName();

			if (sFieldName) {
				if (sFieldName === "idFunctionalLocation" || sFieldName === "idEquipment") {
					this._validateFuncLocEquip(oSource);
				}
			}
		},

		/**
		 * On press cancel button
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			//show confirm message
			this.confirmEditCancelDialog();
		},

		/**
		 * On press save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.oForm) {
				var mErrors = this.validateForm(this.oForm);
				//if form is valid save created entry
				this.saveChanges(mErrors, this._saveCreateSuccessFn.bind(this));
			} 
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * success callback after creating order
		 * @param oResponse
		 */
		_saveCreateSuccessFn: function (oResponse) {
			var notificationId = null,
				oChangeData = this._getBatchChangeRepsonse(oResponse);

			if (oChangeData) {
				notificationId = oChangeData.MaintenanceNotification;

				if (notificationId && notificationId !== "") {
					this.oViewModel.setProperty("/newCreatedEntry", true);
					this.getRouter().navTo("object", {
						objectId: notificationId
					});
				} else {
					var msg = this.getResourceBundle().getText("msg.saveSuccess");
					sap.m.MessageToast.show(msg);
					this.navBack();
				}
			}
		}
	});
});