var formulaCalculation;
"use strict";

jQuery.sap.declare("generated.app.Component");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("sap.m.App");
try {
	jQuery.sap.require("generated.app.models.formulaCalculation");
} catch (e) {
	formulaCalculation = undefined;
}

var navigationWithContext = {
	"NotificationSet": {
		"1449567197352_S9": ""
	}
};

sap.ui.core.UIComponent.extend("generated.app.Component", {
	metadata: {
		routing: {
			config: {
				routerClass: "sap.m.routing.Router",
				viewType: "XML",
				viewPath: "generated.app.view",
				controlId: "App",
				clearTarget: false,
				controlAggregation: "pages",
				bypassed: {
					target: ["1449126039451_S5"]
				}
			},
			routes: [{
				pattern: "1449126039451_S5/:context:",
				name: "1449126039451_S5",
				target: ["1449126039451_S5"]
			}, {
				pattern: "1449131511127_S6/:context:",
				name: "1449131511127_S6",
				target: ["1449131511127_S6"]
			}, {
				pattern: "1449133240322_S7/:context:",
				name: "1449133240322_S7",
				target: ["1449133240322_S7"]
			}, {
				pattern: "1449420450183_S8/:context:",
				name: "1449420450183_S8",
				target: ["1449420450183_S8"]
			}, {
				pattern: "1449567197352_S9/:context:",
				name: "1449567197352_S9",
				target: ["1449567197352_S9"]
			}, {
				pattern: "",
				name: "default",
				target: ["1449126039451_S5"]
			}],
			targets: {
				"1449126039451_S5": {
					viewName: "1449126039451_S5",
					viewId: "1449126039451_S5",
					viewLevel: "1"
				},
				"1449131511127_S6": {
					viewName: "1449131511127_S6",
					viewId: "1449131511127_S6",
					viewLevel: "1"
				},
				"1449133240322_S7": {
					viewName: "1449133240322_S7",
					viewId: "1449133240322_S7",
					viewLevel: "1"
				},
				"1449420450183_S8": {
					viewName: "1449420450183_S8",
					viewId: "1449420450183_S8",
					viewLevel: "1"
				},
				"1449567197352_S9": {
					viewName: "1449567197352_S9",
					viewId: "1449567197352_S9",
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