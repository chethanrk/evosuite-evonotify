sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/I18NText",
	"com/evorait/evosuite/evonotify/test/integration/pages/Common"
], function (Opa5, AggregationLengthEquals, PropertyStrictEquals, EnterText, Press, BindingPath, Properties, I18NText, Common) {
	"use strict";

	var sViewName = "NotificationDetail",
		namespace = "com.evorait.evosuite.evonotify.view.templates";

	var oDataModel, oUserModel, oViewModel;

	Opa5.createPageObjects({
		onTheNotificationDetailsPage: {
			baseClass: Common,
			actions: {
				iPressOnTheItemWithTheID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewName: sViewName,
						viewNamespace: namespace,
						matchers: new BindingPath({
							path: "/PMNotificationSet('" + sId + "')"
						}),
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				},
				iPressOnTheButtonWithTheID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.Button",
						id: sId,
						viewNamespace: namespace,
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
						viewNamespace: namespace,
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

				setModelParameters: function (aParams, sId) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						viewNamespace: namespace,
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

			},
			assertions: {
				iShouldSeeNotificationTitle: function () {
					return this.waitFor({
						controlType: "sap.m.Title",
						matchers: new Properties({
							text: ""
						}),
						success: function () {
							Opa5.assert.ok(true, "I can see page title");
						},
						errorMessage: "Can't find Object page title"
					});
				},
				iShouldSeePageTitle: function (sTitle) {
					return this.waitFor({
						id: "idPageNotificationDetailObjectPageHeader",
						viewName: sViewName,
						viewNamespace: namespace,
						matchers: function (oView) {
							return new PropertyStrictEquals({
								name: "objectTitle",
								value: sTitle
							}).isMatching(oView);
						},
						success: function (oPage) {
							Opa5.assert.ok(true, "Notification Detail Page");
						},
						errorMessage: "Can't find notification detail page title"
					});
				},

				iShouldSeePageSubTitle: function (sSubTitle) {
					return this.waitFor({
						id: "idPageNotificationDetailObjectPageHeader",
						viewName: sViewName,
						viewNamespace: namespace,
						matchers: function (oView) {
							return new PropertyStrictEquals({
								name: "objectSubtitle",
								value: sSubTitle
							}).isMatching(oView);
						},
						success: function (oPage) {
							Opa5.assert.ok(true, "Notification Detail Page");
						},
						errorMessage: "Can't find notification detail page subtitle"
					});
				},

				iShouldSeeDetailsBlock: function () {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: namespace,
						controlType: "sap.ui.comp.smartform.SmartForm",
						success: function () {
							Opa5.assert.ok(true, "Can see the details block");
						},
						errorMessage: "Can't find details block"
					});
				},

				iShouldSeeItemsBlock: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						viewName: "ItemsBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.items",
						i18NText: {
							propertyName: "header",
							key: "tit.items"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see items table");
						},
						errorMessage: "Can't find items table"
					});
				},

				iShouldSeeTasksBlock: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						viewName: "TasksBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.tasks",
						i18NText: {
							propertyName: "header",
							key: "tit.items"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see tasks table");
						},
						errorMessage: "Can't find tasks table"
					});
				},

				iShouldSeeActivitiesBlock: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						viewName: "ActivitiesBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.activities",
						i18NText: {
							propertyName: "header",
							key: "tit.items"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see activities table");
						},
						errorMessage: "Can't find activities table"
					});
				},

				iShouldSeePartnerBlock: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						viewName: "PartnerBlock",
						viewNamespace: "com.evorait.evosuite.evonotify.block.partner",
						i18NText: {
							propertyName: "header",
							key: "tit.items"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see Partner table");
						},
						errorMessage: "Can't find Partner table"
					});
				},

				iShouldSeeNotiAttachmentsTable: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						properties: {
							persistencyKey: "com.evorait.evosuite.evonotify.table.NotifAttachments"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see Notification Attachments table");
						},
						errorMessage: "Can't find Notification Attachments table"
					});
				},

				iShouldSeeOrderAttachmentsTable: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						properties: {
							persistencyKey: "com.evorait.evosuite.evonotify.table.NotifAttachments"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see Order Attachments table");
						},
						errorMessage: "Can't find Order Attachments table"
					});
				},

				iShouldSeeEquiAttachmentsTable: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						properties: {
							persistencyKey: "com.evorait.evosuite.evonotify.table.EquiAttachments"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see Equipments Attachments table");
						},
						errorMessage: "Can't find Equipments Attachments table"
					});
				},

				iShouldSeeFlocAttachmentsTable: function () {
					return this.waitFor({
						controlType: "sap.ui.comp.smarttable.SmartTable",
						properties: {
							persistencyKey: "com.evorait.evosuite.evonotify.table.FlocAttachments"
						},
						success: function () {
							Opa5.assert.ok(true, "Can see Functional Location Attachments table");
						},
						errorMessage: "Can't find Functional Location Attachments table"
					});
				},

				iShouldSeeTheHeaderTitleAs: function (sText) {
					return this.waitFor({
						id: "idPageNotificationDetailObjectPageHeader",
						viewName: sViewName,
						viewNamespace: "com.evorait.evosuite.evonotify.view.templates",
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
						id: "idPageNotificationDetailObjectPageHeader",
						viewName: sViewName,
						viewNamespace: "com.evorait.evosuite.evonotify.view.templates",
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

				iShouldSeeNotificationField: function () {
					return this.waitFor({
						id: "idNotification",
						viewName: sViewName,
						viewNamespace: "com.evorait.evosuite.evonotify.view.templates",
						success: function () {
							Opa5.assert.ok(true, "Can see Notification field");
						},
						errorMessage: "Can't find Notification field"
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