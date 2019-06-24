sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'com/evorait/evolite/evonotify/test/integration/pages/Common',
		'sap/ui/test/matchers/BindingPath',
		'sap/ui/test/actions/Press',
		'sap/ui/test/matchers/Properties'
	],
	function (Opa5, AggregationLengthEquals, PropertyStrictEquals, Common, BindingPath, Press, Properties) {
		"use strict";
 
		var sViewName = "ObjectTask";
 
		Opa5.createPageObjects({
			onTheObjectTaskPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton: function () {
						return this.waitFor({
							id: "objectTaskPage",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the nav back button on object task page"
						});
					}
				},
				assertions: {
					theTitleShouldDisplayTheName: function(sName, sSubName){
						return this.waitFor({
							success: function () {
								return this.waitFor({
									id: "objectTaskPageHeader",
									viewName: sViewName,
									matchers: new Properties({
										objectTitle: sName,
										objectSubtitle: sSubName
									}),
									success: function () {
										Opa5.assert.ok(true, "was on the remembered task page");
									},
									errorMessage: "The task "+sName+" ("+sSubName+") is not shown"
								});
							}
						});
					},
					iShouldSeeTheBlock: function (sBlockId) {
						return this.waitFor({
							id: sBlockId,
							viewName: sViewName,
							success: function () {
								Opa5.assert.ok(true, "The block '"+sBlockId+"' is visible");
							},
							errorMessage: "Was not able to see the block "+sBlockId
						});
					},
					iShouldSeeTheForm: function (isEditable) {
						return this.waitFor({
							id: "SmartNotificationTaskForm",
							viewName: "TasksFormBlock",
							viewNamespace : "com.evorait.evolite.evonotify.block.tasks.",
							matchers: new Properties({
								editable: isEditable
							}),
							success: function () {
								Opa5.assert.ok(true, "The smartform is visible and editable: "+isEditable);
							},
							errorMessage: "Was not able to see the smartform."
						});
					}
				}
			}
		});
 
	});