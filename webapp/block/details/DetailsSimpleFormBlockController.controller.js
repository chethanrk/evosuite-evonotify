/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"com/evorait/evolite/evonotify/model/formatter"
	], function (
		BaseController,
		JSONModel,
		formatter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evolite.evonotify.block.details.DetailsSimpleFormBlockController", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				
			}

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */



			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

		});

	}
);