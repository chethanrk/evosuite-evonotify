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
			Then.onThePostPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1")
				.and.iShouldSeeTheButton("editNotificationButton", true)
				//.and.iShouldSeeTheButton("addNotificationItemButton", true)
				//.and.iShouldSeeTheButton("cancelNotificationButton", false)
				.and.iShouldSeeTheBlock("detailsFormBlock")
				.and.iShouldSeeTheBlock("itemsTableBlock")
				.and.iShouldSeeTheBlock("taskTableBlock")
				.and.iShouldSeeTheBlock("activityTableBlock");
				//and.theTableShouldHaveAllEntries("notificationTaskTable", 1);
		});
		
		opaTest("Should go back to the TablePage", function (Given, When, Then) {
			// Actions
			When.onThePostPage.iPressTheBackButton();
 
			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});
 
		opaTest("Should be on the post page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();
 
			// Assertions
			Then.onThePostPage.theTitleShouldDisplayTheName("Notificationtext 1", "Maintenancenotification1").
				and.iTeardownMyAppFrame();
		});
	}
);