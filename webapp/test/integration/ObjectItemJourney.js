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
				.and.iShouldSeeTheBlock("taskTableBlock")
				.and.theBlockTableShouldHaveAllEntries("block.tasks.", "TasksTableBlock", "notificationTaskTable", 1)
				.and.iShouldSeeTheBlock("activityTableBlock")
				.and.theBlockTableShouldHaveAllEntries("block.activities.", "ActivitiesTableBlock", "notificationActivityTable", 2);
		});
		
		opaTest("Should go to the add new notification item form page", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheAddItemButton();
 
			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});
		
		opaTest("Should go back to the TablePage", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheBackButton();
 
			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});
 
		opaTest("Should be on the post page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
 
			// Assertions
			Then.onTheObjectPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1").
				and.iTeardownMyAppFrame();
		});
	}
);