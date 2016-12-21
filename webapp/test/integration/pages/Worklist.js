sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'com/evorait/evolite/evonotify/test/integration/pages/Common',
		'sap/ui/test/matchers/BindingPath',
		'sap/ui/test/actions/Press'
	],
	function (Opa5, AggregationLengthEquals, PropertyStrictEquals, Common, BindingPath, Press) {
		"use strict";
 
		var sViewName = "Worklist",
			sTableId = "responsiveNotificationTable";
 
		Opa5.createPageObjects({
			onTheWorklistPage: {
				baseClass: Common,
				actions: {
					iPressOnTheItemWithTheID: function (sId) {
						return this.waitFor({
							controlType: "sap.m.ColumnListItem",
							viewName: sViewName,
							matchers:  new BindingPath({
								path: "/PMNotifications('" + sId + "')"
							}),
							actions: new Press(),
							errorMessage: "No list item with the id " + sId + " was found."
						});
					}
				},
				assertions: {
					theTableShouldHaveAllEntries: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers:  new AggregationLengthEquals({
								name: "items",
								length: 10
							}),
							success: function () {
								Opa5.assert.ok(true, "The table has 10 items");
							},
							errorMessage: "Table does not have all entries."
						});
					},
 
					//__component0---worklist--NotificationTable-header
					theTitleShouldDisplayTheTotalAmountOfItems: function () {
						return this.waitFor({
							id: "NotificationTable",
							viewName: sViewName,
							matchers: function (oPage) {
								var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [10]);
								return new PropertyStrictEquals({
									name: "text",
									value: sExpectedText
								}).isMatching(oPage);
							},
							success: function () {
								Opa5.assert.ok(true, "The table header has 10 items");
							},
							errorMessage: "The Table's header does not container the number of items: 10"
						});
					},
					iShouldSeeTheTable: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							success: function () {
								Opa5.assert.ok(true, "The table is visible");
							},
							errorMessage: "Was not able to see the table."
						});
					}
				}
			}
		});
 
	});