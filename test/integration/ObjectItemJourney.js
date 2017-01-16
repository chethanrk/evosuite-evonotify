sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotificationItem");
 
		opaTest("Should see the notification item page when a user clicks on an entry in items table", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");
			var oPathProperties = {
				MaintenanceNotification: "Maintenancenotification1",
				MaintenanceNotificationItem: "MaintenanceNotificationItem1"
			};
			When.onTheObjectPage.iPressOnTheBlockTableWithTheID("items.", "ItemsTableBlock", "PMNotificationItems", oPathProperties);
 
			// Assertions
			Then.onTheObjectItemPage.theTitleShouldDisplayTheName("Abnormes Geräusch", "MaintenanceNotificationItem1")
				.and.iShouldSeeTheActionButtonLength(1)
				.and.iShouldSeeTheActionButton("editNotificationItemButton")
				.and.iShouldSeeTheBlock("itemsFormBlock")
				.and.iShouldSeeTheForm(false)
				.and.iShouldSeeTheBlock("itemsCausesTableBlock")
				.and.theBlockTableShouldHaveAllEntries("causes.", "CausesTableBlock", "notificationCausesTable", 0)
				.and.iShouldSeeTheBlock("itemsTasksTableBlock")
				.and.theBlockTableShouldHaveAllEntries("tasks.", "TasksTableBlock", "notificationTaskTable", 1)
				.and.iShouldSeeTheBlock("itemsActivitiesTableBlock")
				.and.theBlockTableShouldHaveAllEntries("activities.", "ActivitiesTableBlock", "notificationActivityTable", 2);
		});
		
		opaTest("Should show editable form view for the item details", function(Given, When, Then){
			// Actions
			When.onTheObjectItemPage.iPressTheEditButton();
			//Assertations
			Then.onTheObjectItemPage.iShouldSeeTheForm(true)
				.and.iShouldSeeTheActionButtonLength(2)
				.and.iShouldSeeTheActionButton("cancelNotificationItemButton")
				.and.iShouldSeeTheActionButton("saveNotificationItemButton");
		});
		
		opaTest("Should cancel the form and toggle editable view for the item details", function(Given, When, Then){
			// Actions
			When.onTheObjectItemPage.iPressTheCancelButton();
			//Assertations
			Then.onTheObjectItemPage.iShouldSeeTheForm(false)
				.and.iShouldSeeTheActionButtonLength(1)
				.and.iShouldSeeTheActionButton("editNotificationItemButton");
		});
		
		opaTest("Should go back to the NotificationPage", function (Given, When, Then) {
			// Actions
			When.onTheObjectItemPage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectPage.iShouldSeeTheForm(false);
		});
 
		opaTest("Should be on the notification item page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
			// Assertions
			Then.onTheObjectItemPage.theTitleShouldDisplayTheName("Abnormes Geräusch", "MaintenanceNotificationItem1").
				and.iTeardownMyAppFrame();
		});
	}
);