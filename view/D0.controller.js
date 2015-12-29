sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("evora.en.view.D0", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},

	});
}, /* bExport= */ true);