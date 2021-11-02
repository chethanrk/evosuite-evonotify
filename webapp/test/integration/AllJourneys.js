// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 WorkOrders in the list
/* globals QUnit */
sap.ui.require([
	"sap/ui/test/Opa5",
	"com/evorait/evosuite/evonotify/test/integration/arrangements/Startup",
	"com/evorait/evosuite/evonotify/test/integration/pages/App",
	"com/evorait/evosuite/evonotify/test/integration/WorkListJourney"
], function (Opa5, Startup) {
	"use strict";
	Opa5.extendConfig({
		autoWait: true,
		viewNamespace: "com.evorait.evosuite.evonotify.view.",
		viewName: "App",
		arrangements: new Startup()
	});
});