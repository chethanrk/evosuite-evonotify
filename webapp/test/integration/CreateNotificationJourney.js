/*global opaTest*/
sap.ui.require([
	"sap/ui/test/opaQunit",
	"com/evorait/evosuite/evonotify/test/integration/pages/WorkList",
	"com/evorait/evosuite/evonotify/test/integration/pages/CreateNotification"
], function (opaTest) {
	"use strict";

	QUnit.module("Notification Create");

	opaTest("Create notification button should be visible when user parameter ENABLE_NOTIFICATION_CREATE is true", function (Given,
		When, Then) {
		Given.iStartMyApp();
		When.onTheWorkListPage.setModelParameters([{
			model: "user",
			property: "ENABLE_NOTIFICATION_CREATE",
			default: "X",
			value: "X"
		}]);
		Then.onTheWorkListPage.iShouldSeeButton("idBtnCreateNotification", true);
	});

	opaTest("Create notification button should be visible when user parameter ENABLE_NOTIFICATION_CREATE is true", function (Given, When,
		Then) {
		When.onTheWorkListPage.setModelParameters([{
			model: "user",
			property: "ENABLE_NOTIFICATION_CREATE",
			default: "X",
			value: "X"
		}]);
		Then.onTheWorkListPage.iShouldSeeButton("idBtnCreateNotification", true);
	});

	opaTest("Should navigate to create Notification page", function (Given, When, Then) {
		When.onTheWorkListPage.iPressOnTheButtonWithTheID("idBtnCreateNotification");
		Then.onTheCreateNotificationPage.iShouldSeePageTitle();
	});

	opaTest("Button '?' should open and close System Information Dialog", function (Given, When, Then) {
		// Actions
		When.onTheCreateNotificationPage.iPressOnTheButtonWithTheID("idButtonAboutDialog");
		Then.onTheCreateNotificationPage.iShouldSeeDialog();

		When.onTheCreateNotificationPage.iPressDialogButtonWithID("idHeaderBtnInfoDialogClose");
		Then.onTheCreateNotificationPage.iShouldSeePageTitle();
	});

	opaTest("Should see pre-filled data for input fields", function (Given, When, Then) {
		// Actions
		When.onTheCreateNotificationPage.iLookAtTheScreen();
		Then.onTheCreateNotificationPage.iShouldSeeInputFieldWithValue("NOTIFICATION_TYPE", "M2");
		Then.onTheCreateNotificationPage.iShouldSeeInputFieldWithValue("MAINTENANCE_PLANNING_PLANT", "3200");
	});

	opaTest("All required fields should be highlighted", function (Given, When, Then) {
		When.onTheCreateNotificationPage.iPressOnTheButtonWithTheID("idCreateNotificationBtnSave");
		Then.onTheCreateNotificationPage.iShouldSeeRequiredFieldsHiglighted(true);
	});

	opaTest("Errors should be visible in Message Manager", function (Given, When, Then) {
		// Actions
		When.onTheCreateNotificationPage.iPressOnTheButtonWithTheID("idHeaderBtnMessageManager");
		Then.onTheCreateNotificationPage.iShouldSeeMessageManager();
		Then.onTheCreateNotificationPage.iShouldSeeMessageManagerContentLength(1);
	});
	opaTest("Navigate back to work list page", function (Given, When, Then) {
		// Actions
		When.onTheBrowserPage.iPressOnTheBackButton();
		Then.onTheWorkListPage.iShouldSeeTable()
			.and.iShouldSeeFilterBar();
	});

	opaTest("Close App", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		Then.onTheCreateNotificationPage.iShouldSeePageTitle();
		// Cleanup
		Then.iTeardownMyApp();
	});

});