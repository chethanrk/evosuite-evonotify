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

	return BaseController.extend("com.evorait.evonotify.block.activities.ActivitiesItemTableBlockController", {

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
		 * show dialog with activity details
		 * in edit mode
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			var mParams = {
				oContext: oEvent.getSource().getBindingContext()
			};
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditActivity");
		},

		/**
		 * add a new activity
		 * create a new entry based on if its on Notifcation header level or Notification Item level
		 * @param oEvent
		 */
		onPressAdd: function (oEvent) {
			this.getDependenciesAndCallback(this._openAddDialog.bind(this));
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
				sSetPath: "/PMNotificationItemActivitySet",
				mKeys: {
					MaintenanceNotification: oContextData.MaintenanceNotification,
					MaintenanceNotificationItem: oContextData.MaintenanceNotificationItem
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifAcivityCodeCatalog = mResults.CatalogTypeForActivities;
			}
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditActivity");
		}
	});

});