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
			onInit : function () {
				
			},
			
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			onPressItem : function (oEvent) {
				var obj = this.getView().getBindingContext().getObject();
				var oContext = oEvent.getSource().getBindingContext();
				if(oContext){
					this.getRouter().navTo("activity", {
						objectId: obj.MaintenanceNotification,
						itemId: 0,
						activityId: obj.MaintNotificationActivity
					});
				}
			},


			onPressAdd: function (oEvent) {
				this.getRouter().navTo("activity", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: 0,
					activityId: "new"
				});
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);