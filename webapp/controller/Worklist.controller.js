sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"com/evorait/evonotify/model/formatter",
	"sap/ui/model/json/JSONModel"
], function (BaseController, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.Worklist", {

		formatter: formatter,

		oSmartTable: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.oSmartTable = this.getView().byId("NotificationTable");
		},

		/**
		 * worklist after rendering
		 */
		onAfterRendering: function () {
			this.getModel("viewModel").setProperty("/busy", false);
		},

		/**
		 * worklist on exit
		 */
		onExit: function () {

		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPressTableRow: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			this.oSmartTable.setEditable(false);
			this.getRouter().navTo("OrderDetail", {
				objectId: oContext.getProperty("MaintenanceNotification")
			});
		},

		/**
		 * Event handler to navigate to create notification page
		 * @param oEvent
		 */

		onPressCreateNotification: function () {
			this.oSmartTable.setEditable(false);
			this.getRouter().navTo("CreateNotification", {});
		},

		/**
		 * Initialize and open the Information dialog with necessary details
		 * @param oEvent Button press event
		 */
		onIconPress: function (oEvent) {
			// create popover
			if (!this._infoDialog) {
				this._infoDialog = sap.ui.xmlfragment("com.evorait.evonotify.view.fragments.InformationPopover", this);
				this.getView().addDependent(this._infoDialog);
			}
			this._infoDialog.open();
		},

		/**
		 * Closes the information dialog
		 */
		onCloseDialog: function () {
			this._infoDialog.close();
		}

	});
});