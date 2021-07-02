// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Notifications in the list

sap.ui.require([
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/test/Opa5",
	"com/evorait/evosuite/evonotify/test/integration/pages/Common",
	"com/evorait/evosuite/evonotify/test/integration/pages/App",
	"com/evorait/evosuite/evonotify/test/integration/pages/Browser",
	"com/evorait/evosuite/evonotify/test/integration/pages/WorkList",
	"com/evorait/evosuite/evonotify/test/integration/pages/Object"

], function (qunitCss, qunit, qunitJunit, Opa5, Common, App, Browser, WorkList, Object) {
	"use strict";

	QUnit.config.autostart = false;

	Opa5.extendConfig({
		viewNamespace: "com.evorait.evosuite.evonotify.view.",
		viewName: "App",
		arrangements: new Common()
	});

	//"com/evorait/evosuite/evonotify/test/integration/NotFoundJourney",

	sap.ui.require([
		"com/evorait/evosuite/evonotify/test/integration/AppJourney",
		"com/evorait/evosuite/evonotify/test/integration/WorkListJourney",
		"com/evorait/evosuite/evonotify/test/integration/ObjectJourney"
	], function () {
		QUnit.start();
	});
});
