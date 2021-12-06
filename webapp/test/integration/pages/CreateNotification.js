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

	var sViewName = "CreateNotification",
		viewNamespace = "com.evorait.evosuite.evonotify.view.templates.";

	Opa5.createPageObjects({
		onTheCreateNotificationPage: {
			baseClass: Common,

			actions: {
				iPressOnTheButtonWithTheID: function (sId) {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: sViewName,
						viewNamespace: viewNamespace,
						id: sId,
						actions: new Press(),
						errorMessage: "No list item with the ID " + sId + " was found."
					});
				},

				iPressDialogButtonWithID: function (sId) {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: viewNamespace,
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
				iShouldSeePageTitle: function () {
					return this.waitFor({
						id: "idObjectPageTitle",
						viewName: sViewName,
						viewNamespace: viewNamespace,
						matchers: function (oView) {
							var title = oView.getModel("i18n").getResourceBundle().getText("tit.newNotification");
							return new PropertyStrictEquals({
								name: "objectTitle",
								value: title
							}).isMatching(oView);
						},
						success: function (oPage) {
							Opa5.assert.ok(true, "Navigated to create navigation page");
						},
						errorMessage: "Can't find create notification page title"
					});
				},

				iShouldSeeInputFieldWithValue: function (sProperty, sValue) {
					return this.waitFor({
						controlType: "sap.m.Input",
						viewName: sViewName,
						viewNamespace: viewNamespace,
						matchers: new Properties({
							name: "id" + sProperty,
							value: sValue
						}),
						success: function () {
							Opa5.assert.ok(true, "The Input control with name id" + sProperty + " has value '" + sValue + "'.");
						},
						errorMessage: "Input field does not have value."
					});
				},

				iShouldSeeRequiredFieldsHiglighted: function (bHighlighted) {
					return this.waitFor({
						controlType: "sap.ui.comp.smartfield.SmartField",
						viewName: sViewName,
						viewNamespace: viewNamespace,
						matchers: new Properties({
							mandatory: true,
							value: ""
						}),
						success: function (aInputs) {
							var bValid = true;
							aInputs.forEach(function (oItem) {
								if (bHighlighted && oItem.getValueState() !== sap.ui.core.ValueState.Error) {
									bValid = false;
								}
							});
							Opa5.assert.ok(bValid, "All Input controls who are mandatory are highligted: " + bHighlighted);
						},
						errorMessage: "Input field does not have value."
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