jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;
 
 
sap.ui.require([
	"sap/ui/test/Opa5",
	"com/evorait/evolite/evonotify/test/integration/pages/Common",
	"com/evorait/evolite/evonotify/test/integration/pages/Worklist"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.evorait.evolite.evonotify.view."
	});
 
	sap.ui.require([
		"com/evorait/evolite/evonotify/test/integration/WorklistJourney"
	], function () {
		QUnit.start();
	});
});