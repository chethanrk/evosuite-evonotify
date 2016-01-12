sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.evora.en.view.subviews.PopoverMenu", {

		onInit: function() {
			this._oDialog = this.getView().getContent()[0];
		},
		onExit: function() {
			this._oDialog.destroy();
		},
		_onPressNpsapmButton144907669739409D: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo(models.Config.PAGES.LOGIN);
		},
		_onPressNpsapmButton144907657408908G: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo(models.Config.PAGES.FORM);
		},
		_onPressNpsapmButton144907669365109B: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo(models.Config.PAGES.LIST);
		},
		_onPressNpsapmButton14507277063970HK: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo(models.Config.PAGES.HOME);
		},
		_onPressNpsapmButton145077454807004C: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo(models.Config.PAGES.LIST);
		}
	});
}, /* bExport= */ true);