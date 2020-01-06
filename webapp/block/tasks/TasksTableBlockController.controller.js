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
			onInit : function () {
				
			},
			
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * @param oEvent
			 */
			onPressItem : function (oEvent) {
				var mParams = {
					oContext: oEvent.getSource().getBindingContext()
				};
				this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditTask");
			},

			/**
			 * @param oEvent
			 */
			onPressAdd: function (oEvent) {
				var oContext = this.getView().getBindingContext(),
					mParams = {
						sSetPath: "/PMNotificationTasks",
						mKeys: {
							MaintenanceNotification: oContext.getProperty("MaintenanceNotification"),
							MaintenanceNotificationItem: oContext.getProperty("MaintenanceNotificationItem")
						}
					};
				this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditTask");
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);