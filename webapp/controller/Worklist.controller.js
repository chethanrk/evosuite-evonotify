sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (TableController, formatter, JSONModel, Fragment) {
	"use strict";

	return TableController.extend("com.evorait.evosuite.evonotify.controller.Worklist", {

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
		 * SmartTable before loading request
		 * set default SortOrder from annotations
		 */
		onBeforeRebindTable: function (oEvent) {
			TableController.prototype.onBeforeRebindTable.apply(this, arguments);
		},

		/**
		 * event when Variant mMnagment of SmartFilterBar or SmartTable was initialized
		 * @param oEvent
		 */
		onInitializedSmartVariant: function (oEvent) {
			TableController.prototype.onInitializedSmartVariant.apply(this, arguments);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPressTableRow: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			this.oSmartTable.setEditable(false);
			this.getModel("viewModel").setProperty("/enableNotificationChange", oContext.getProperty("ENABLE_NOTIFICATION_CHANGE"));
			this.getRouter().navTo("NotificationDetail", {
				ObjectKey: oContext.getProperty("ObjectKey")
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
			this.openMessageManager(this.getView(), oEvent);
		}

	});
});