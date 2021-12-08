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

	opaTest("Should open and close message popover", function (Given, When, Then) {

		When.onTheWorkListPage.iPressOnMessageManager();
		Then.onTheWorkListPage.iShouldSeePopover();

		When.onTheWorkListPage.iPressPopoverCloseButton();
		Then.onTheWorkListPage.iShouldSeeTable(); 
	});

	opaTest("Should open and close the 'About' dialog", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnTheButtonWithTheID("idButtonAboutDialog");
		Then.onTheWorkListPage.iShouldSeeDialog();

		When.onTheWorkListPage.iPressDialogCloseButton();
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

	opaTest("Navigate to Notification detail page", function (Given, When, Then) {
		// Actions
		When.onTheWorkListPage.iPressOnTheItemWithTheID("10007930");
		
		Then.onTheNotificationDetailsPage.iShouldSeePageTitle("Notification test")
			.and.iShouldSeePageSubTitle("10007930");

		// Cleanup
		Then.iTeardownMyApp();
	});

});