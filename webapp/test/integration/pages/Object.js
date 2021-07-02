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

	var sPageId = "idObjectPage",
		sViewName = "Object";

	Opa5.createPageObjects({
		onTheObjectPage: {
			baseClass: Common,

			actions: {

				iPressOnTheItemWithTheID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewName: sViewName,
						matchers: new BindingPath({
							path: "/PMNotificationItemSet('94')"
						}),
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				}
			},

			assertions: {

				iShouldSeePageTitle: function (sTitle) {
					return this.waitFor({
						id: "ObjectPageLayout",
						viewName: sViewName,
						success: function (oPage) {
							strictEqual(oPage.getObjectTitle(), sTitle);
						},
						errorMessage: "Can't find Object page title"
					});
				},

				iShouldSeeGeneralBlock: function () {
					return this.waitFor({
						id: "idDetailsBlock",
						viewName: "DetailsFormBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.details",
						success: function () {
							Opa5.assert.ok(true, "Can see details block");
						},
						errorMessage: "Can't find details block"
					});
				},

				iShouldSeeItemsBlock  : function () {
					return this.waitFor({
						id: "notificationItemsTable",
						viewName: "ItemsTableBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.items",
						success: function () {
							Opa5.assert.ok(true, "Can see items block");
						},
						errorMessage: "Can't find items block"
					});
				},

				iShouldSeeTasksBlock: function () {
					return this.waitFor({
						id: "notificationTasksTable",
						viewName: "TasksTableBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.tasks",
						success: function () {
							Opa5.assert.ok(true, "Can see tasks table");
						},
						errorMessage: "Can't find tasks table"
					});
				},

				iShouldSeeActivitiesTable: function () {
					return this.waitFor({
						id: "notificationActivityTable",
						viewName: "ActivitiesTableBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.activities",
						success: function () {
							Opa5.assert.ok(true, "Can see activities table");
						},
						errorMessage: "Can't find activities table"
					});
				},

				iShouldSeeTheHeaderTitleAs: function (sText) {
					return this.waitFor({
						id: "objectPageHeader",
						viewName: sViewName,
						matchers: new PropertyStrictEquals({
							name: "objectTitle",
							value: sText
						}),
						success: function () {
							Opa5.assert.ok(true, "Found Object header title " + sText);
						},
						errorMessage: "Can't find object header title"
					});
				},

				iShouldSeeTheHeaderSubTitleAs: function (sText) {
					return this.waitFor({
						id: "objectPageHeader",
						viewName: sViewName,
						matchers: new PropertyStrictEquals({
							name: "objectSubtitle",
							value: sText
						}),
						success: function () {
							Opa5.assert.ok(true, "Found Object sub header title " + sText);
						},
						errorMessage: "Can't find object sub header title"
					});
				},

				iShouldSeeNotificationTypeField: function () {
					return this.waitFor({
						id: "idNotificationType",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "Can see Notification Type field");
						},
						errorMessage: "Can't find Notification Type field"
					});
				},

				iShouldSeeEquipmentField: function () {
					return this.waitFor({
						id: "idEquipment",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "Can see Equipment field");
						},
						errorMessage: "Can't find Equipment field"
					});
				},

				iShouldSeeFuncLocField: function () {
					return this.waitFor({
						id: "idFunctionalLocation",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "Can see Functional Location field");
						},
						errorMessage: "Can't find Functional Location  field"
					});
				}
			}

		}

	});

});