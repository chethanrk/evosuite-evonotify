sap.ui.define([
		"com/evorait/evosuite/evonotify/controller/BaseController",
		"sap/ui/core/mvc/OverrideExecution"
	], function (BaseController, OverrideExecution) {
		"use strict";

		return BaseController.extend("com.evorait.evosuite.evonotify.controller.NotFound", {
			
			metadata: {
				methods: {
					onLinkPressed: {
						public: true,
						final: false,
						overrideExecution: OverrideExecution.Instead
					}
				}
			},

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