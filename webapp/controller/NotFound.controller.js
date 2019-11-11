sap.ui.define([
		"com/evorait/evonotify/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.evorait.evonotify.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);