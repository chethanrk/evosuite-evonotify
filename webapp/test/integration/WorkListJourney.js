/*global opaTest*/
/* globals QUnit */
sap.ui.require([
	"sap/ui/test/opaQunit",
	"com/evorait/evosuite/evonotify/test/integration/pages/WorkList",
	"com/evorait/evosuite/evonotify/test/integration/pages/Browser",
	"com/evorait/evosuite/evonotify/test/integration/pages/NotificationDetails",
], function (opaTest) {
	"use strict";

	QUnit.module("WorkList");

	opaTest("Should see table with FilterBar after loading", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Actions
		When.onTheAppPage.iWaitUntilTheBusyIndicatorIsGone();

		Then.onTheWorkListPage.iShouldSeeTable()
			.and.iShouldSeeFilterBar();

	});
	/*test to check see all records of the table*/
	opaTest("Should see all the records", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnMoreData();
		Then.onTheWorkListPage.iShouldSeeAllTheRecords(20);
	});

	/*test to check filter functionality*/
	opaTest("Filter table using notification number", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iGetFirstItemDataInTable("NOTIFICATION_NO")
			.and.iSetTestForFilterProperty("NOTIFICATION_NO", "10007930")
			.and.iStartSearch();
		Then.onTheWorkListPage.iShouldSeeFilteredRecord();
	});

	/**
	 * Header check buttons and dialogs
	 */

	opaTest("Button for Message Box should open Message Manager", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnTheButtonWithTheID("idHeaderBtnMessageManager");
		Then.onTheWorkListPage.iShouldSeeMessageManager();
		Then.onTheWorkListPage.iShouldSeeMessageManagerContentLength(0);
	});

	opaTest("Button '?' should open and close System Information Dialog", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnTheButtonWithTheID("idButtonAboutDialog");
		Then.onTheWorkListPage.iShouldSeeDialog();

		When.onTheWorkListPage.iPressDialogButtonWithID("idHeaderBtnInfoDialogClose");
		Then.onTheWorkListPage.iShouldSeeTable();
	});

	/*test to check create notification button visibility*/
	opaTest("Button 'Create Notification' should be visible when user parameter ENABLE_NOTIFICATION_CREATE is true", function (Given, When,
		Then) {
		When.onTheWorkListPage.setModelParameters([{
			model: "user",
			property: "ENABLE_NOTIFICATION_CREATE",
			value: "X"
		}]);
		Then.onTheWorkListPage.iShouldSeeButton("idBtnCreateNotification", true);
	});

	opaTest("Button 'Create notification' should navigate to create notification page and back", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnTheButtonWithTheID("idBtnCreateNotification");
		Then.onTheCreateNotificationPage.iShouldSeePageTitle();

		When.onTheBrowserPage.iPressOnTheBackButton();
		Then.onTheWorkListPage.iShouldSeeTable()
			.and.iShouldSeeFilterBar();

		//Then.iTeardownMyApp();
	});

	opaTest("Close App", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		Then.onTheWorkListPage.iShouldSeeTable();
		// Cleanup
		Then.iTeardownMyApp();
	});

	/*------------abouve scenarios working-----------------*/

	/*	opaTest("Press on List item should navigate to create notification page and back", function (Given, When, Then) {
			// Actions
			When.onTheAppPage.iLookAtTheScreen();
			Then.onTheNotificationDetailsPage.iShouldSeePageTitle("Identification of screws not conforming");

			When.onTheBrowserPage.iPressOnTheBackButton();
			Then.onTheWorkListPage.iShouldSeeTable()
				.and.iShouldSeeFilterBar();

			// Cleanup
			Then.iTeardownMyApp();
		});*/

});