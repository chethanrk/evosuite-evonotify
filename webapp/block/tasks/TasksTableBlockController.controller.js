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

	return BaseController.extend("com.evorait.evonotify.block.tasks.TasksTableBlockController", {

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
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			var mParams = {
				oContext: oEvent.getSource().getBindingContext()
			};
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditTask");
		},

		/**
		 * add a new task
		 * create a new entry based on if its on Notifcation header level or Notification Item level
		 * @param oEvent
		 */
		onPressAdd: function (oEvent) {
			var oContext = this.getView().getBindingContext(),
				sItemId = oContext.getProperty("MaintenanceNotificationItem"),
				mParams = {
					sSetPath: sItemId ? "/PMNotificationItemTaskSet" : "/PMNotificationTaskSet",
					mKeys: {
						MaintenanceNotification: oContext.getProperty("MaintenanceNotification"),
						MaintenanceNotificationItem: sItemId
					}
				};

			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditTask");
		}

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

	});

});