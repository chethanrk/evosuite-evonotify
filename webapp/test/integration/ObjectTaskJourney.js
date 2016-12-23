sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotificationTask");
 
		opaTest("Should go to TaskPage when a user clicks on an entry in ObjectPage tasks table", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			//go to object page
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");
			
			//go to task page
			When.onTheObjectPage.iPressOnTheBlockTableWithTheTitle("tasks.", "TasksTableBlock", "MaintenanceNotificationTask1");
 
			// Assertions
			Then.onTheObjectTaskPage.theTitleShouldDisplayTheName("Betriebsingenieur benachrichtigen", "MaintenanceNotificationTask1")
				.and.iShouldSeeTheBlock("tasksFormBlock")
				.and.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go back to the ObjectPage", function (Given, When, Then) {
			// Actions
			When.onTheObjectTaskPage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectPage.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go to TaskPage when user clicks on an entry in items table and from ItemPage click on tasks table entry", function(Given, When, Then){
			//go to item page
			var oPathProperties = {
				MaintenanceNotification: "Maintenancenotification1",
				MaintenanceNotificationItem: "MaintenanceNotificationItem1"
			};
			When.onTheObjectPage.iPressOnTheBlockTableWithTheID("items.", "ItemsTableBlock", "PMNotificationItems", oPathProperties);
			
			//go to item task page
			When.onTheObjectItemPage.iPressOnTheBlockTableWithTheTitle("tasks.", "TasksTableBlock", "MaintenanceNotificationTask1");
 
			// Assertions
			Then.onTheObjectTaskPage.theTitleShouldDisplayTheName("Betriebsingenieur benachrichtigen", "MaintenanceNotificationTask1")
				.and.iShouldSeeTheBlock("tasksFormBlock")
				.and.iShouldSeeTheForm(false);
		});
		
		opaTest("Should go back to the ItemPage", function (Given, When, Then) {
			// Actions
			When.onTheObjectTaskPage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectItemPage.iShouldSeeTheForm(false);
		});
 
		opaTest("Should be on the notification tasks page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
			// Assertions
			Then.onTheObjectTaskPage.theTitleShouldDisplayTheName("Betriebsingenieur benachrichtigen", "MaintenanceNotificationTask1").
				and.iTeardownMyAppFrame();
		});
	}
);