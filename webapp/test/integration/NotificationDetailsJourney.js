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
		When.onTheWorkListPage.iPressOnTheItemWithTheID("000010007930");
		// second page title check
		Then.onTheNotificationDetailsPage.iShouldSeePageTitle("Notification test").
		and.iShouldSeePageSubTitle("10007930");
	});

	/**
	 * header
	 */
	opaTest("Should see required header details", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeeTheHeaderTitleAs("Notification test").
		and.iShouldSeeTheHeaderSubTitleAs("10007930");
		/*and.iShouldSeeNotificationField();
		and.iShouldSeeUserStatusField().
		and.iShouldSeeFuncLocField().
		and.iShouldSeePriorityField().
		and.iShouldSeeSystemStatusField();*/
	});

	opaTest("Button '?' should open and close System Information Dialog", function (Given, When, Then) {
		// Actions
		When.onTheNotificationDetailsPage.iPressOnTheButtonWithTheID("idButtonAboutDialog");
		Then.onTheNotificationDetailsPage.iShouldSeeDialog();

		When.onTheNotificationDetailsPage.iPressDialogButtonWithID("idHeaderBtnInfoDialogClose");
		Then.onTheNotificationDetailsPage.iShouldSeeTheHeaderTitleAs("Notification test");
	});

	opaTest("Button for Message Box should open Message Manager", function (Given, When, Then) {
		// Actions
		When.onTheNotificationDetailsPage.iPressOnTheButtonWithTheID("idHeaderBtnMessageManager");
		Then.onTheNotificationDetailsPage.iShouldSeeMessageManager();
	});

	/**
	 * Item block
	 */
	opaTest("Should see items block", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeeItemsBlock();
	});

	/**
	 * tasks block
	 */
	opaTest("Should see Tasks block", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeeTasksBlock();
	});

	/**
	 * activities block
	 */
	opaTest("Should see Activities block", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeeActivitiesBlock();
	});

	/**
	 * Partner block
	 */
	opaTest("Should see Partner block", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheNotificationDetailsPage.iShouldSeePartnerBlock();
		/*Then.iTeardownMyApp();*/
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

/*	opaTest("Close App", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		Then.onTheNotificationDetailsPage.iShouldSeeTheHeaderTitleAs("Notification test");
		// Cleanup
		Then.iTeardownMyApp();
	});*/

});