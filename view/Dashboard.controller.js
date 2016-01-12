sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.evora.en.view.Dashboard", {

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Dashboard").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		handleRouteMatched: function(oEvent) {
			var params = {};
			if (oEvent.mParameters.data.context || oEvent.mParameters.data.masterContext) {
				this.sContext = oEvent.mParameters.data.context;
				this.sMasterContext = oEvent.mParameters.data.masterContext;

				if (!this.sContext) {
					this.getView().bindElement("/" + this.sMasterContext, params);
				} else {
					this.getView().bindElement("/" + this.sContext, params);
				}

			}

		},
		_onPressNpsapmButton14491326927900DZ: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("NotificationForm");
		},
		_onPressNpsapmButton14491326935890E1: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("NotificationList");
		},
		_onPressNpsapmButton145077432186001Z: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("NotificationList");
		}
	});
}, /* bExport= */ true);