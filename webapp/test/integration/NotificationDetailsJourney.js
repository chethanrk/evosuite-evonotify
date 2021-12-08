/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"com/evorait/evosuite/evonotify/test/integration/pages/WorkList",
	"com/evorait/evosuite/evonotify/test/integration/pages/Browser",
	"com/evorait/evosuite/evonotify/test/integration/pages/NotificationDetails"
], function (opaTest) {
	"use strict";

	QUnit.module("Notification Details");

	opaTest("Should see Notification Detail Page Title and SubTitle", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Actions
		When.onTheWorkListPage.iPressOnTheItemWithTheID("10007930");

		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeePageTitle("Notification test").
		and.iShouldSeePageSubTitle("10007930");
	});

	/**
	 * header
	 */

	opaTest("Should see all the sections", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();

		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeeDetailsBlock()
			.and.iShouldSeeItemsBlock()
			.and.iShouldSeeTasksBlock()
			.and.iShouldSeeActivitiesBlock()
			.and.iShouldSeePartnerBlock()
			.and.iShouldSeeNotiAttachmentsTable()
			.and.iShouldSeeOrderAttachmentsTable()
			.and.iShouldSeeEquiAttachmentsTable()
			.and.iShouldSeeFlocAttachmentsTable();
	});

	opaTest("Should open and close message popover", function (Given, When, Then) {
		// Actions
		When.onTheNotificationDetailsPage.iPressOnMessageManager();
		Then.onTheNotificationDetailsPage.iShouldSeePopover();

		// Assertions
		When.onTheNotificationDetailsPage.iPressPopoverCloseButton();
		Then.onTheNotificationDetailsPage.iShouldSeeTheHeaderTitleAs("Notification test");
	});

	opaTest("Should open and close the 'About' dialog", function (Given, When, Then) {
		// Actions
		When.onTheNotificationDetailsPage.iPressOnTheButtonWithTheID("idButtonAboutDialog");
		Then.onTheNotificationDetailsPage.iShouldSeeDialog();

		// Assertions
		When.onTheNotificationDetailsPage.iPressDialogCloseButton();
		Then.onTheNotificationDetailsPage.iShouldSeeTheHeaderTitleAs("Notification test");
	});

	/**
	 * System status button visibility and functionality
	 */

	opaTest(
		"Button 'Change Status' should be NOT visible when user parameter ENABLE_SYSTEM_STATUS_CHANGE is false",
		function (Given, When, Then) {
			//disable both parameters
			When.onTheNotificationDetailsPage.setModelParameters([{
				model: "user",
				property: "ENABLE_SYSTEM_STATUS_CHANGE",
				value: ""
			}], "idStatusChangeMenu");
			Then.onTheNotificationDetailsPage.iShouldSeeButton("idStatusChangeMenu", false);
		});
});