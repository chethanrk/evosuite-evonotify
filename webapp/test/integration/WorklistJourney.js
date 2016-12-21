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
			Then.onTheWorklistPage.theTableShouldHaveAllEntries().
				//and.theTitleShouldDisplayTheTotalAmountOfItems().
				and.iTeardownMyAppFrame();
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