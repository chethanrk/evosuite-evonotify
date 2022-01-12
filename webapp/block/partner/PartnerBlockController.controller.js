/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/core/mvc/OverrideExecution"
], function (TableController, formatter, OverrideExecution) {
	"use strict";

	return TableController.extend("com.evorait.evosuite.evonotify.block.partner.PartnerBlockController", {

		metadata: {
			methods: {
				onBeforeRebindTable: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				}
			}
		},

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {},

		onAfterRendering: function () {},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * SmartTable before loading request
		 * set default SortOrder from annotations
		 */
		onBeforeRebindTable: function (oEvent) {
			TableController.prototype.onBeforeRebindTable.apply(this, arguments);
		}

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

	});

});