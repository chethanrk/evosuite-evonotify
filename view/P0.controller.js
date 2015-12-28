sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("generated.app.view.P0", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},
		_onPressNpsapmButton144907669739409D: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("1449126039451_S5");
		},
		_onPressNpsapmButton144907657408908G: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("1449133240322_S7");
		},
		_onPressNpsapmButton144907669365109B: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("1449420450183_S8");
		},
		_onPressNpsapmButton14507277063970HK: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("1449131511127_S6");
		},
		_onPressNpsapmButton145077454807004C: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("1449420450183_S8");
		}
	});
}, /* bExport= */ true);