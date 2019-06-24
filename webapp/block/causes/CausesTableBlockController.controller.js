/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"com/evorait/evolite/evonotify/model/formatter"
	], function (
		BaseController,
		History,
		JSONModel,
		formatter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evolite.evonotify.block.causes.CausesTableBlockController", {

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
				this.oParentBlock.fireItemPress(oEvent.getParameters());
			}


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */
			

		});

	}
);