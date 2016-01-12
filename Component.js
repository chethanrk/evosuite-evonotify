var formulaCalculation;
"use strict";

jQuery.sap.declare("sap.ui.evora.en.Component");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("sap.m.App");
jQuery.sap.require("sap.ui.evora.en.models.Config");
try {
	jQuery.sap.require("sap.ui.evora.en.models.formulaCalculation");
} catch (e) {
	formulaCalculation = undefined;
}

var navigationWithContext = {
	"NotificationSet": {
		"NotificationDetail": ""
	}
};

var context = "/:context:";

sap.ui.core.UIComponent.extend("sap.ui.evora.en.Component", {
	metadata: {
		manifest: "json",
		routing: {
			config: {
				routerClass: "sap.m.routing.Router",
				viewType: "XML",
				viewPath: "sap.ui.evora.en.view",
				controlId: "App",
				clearTarget: false,
				controlAggregation: "pages",
				bypassed: {
					target: [models.Config.PAGES.LOGIN]
				}
			},
			routes: [{
				pattern: models.Config.PAGES.LOGIN + context,
				name: models.Config.PAGES.LOGIN,
				target: [models.Config.PAGES.LOGIN]
			}, {
				pattern: models.Config.PAGES.HOME + context,
				name: models.Config.PAGES.HOME,
				target: [models.Config.PAGES.HOME]
			}, {
				pattern: models.Config.PAGES.FORM + context,
				name: models.Config.PAGES.FORM,
				target: [models.Config.PAGES.FORM]
			}, {
				pattern: models.Config.PAGES.LIST + context,
				name: models.Config.PAGES.LIST,
				target: [models.Config.PAGES.LIST]
			}, {
				pattern: models.Config.PAGES.DETAILS + context,
				name: models.Config.PAGES.DETAILS,
				target: [models.Config.PAGES.DETAILS]
			}, {
				pattern: "",
				name: "default",
				target: ["Login"]
			}],
			targets: {
				"Login": {
					viewName: models.Config.PAGES.LOGIN,
					viewId: models.Config.PAGES.LOGIN,
					viewLevel: "1"
				},
				"Dashboard": {
					viewName: models.Config.PAGES.HOME,
					viewId: models.Config.PAGES.HOME,
					viewLevel: "1"
				},
				"NotificationForm": {
					viewName: models.Config.PAGES.FORM,
					viewId: models.Config.PAGES.FORM,
					viewLevel: "1"
				},
				"NotificationList": {
					viewName: models.Config.PAGES.LIST,
					viewId: models.Config.PAGES.LIST,
					viewLevel: "1"
				},
				"NotificationDetail": {
					viewName: models.Config.PAGES.DETAILS,
					viewId: models.Config.PAGES.DETAILS,
					viewLevel: "1"
				}
			}
		}
	},

	createContent: function() {
		var app = new sap.m.App({
			id: "App",
			viewName : "sap.ui.evora.en.view.App",
			type : "JS",
			viewData : { component : this }
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