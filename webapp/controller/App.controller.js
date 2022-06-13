sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evonotify.controller.App", {

		metadata: {
			methods: {
				// only lifecycle and private methods are defined
			}
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Notification on init
		 */
		onInit: function () {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//check if local form storage is expired and delete all
			this.deleteExpiredStorage();
		}
	});
});