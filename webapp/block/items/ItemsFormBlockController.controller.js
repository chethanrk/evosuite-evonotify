/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (
	FormController,
	History,
	JSONModel,
	formatter
) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.block.items.ItemsFormBlockController", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("ItemObjectEvoNotify", "validateFields", this._validateForm, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Validate smartForm with custom fields
		 * @public
		 */
		_validateForm: function (sChannel, sEvent, oData) {
			if (sChannel === "ItemObjectEvoNotify" && sEvent === "validateFields") {
				var oForm = this.getView().byId("SmartNotificationItemForm");

				if (this.validateForm({
						form: oForm
					})) {
					this.saveChangedEntry({});
				}
			}
		}

	});

});