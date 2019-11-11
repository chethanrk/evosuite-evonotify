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
			onInit : function () {
				
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 *
			 * @param oEvent
			 */
			onPressItem : function (oEvent) {
				var obj = this.getView().getBindingContext().getObject();
				var oContext = oEvent.getSource().getBindingContext();
				if(oContext){
					this.getRouter().navTo("cause", {
						objectId: obj.MaintenanceNotification,
						itemId: obj.MaintenanceNotificationItem,
						causeId: obj.MaintenanceNotificationCause
					});
				}
			},

			/**
			 *
			 * @param oEvent
			 */
			onPressAdd: function (oEvent) {
				this.getRouter().navTo("cause", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: this.getView().getBindingContext().getProperty("MaintenanceNotificationItem"),
					causeId: "new"
				});
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);