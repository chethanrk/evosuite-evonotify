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

	return BaseController.extend("com.evorait.evonotify.block.activities.ActivitiesTableBlockController", {

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
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				sItemId = oContext.getProperty("MaintenanceNotificationItem"),
				mParams = {
					sSetPath: sItemId ? "/PMNotificationItemActivitySet" : "/PMNotificationActivitySet",
					mKeys: {
						MaintenanceNotification: oContext.getProperty("MaintenanceNotification"),
						MaintenanceNotificationItem: sItemId
					}
				};
			this.getOwnerComponent().oAddEntryDialog.open(oView, mParams, "AddEditActivity");
		}

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

	});

});