sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.evora.en.view.D2", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},
		_onPressNpsapmObjectListItem14495709074220BJ: function() {
			this.getView().getContent()[0].close();
		},
		_onPressNpsapmButton14495711703740FW: function() {
			this.getView().getContent()[0].close();
		}
	});
}, /* bExport= */ true);