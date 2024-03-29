sap.ui.require([
	"sap/ui/test/opaQunit",
	"com/evorait/evosuite/evonotify/test/integration/pages/App",
	"com/evorait/evosuite/evonotify/test/integration/pages/WorkList"
], function (opaTest) {
	"use strict";

	QUnit.module("Desktop busy indication");

	opaTest("Should see a global busy indication while loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.onTheAppPage.iStartTheAppWithDelay("", 5000);

		// Actions
		When.onTheAppPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicator()
			.and.iTeardownMyAppFrame();
	});

});