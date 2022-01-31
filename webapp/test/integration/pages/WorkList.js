sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Properties",
	"com/evorait/evosuite/evonotify/test/integration/pages/Common"
], function (Opa5, AggregationLengthEquals, PropertyStrictEquals, EnterText, Press, BindingPath, Properties, Common) {
	"use strict";

	var sViewName = "Worklist";
	var sTableId = "idPageNotificationListPageSmartTableTable";
	var sFilterBarId = "idPageNotificationListSmartFilterBar";
	var sPageId = "idPageNotificationList";
	var entitySet = "PMNotificationSet";

	function createIdFor(sFilterName, sEntityPropertyName) {
		return "__xmlview0--" + sFilterBarId + "-filterItemControl_BASIC-" + sEntityPropertyName;
	}

	var oDataModel, oUserModel, oViewModel;

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
				iGetFirstItemDataInTable: function (sProperty) {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						success: function (oTable) {
							var aItems = oTable.getItems();
							var oContext = aItems[0].getBindingContext(),
								oItemData = oContext.getObject(),
								sFilteredItemData = oItemData[sProperty] ? oItemData[sProperty] : oItemData;
						},
						errorMessage: "Table not found."
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
						viewName: sViewName,
						controlType: "sap.m.ColumnListItem",
						matchers: new BindingPath({
							path: "/" + entitySet + "('0000" + sId + "')"
						}),
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				},

				iPressOnTheButtonWithTheID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.Button",
						id: sId,
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				},

				iPressDialogButtonWithID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.Button",
						searchOpenDialogs: true,
						id: sId,
						check: function (oButton) {
							if (oButton) return true;
							return false;
						},
						success: function (oButton) {
							oButton.firePress();
						},
						errorMessage: "Cannot click dialog button"
					});
				},

				setModelParameters: function (aParams) {
					return this.waitFor({
						id: "idBtnCreateNotification",
						viewName: sViewName,
						success: function (oView) {
							oDataModel = oView.getModel();
							oUserModel = oView.getModel("user");
							oViewModel = oView.getModel("viewModel");
							aParams.forEach(function (mParam) {
								if (mParam.model === "user") {
									oUserModel.setProperty("/" + mParam.property, mParam.value);
								}
							});
						},
						errorMessage: "Property setting was not possible"
					});
				},
				iPressDialogCloseButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: sViewName,
						i18NText: {
							propertyName: "text",
							key: "btn.close"
						},
						actions: new Press(),
						searchOpenDialogs: true,
						errorMessage: "Did not find the Dialog close button"
					});
				},

				iPressOnMessageManager: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Properties({
							icon: "sap-icon://alert",
							type: "Emphasized",
							text: new RegExp(/\d+/)
						}),
						actions: new Press(),
						errorMessage: "Can't find Message Manager"
					});
				},

				iPressPopoverCloseButton: function () {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new Properties({
							icon: "sap-icon://decline"
						}),
						actions: new Press(),
						errorMessage: "Did not find the Popover close button"
					});
				},
			},

			assertions: {

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
				},

				iShouldSeeButton: function (sId, bVisible) {
					return this.waitFor({
						check: function () {
							var ctrl = Opa5.getJQuery()("[id$='" + sId + "']");
							return !ctrl.attr('aria-hidden') === bVisible;
						},
						success: function () {
							Opa5.assert.ok(true, "The control is visible: " + bVisible + ".");
						},
						errorMessage: "Hide/Display Control was not happen."
					});
				},
			}
		}
	});
});