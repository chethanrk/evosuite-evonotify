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
				var mParams = {
					oContext: oEvent.getSource().getBindingContext()
				};
				this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditCause");
			},

			/**
			 *
			 * @param oEvent
			 */
			onPressAdd: function (oEvent) {
				var oView = this.getView(),
					mParams = {
						sSetPath: "/PMNotificationCauses",
						mKeys: {
							MaintenanceNotification: oView.getBindingContext().getProperty("MaintenanceNotification"),
							MaintenanceNotificationItem: oView.getBindingContext().getProperty("MaintenanceNotificationItem")
						}
					};
				this.getOwnerComponent().oAddEntryDialog.open(oView, mParams, "AddEditCause");
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);