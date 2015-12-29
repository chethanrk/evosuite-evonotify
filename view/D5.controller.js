sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("evora.en.view.D5", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},
		_onPressNpsapmButton14497395146810V2: function() {
			this.getView().getContent()[0].close();
		}
	});
}, /* bExport= */ true);