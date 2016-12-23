sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotificationActivity");
 
		opaTest("Should go to AcitivityPage when a user clicks on an entry in ObjectPage activites table", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			//go to object page
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");
			
			//go to activity page
			When.onTheObjectPage.iPressOnTheBlockTableWithTheTitle("activities.", "ActivitiesTableBlock", "MaintNotificationActivity11");
 
			// Assertions
			Then.onTheObjectActivityPage.theTitleShouldDisplayTheName("Dringende Reparatur durchführen", "MaintNotificationActivity11")
				.and.iShouldSeeTheBlock("activitiesFormBlock")
				.and.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go back to the ObjectPage", function (Given, When, Then) {
			// Actions
			When.onTheObjectActivityPage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectPage.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go to ActivityPage when user clicks on an entry in items table and from ItemPage click on activities table entry", function(Given, When, Then){
			//go to object page
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");
			
			//go to item page
			var oPathProperties = {
				MaintenanceNotification: "Maintenancenotification1",
				MaintenanceNotificationItem: "MaintenanceNotificationItem1"
			};
			When.onTheObjectPage.iPressOnTheBlockTableWithTheID("items.", "ItemsTableBlock", "PMNotificationItems", oPathProperties);
			
			//go to item activity page
			When.onTheObjectItemPage.iPressOnTheBlockTableWithTheTitle("activities.", "ActivitiesTableBlock", "MaintNotificationActivity11");
 
			// Assertions
			Then.onTheObjectActivityPage.theTitleShouldDisplayTheName("Dringende Reparatur durchführen", "MaintNotificationActivity11")
				.and.iShouldSeeTheBlock("activitiesFormBlock")
				.and.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go back to the ItemPage", function (Given, When, Then) {
			// Actions
			When.onTheObjectActivityPage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectItemPage.iShouldSeeTheForm(false);
		});
 
		opaTest("Should be on the notification activity page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
			// Assertions
			Then.onTheObjectActivityPage.theTitleShouldDisplayTheName("Dringende Reparatur durchführen", "MaintNotificationActivity11").
				and.iTeardownMyAppFrame();
		});
	}
);