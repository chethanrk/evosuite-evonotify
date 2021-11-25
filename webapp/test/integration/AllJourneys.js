sap.ui.require([
	"sap/ui/test/Opa5",
	"com/evorait/evosuite/evonotify/test/integration/arrangements/Startup",
	"com/evorait/evosuite/evonotify/test/integration/pages/App",
	"com/evorait/evosuite/evonotify/test/integration/WorkListJourney",
	"com/evorait/evosuite/evonotify/test/integration/CreateNotificationJourney",
	"com/evorait/evosuite/evonotify/test/integration/NotificationDetailsJourney"
], function (Opa5, Startup) {
	"use strict";
	Opa5.extendConfig({
		autoWait: true,
		viewNamespace: "com.evorait.evosuite.evonotify.view.",
		viewName: "App",
		arrangements: new Startup()
	});
});