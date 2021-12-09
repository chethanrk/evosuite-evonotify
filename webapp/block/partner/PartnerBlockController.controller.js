/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (
	TableController,
	formatter
) {
	"use strict";

	return TableController.extend("com.evorait.evosuite.evonotify.block.partner.PartnerBlockController", {
		
		metadata: {
			methods: {
				fotmatter: {
					public: true,
					final: true
				},
				onBeforeRebindTable: {
					public: true,
					final: true	
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