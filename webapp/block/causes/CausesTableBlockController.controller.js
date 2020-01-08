/*global location*/
sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evonotify/model/formatter"
], function (
	BaseController,
	History,
	JSONModel,
	formatter
) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.block.causes.CausesTableBlockController", {

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
		 * show dialog with cause details
		 * in edit mode
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			var mParams = {
				oContext: oEvent.getSource().getBindingContext()
			};
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditCause");
		},

		/**
		 * add a new cause
		 * create a new entry based on if its Notification Item level
		 * @param oEvent
		 */
		onPressAdd: function (oEvent) {
			var oContextData = this.getView().getBindingContext().getObject();

			this.getNotifTypeDependencies(oContextData).then(function (result) {
				this._openAddDialog(oContextData, result);
			}.bind(this)).catch(function (error) {
				this._openAddDialog(oContextData);
			}.bind(this));
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * open add dialog 
		 * and set add cause dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				sSetPath: "/PMNotificationItemCauseSet",
				mKeys: {
					MaintenanceNotification: oContextData.MaintenanceNotification,
					MaintenanceNotificationItem: oContextData.MaintenanceNotificationItem
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifCauseCodeCatalog = mResults.CatalogTypeForCauses;
			}
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditCause");
		}
	});

});