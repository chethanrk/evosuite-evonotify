sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotification");
 
		opaTest("Should see the notification page when a user clicks on an entry of the list", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			When.onTheWorklistPage.iPressOnTheItemWithTheID("Maintenancenotification1");
 
			// Assertions
			Then.onTheObjectPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1")
				.and.iShouldSeeTheActionButtonLength(1)
				.and.iShouldSeeTheActionButton("editNotificationButton")
				.and.iShouldSeeTheBlock("detailsFormBlock")
				.and.iShouldSeeTheForm(false)
				.and.iShouldSeeTheBlock("itemsTableBlock")
				.and.theBlockTableShouldHaveAllEntries("items.", "ItemsTableBlock", "notificationItemsTable", 1)
				.and.iShouldSeeTheBlock("taskTableBlock")
				.and.theBlockTableShouldHaveAllEntries("tasks.", "TasksTableBlock", "notificationTaskTable", 1)
				.and.iShouldSeeTheBlock("activityTableBlock")
				.and.theBlockTableShouldHaveAllEntries("activities.", "ActivitiesTableBlock", "notificationActivityTable", 2);
		});
		
		opaTest("Should show editable form view for the notification details", function(Given, When, Then){
			// Actions
			When.onTheObjectPage.iPressTheEditButton();
			//Assertations
			Then.onTheObjectPage.iShouldSeeTheForm(true)
				.and.iShouldSeeTheActionButtonLength(2)
				.and.iShouldSeeTheActionButton("cancelNotificationButton")
				.and.iShouldSeeTheActionButton("saveNotificationButton");
		});
		
		opaTest("Should cancel the form and toggle editable view for the notification details", function(Given, When, Then){
			// Actions
			When.onTheObjectPage.iPressTheCancelButton();
			//Assertations
			Then.onTheObjectPage.iShouldSeeTheForm(false)
				.and.iShouldSeeTheActionButtonLength(1)
				.and.iShouldSeeTheActionButton("editNotificationButton");
		});
		
		opaTest("Should go to the add new notification item form page", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheAddItemButton();
			// Assertions
			Then.onTheObjectItemPage.theTitleshouldDisplayNewItem()
				.and.iShouldSeeTheForm(true);
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