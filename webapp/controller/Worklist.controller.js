sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"sap/m/TablePersoController",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evonotify/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, TablePersoController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPressTableRow: function (oEvent) {
			this.getRouter().navTo("object", {
				objectId: oEvent.getSource().getBindingContext().getProperty("MaintenanceNotification")
			});
		},

		onAddPress: function () {
			this.getRouter().navTo("objectNew");
		},

		/**
		 * Initialize and open the Information dialog with necessary details
		 * @Author Rahul
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
		 * @Author Rahul
		 */
		onCloseDialog: function () {
			this._infoDialog.close();
		}

	});
});