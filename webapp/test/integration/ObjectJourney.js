/*global opaTest*/
sap.ui.require([
	"sap/ui/test/opaQunit"
], function (opaQunit) {
	"use strict";

	QUnit.module("Object");

	opaTest("Should see General block", function (Given, When, Then) {

		// Arrangements
		//Given.iStartTheAppWithDelay("", 10);

		// Actions
		When.onTheAppPage.iWaitUntilTheBusyIndicatorIsGone();

		// Assertions
		Then.onTheObjectPage.iShouldSeeGeneralBlock();
	});

	/**
	 * HEADER
	 */
	opaTest("Should see required header details", function (Given, When, Then) {

		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheObjectPage.iShouldSeeTheHeaderTitleAs("Check the ration of the mix").
		and.iShouldSeeTheHeaderSubTitleAs("94").
		and.iShouldSeeNotificationTypeField().
		and.iShouldSeeEquipmentField().
		and.iShouldSeeFuncLocField();
	});

	/**
	 * OPERATIONS BLOCK
	 */
	opaTest("Should see Items block", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheObjectPage.iShouldSeeItemsBlock();
	});

	/**
	 * ATTACHMENTS BLOCK
	 */

	opaTest("Should see Tasks block", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iLookAtTheScreen();
		// Assertions
		Then.onTheObjectPage.iShouldSeeTasksBlock();
	});

	/**
	 * COMPONENT BLOCK
	 */
	opaTest("Should see Activities block", function (Given, When, Then) {
		// Assertions
		Then.onTheObjectPage.iShouldSeeActivitiesTable();
	});

});