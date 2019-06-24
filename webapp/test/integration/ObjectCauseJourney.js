sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotificationCause");
 
		opaTest("Should go to CausePage when user clicks on an entry in items table and from ItemPage click on causes table entry", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			//go to object page
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");

			//go to cause page
			var oPathProperties = {
				MaintenanceNotification: "Maintenancenotification1",
				MaintenanceNotificationItem: "MaintenanceNotificationItem1"
			};
			When.onTheObjectPage.iPressOnTheBlockTableWithTheID("items.", "ItemsTableBlock", "PMNotificationItems", oPathProperties);

			//go to item cause page
			When.onTheObjectItemPage.iPressOnTheBlockTableWithTheTitle("causes.", "CausesTableBlock", "MaintNotificationCause11");
 
			// Assertions
			Then.onTheObjectCausePage.theTitleShouldDisplayTheName("Lackzufuhr unterbrochen", "MaintenanceNotificationCause11")
				.and.iShouldSeeTheBlock("causesFormBlock")
				.and.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go back to the ItemPage", function (Given, When, Then) {
			// Actions
			When.onTheObjectCausePage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectItemPage.iShouldSeeTheForm(false);
		});
 
		opaTest("Should be on the notification cause page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
			// Assertions
			Then.onTheObjectCausePage.theTitleShouldDisplayTheName("Lackzufuhr unterbrochen", "MaintenanceNotificationCause11").
				and.iTeardownMyAppFrame();
		});
	}
);