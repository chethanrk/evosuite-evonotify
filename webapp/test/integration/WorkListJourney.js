/*global opaTest*/
sap.ui.require([
	"sap/ui/test/opaQunit"
], function (opaQunit) {
	"use strict";

	QUnit.module("WorkList");

	opaTest("Should see table with FilterBar after loading", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppWithDelay("", 10);
		// Actions
		When.onTheAppPage.iWaitUntilTheBusyIndicatorIsGone();

		Then.onTheWorkListPage.iShouldSeeTable()
			.and.iShouldSeeFilterBar();
	});

	opaTest("Should see all the records", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnMoreData();
		Then.onTheWorkListPage.iShouldSeeAllTheRecords(13);
	});

	opaTest("Filter table using Notification number", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iSetTestForFilterProperty("MaintenanceNotification", "94").and.iStartSearch();
		Then.onTheWorkListPage.iShouldSeeFilteredRecord();
	});

	opaTest("Navigate to object page", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnTheItemWithTheID("94");
		// second page title check
		Then.onTheObjectPage.iShouldSeeTheHeaderTitleAs("Check the ration of the mix");
	});

});