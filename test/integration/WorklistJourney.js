sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";
 
		QUnit.module("PMNotifications");
 
		opaTest("Should see the table with all Notifications", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();
			//Actions
			When.onTheWorklistPage.iLookAtTheScreen();
			// Assertions
			Then.onTheWorklistPage.theTableShouldHaveAllEntries();
		});
		
		opaTest("Should go to the add new notification form page", function (Given, When, Then) {
			// Actions
			When.onTheWorklistPage.iPressTheAddItemButton();
			// Assertions
			Then.onTheObjectPage.theTitleshouldDisplayNewItem()
				.and.iShouldSeeTheForm(true);
		});
		
		opaTest("Should go back to the TablePage", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheBackButton();
			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable()
				.and.iTeardownMyAppFrame();
		});
		
		/*opaTest("Should be able to load more items", function (Given, When, Then) {
			//Actions
			When.onTheWorklistPage.iPressOnMoreData();
 
			// Assertions
			Then.onTheWorklistPage.theTableShouldHaveAllEntries().
				and.iTeardownMyAppFrame();
		});*/
 
	}
);