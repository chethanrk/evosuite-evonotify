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
				var mParams = {
					oContext: oEvent.getSource().getBindingContext()
				};
				this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditActivity");
			},


			onPressAdd: function (oEvent) {
				var oView = this.getView(),
					oContext = oView.getBindingContext(),
					mParams = {
						sSetPath: "/PMNotificationActivities",
						mKeys: {
							MaintenanceNotification: oContext.getProperty("MaintenanceNotification"),
							MaintenanceNotificationItem: oContext.getProperty("MaintenanceNotificationItem")
						}
					};
				this.getOwnerComponent().oAddEntryDialog.open(oView, mParams, "AddEditActivity");
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);