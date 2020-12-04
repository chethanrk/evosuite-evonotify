/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (FormController, formatter) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.block.details.DetailsFormBlockController", {

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
			eventBus.subscribe("ObjectEvoNotify", "validateFields", this._validateForm, this);
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
			if (sChannel === "ObjectEvoNotify" && sEvent === "validateFields") {
				var oForm = this.getView().byId("idNotificationForm");

				if (this.validateForm({
						form: oForm
					})) {
					this.saveChangedEntry({});
				}
			}
		}

	});

});