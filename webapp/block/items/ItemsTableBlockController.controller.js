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

		return BaseController.extend("com.evorait.evonotify.block.items.ItemsTableBlockController", {

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

			onAfterRendering : function () {
				
			},
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			onPressItem : function (oEvent) {
				var oContext = oEvent.getSource().getBindingContext();
				if(oContext){
					var obj = oContext.getObject();
					this.getRouter().navTo("item", {
						objectId: obj.MaintenanceNotification,
						itemId: obj.MaintenanceNotificationItem
					});
				}
			},

			onPressAdd: function (oEvetn) {
				this.getRouter().navTo("item", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: "new"
				});
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);