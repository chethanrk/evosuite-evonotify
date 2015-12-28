sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("generated.app.view.P2", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},
		_onPressNpsapmStandardListItem14494756543960QW: function() {
			this.getView().getContent()[0].close();
		},
		_onPressNpsapmStandardListItem14494756621980QY: function() {
			this.getView().getContent()[0].close();
		}
	});
}, /* bExport= */ true);