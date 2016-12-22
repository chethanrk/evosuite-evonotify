sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotification");
 
		opaTest("Should see the post page when a user clicks on an entry of the list", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");
 
			// Assertions
			Then.onTheObjectPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1")
				.and.iShouldSeeTheButton("editNotificationButton", true)
				.and.iShouldSeeTheBlock("detailsFormBlock")
				.and.iShouldSeeTheBlock("itemsTableBlock")
				.and.theBlockTableShouldHaveAllEntries("items.", "ItemsTableBlock", "notificationItemsTable", 1)
				.and.iShouldSeeTheBlock("taskTableBlock")
				.and.theBlockTableShouldHaveAllEntries("tasks.", "TasksTableBlock", "notificationTaskTable", 1)
				.and.iShouldSeeTheBlock("activityTableBlock")
				.and.theBlockTableShouldHaveAllEntries("activities.", "ActivitiesTableBlock", "notificationActivityTable", 2);
		});
		
		opaTest("Should go to the add new notification item form page", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheAddItemButton();
			// Assertions
			Then.onTheObjectItemPage.theTitleshouldDisplayNewItem()
				.and.iShouldSeeTheForm();
		});
		
		opaTest("Should go back to notification detail page", function (Given, When, Then) {
			// Actions
			When.onTheObjectItemPage.iPressTheBackButton();
			// Assertions
			Then.onTheObjectPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1");
		});
		
		opaTest("Should go back to the TablePage", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheBackButton();
			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});
 
		opaTest("Should be on the notification page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
			// Assertions
			Then.onTheObjectPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1").
				and.iTeardownMyAppFrame();
		});
	}
);