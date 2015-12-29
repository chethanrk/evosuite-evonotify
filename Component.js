var formulaCalculation;
"use strict";

jQuery.sap.declare("evora.en.Component");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("sap.m.App");
try {
	jQuery.sap.require("evora.en.models.formulaCalculation");
} catch (e) {
	formulaCalculation = undefined;
}

var navigationWithContext = {
	"NotificationSet": {
		"NotificationDetail": ""
	}
};

sap.ui.core.UIComponent.extend("evora.en.Component", {
	metadata: {
		routing: {
			config: {
				routerClass: "sap.m.routing.Router",
				viewType: "XML",
				viewPath: "evora.en.view",
				controlId: "App",
				clearTarget: false,
				controlAggregation: "pages",
				bypassed: {
					target: ["Login"]
				}
			},
			routes: [{
				pattern: "Login/:context:",
				name: "Login",
				target: ["Login"]
			}, {
				pattern: "Dashboard/:context:",
				name: "Dashboard",
				target: ["Dashboard"]
			}, {
				pattern: "NotificationForm/:context:",
				name: "NotificationForm",
				target: ["NotificationForm"]
			}, {
				pattern: "NotificationList/:context:",
				name: "NotificationList",
				target: ["NotificationList"]
			}, {
				pattern: "NotificationDetail/:context:",
				name: "NotificationDetail",
				target: ["NotificationDetail"]
			}, {
				pattern: "",
				name: "default",
				target: ["Login"]
			}],
			targets: {
				"Login": {
					viewName: "Login",
					viewId: "Login",
					viewLevel: "1"
				},
				"Dashboard": {
					viewName: "Dashboard",
					viewId: "Dashboard",
					viewLevel: "1"
				},
				"NotificationForm": {
					viewName: "NotificationForm",
					viewId: "NotificationForm",
					viewLevel: "1"
				},
				"NotificationList": {
					viewName: "NotificationList",
					viewId: "NotificationList",
					viewLevel: "1"
				},
				"NotificationDetail": {
					viewName: "NotificationDetail",
					viewId: "NotificationDetail",
					viewLevel: "1"
				}
			}
		}
	},

	createContent: function() {
		var app = new sap.m.App({
			id: "App"
		});
		var appType = "App";
		if (appType === "App") {
			app.setBackgroundColor("#FFFFFF");
		}

		return app;
	},

	init: function() {
		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
			isTouch: sap.ui.Device.support.touch,
			isNoTouch: !sap.ui.Device.support.touch,
			isPhone: sap.ui.Device.system.phone,
			isNoPhone: !sap.ui.Device.system.phone,
			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
		});
		deviceModel.setDefaultBindingMode("OneWay");
		this.setModel(deviceModel, "device");

		//////////
		jQuery.sap.require("sap.ui.model.odata.ODataModel");
		jQuery.sap.require("sap.ui.app.MockServer");
		var uri = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + "/models/";
		var oMockServer = new sap.ui.app.MockServer({
			rootUri: uri
		});
		oMockServer.simulate(uri + "metadata.xml", {
			sMockdataBaseUrl: uri + "sampleData.json",
			bGenerateMissingMockData: true
		});
		if (typeof formulaCalculation !== "undefined") {
			// only use if available - global variable
			formulaCalculation.patchMockServer(oMockServer);
		}
		oMockServer.start();
		var oModel = new sap.ui.model.odata.ODataModel(uri, true);
		oModel.setCountSupported(false);
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		this.setModel(oModel);
		//////////

		var router = this.getRouter();
		this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
		router.initialize();
	},

	getNavigationPropertyForNavigationWithContext: function(entityNameSet, targetPageName) {
		var entityNavigations = navigationWithContext[entityNameSet];
		return entityNavigations == null ? null : entityNavigations[targetPageName];
	}
});