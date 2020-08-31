/*global location*/
sap.ui.define([
		"com/evorait/evonotify/controller/FormController",
		"com/evorait/evonotify/model/formatter"
	], function (FormController, formatter) {
		"use strict";

		return FormController.extend("com.evorait.evonotify.block.details.AddNotifBlockController", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var eventBus = sap.ui.getCore().getEventBus();
				eventBus.subscribe("ObjectNewEvoNotify", "validateFields", this._validateForm, this);
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
				var oForm = this.getView().byId("idNewNotificationForm");

				if(this.validateForm({form: oForm})){
					this.saveNewEntry({
						entryKey: "MaintenanceNotification",
						navPath: "object",
						success: this.navBack.bind(this)
					});
				}
			}

		});

	}
);