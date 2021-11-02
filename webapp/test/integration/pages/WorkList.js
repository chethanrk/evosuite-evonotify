sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"com/evorait/evosuite/evonotify/test/integration/pages/Common"
], function (Opa5, AggregationLengthEquals, PropertyStrictEquals, EnterText, Press, BindingPath, Common) {
	"use strict";

	var sViewName = "Worklist";
	var sTableId = "responsiveNotificationTable";
	var sFilterBarId = "NotificationFilter";
	var sPageId = "NotificationlistPage";
	var entitySet = "PMNotificationSet";

	function createIdFor(sFilterName, sEntityPropertyName) {
		return "__component0---worklist--" + sFilterBarId + "-filterItemControl___INTERNAL_-" + sEntityPropertyName;
	}

	Opa5.createPageObjects({
		onTheWorkListPage: {
			baseClass: Common,

			actions: {

				iPressOnMoreData: function () {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "The Table does not have a trigger"
					});
				},
				iSetTestForFilterProperty: function (sProperty, sValue) {
					return this.waitFor({
						id: createIdFor(sFilterBarId, sProperty),
						viewName: sViewName,
						actions: new EnterText({
							text: sValue
						})
					});
				},
				iStartSearch: function () {
					return this.waitFor({
						id: sFilterBarId,
						viewName: sViewName,
						actions: new Press()
					});
				},

				iPressOnTheItemWithTheID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: new BindingPath({
							path: "/" + entitySet + "('" + sId + "')"
						}),
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				},

				iPressOnTheButtonWithTheID: function (sId, isToggle) {
					var sControlType = "sap.m.Button";
					if (isToggle) {
						sControlType = "sap.m.ToggleButton";
					}
					return this.waitFor({
						controlType: sControlType,
						id: sId,
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				}
			},

			assertions: {
				iShouldSeePageTitle: function () {
					return this.waitFor({
						id: sPageId,
						viewName: sViewName,
						autoWait: true,
						matchers: function (oView) {
							var title = oView.getModel("i18n").getResourceBundle().getText("appTitle");
							return new PropertyStrictEquals({
								name: "title",
								value: title
							}).isMatching(oView);
						},
						success: function () {
							Opa5.assert.ok(true, "I can see page title");
						},
						errorMessage: "Can't find page title"
					});
				},

				iShouldSeeTable: function () {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						autoWait: true,
						success: function () {
							Opa5.assert.ok(true, "Can see worklist equipment table");
						},
						errorMessage: "Can't find Work List table"
					});
				},

				iShouldSeeFilterBar: function () {
					return this.waitFor({
						id: sFilterBarId,
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "Can see Filter bar for equipment table");
						},
						errorMessage: "Can't find Filter bar for WorkList table"
					});
				},

				iShouldSeeAllTheRecords: function () {
					var aAllEntities,
						iExpectedNumberOfItems,
						iTableBindingLength;

					// retrieve all Products to be able to check for the total amount
					this.waitFor(this.createAWaitForAnEntitySet({
						entitySet: "PMNotificationSet",
						success: function (aEntityData) {
							aAllEntities = aEntityData;
						}
					}));

					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: function (oTable) {
							// If there are less items in the list than the growingThreshold, only check for this number.
							iExpectedNumberOfItems = aAllEntities.length;
							iTableBindingLength = oTable.getItems().length;
							return true;
						},
						success: function () {
							Opa5.assert.strictEqual(iTableBindingLength, iExpectedNumberOfItems, "WorkList table has expected number of records" +
								iTableBindingLength);
						},
						errorMessage: "Table does not have all entries."
					});

				},

				iShouldSeeFilteredRecord: function () {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: new AggregationLengthEquals({
							name: "items",
							length: 1
						}),
						success: function () {
							Opa5.assert.ok(true, "The table has filtered record");
						},
						errorMessage: "Table does not have filtered record."
					});
				}

			}

		}

	});
});