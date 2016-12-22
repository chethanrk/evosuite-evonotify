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
 
		var sViewName = "Object";
 
		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton: function () {
						return this.waitFor({
							id: "objectPage",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the nav button on object page"
						});
					},
					iPressTheAddItemButton: function() {
						return this.waitFor({
							id: "addNotificationItemButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the add notification item button on object page"
						});
					},
					iPressOnTheBlockTableWithTheID: function (sBlockNamespace, sBlockName, sId, sPath) {
						return this.waitFor({
							controlType: "sap.m.ColumnListItem",
							viewName: sBlockName,
							viewNamespace : "com.evorait.evolite.evonotify.block."+sBlockNamespace,
							matchers:  new BindingPath({
								path: "/"+sPath+"('" + sId + "')"
							}),
							actions: new Press(),
							errorMessage: "No list item with the id " + sId + " was found."
						});
					}
				},
				assertions: {
					theTitleShouldDisplayTheName: function (sName, sSubName) {
						return this.waitFor({
							success: function () {
								return this.waitFor({
									id: "objectPageHeader",
									viewName: sViewName,
									matchers: new Properties({
										objectTitle: sName,
										objectSubtitle: sSubName
									}),
									success: function () {
										Opa5.assert.ok(true, "was on the remembered detail page");
									},
									errorMessage: "The Notification "+sName+" ("+sSubName+") is not shown"
								});
							}
						});
					},
					iShouldSeeTheButton: function(sButtonId, isVisible){
						return this.waitFor({
							id: sButtonId,
							viewName: sViewName,
							matchers: new Properties({
								visible: isVisible
							}),
							success: function () {
								Opa5.assert.ok(true, "The edit button '"+sButtonId+"' visibility should be "+isVisible);
							},
							errorMessage: "Was not able to see the '"+sButtonId+"' button"
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
					theBlockTableShouldHaveAllEntries: function (sBlockNamespace, sBlockName, sTableId, nLength) {
						return this.waitFor({
							id: sTableId,
							viewName: sBlockName,
							viewNamespace : "com.evorait.evolite.evonotify.block."+sBlockNamespace,
							matchers:  new AggregationLengthEquals({
								name: "items",
								length: nLength
							}),
							success: function () {
								Opa5.assert.ok(true, "The table '"+sTableId+"' has "+nLength+" items");
							},
							errorMessage: "Table '"+sTableId+"' does not have all entries."
						});
					}
				}
			}
		});
	});