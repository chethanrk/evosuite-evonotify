/*global opaTest*/
/* globals QUnit */
sap.ui.require([
	"sap/ui/test/opaQunit",
	"com/evorait/evosuite/evonotify/test/integration/pages/WorkList",
	"com/evorait/evosuite/evonotify/test/integration/pages/Browser"
], function (opaTest) {
	"use strict";

	QUnit.module("WorkList");

	opaTest("Should see table with FilterBar after loading", function (Given, When, Then) {

		// Arrangements
		Given.iStartMyApp();

		// Actions
		When.onTheAppPage.iWaitUntilTheBusyIndicatorIsGone();
		/*When.onTheWorkListPage.iLookAtTheScreen();*/

		Then.onTheWorkListPage.iShouldSeeTable()
			.and.iShouldSeeFilterBar();
	});

	opaTest("Should see all the records", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnMoreData();
		Then.onTheWorkListPage.iShouldSeeAllTheRecords(20);
	});

});