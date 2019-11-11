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
				var oContext = oEvent.getSource().getBindingContext();
				if(oContext){
					var obj = oContext.getObject();
					this.getRouter().navTo("task", {
						objectId: obj.MaintenanceNotification,
						taskId: obj.MaintenanceNotificationTask,
						itemId: 0
					});
				}
			},

			/**
			 * @param oEvent
			 */
			onPressAdd: function (oEvent) {
				this.getRouter().navTo("task", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: 0,
					taskId: "new"
				});
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);