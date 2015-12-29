sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("evora.en.view.D3", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},
		_onPressNpsapmButton14495714079020IY: function() {
			this.getView().getContent()[0].close();
		},
		_onPressNpsapmObjectListItem14495714327020J1: function() {
			this.getView().getContent()[0].close();
		}
	});
}, /* bExport= */ true);