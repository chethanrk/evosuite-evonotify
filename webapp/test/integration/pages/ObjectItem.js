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
 
		var sViewName = "ObjectItem";
 
		Opa5.createPageObjects({
			onTheObjectItemPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton: function () {
						return this.waitFor({
							id: "objectItemPage",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the nav back button on object item page"
						});
					},
					iPressTheEditButton: function(){
						return this.waitFor({
							id: "editNotificationItemButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the edit item button on object page"
						});
					},
					iPressTheCancelButton: function(){
						return this.waitFor({
							id: "cancelNotificationItemButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the cancel item button on object page"
						});
					},
					iPressTheSaveButton: function(){
						return this.waitFor({
							id: "saveNotificationItemButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the save item button on object page"
						});
					}
				},
				assertions: {
					theTitleShouldDisplayTheName: function(sName, sSubName){
						return this.waitFor({
							success: function () {
								return this.waitFor({
									id: "objectItemPageHeader",
									viewName: sViewName,
									matchers: new Properties({
										objectTitle: sName,
										objectSubtitle: sSubName
									}),
									success: function () {
										Opa5.assert.ok(true, "was on the remembered detail page");
									},
									errorMessage: "The Notification Item "+sName+" ("+sSubName+") is not shown"
								});
							}
						});
					},
					theTitleshouldDisplayNewItem: function(){
						return this.waitFor({
							success: function () {
								return this.waitFor({
									id: "objectItemPageHeader",
									viewName: sViewName,
									matchers: function (oPage) {
										var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("newNotificationItemTitle");
										return new PropertyStrictEquals({
											name: "objectTitle",
											value: sExpectedText
										}).isMatching(oPage);
									},
									success: function () {
										Opa5.assert.ok(true, "was on the remembered add new Item page");
									},
									errorMessage: "The new Notification Item Title is not shown"
								});
							}
						});
					},
					iShouldSeeTheActionButtonLength: function(n){
						return this.waitFor({
							controlType : "sap.uxap.ObjectPageHeaderActionButton",
							viewName: sViewName,
							check : function (aButtons) {
		                        return aButtons.length === n;
		                    },
							success : function () {
								Opa5.assert.ok(true, "There are visible "+n+" Actionbuttons");
					        },
							errorMessage: "Was not able to see the '"+n+"' Actionbuttons"
						});
					},
					iShouldSeeTheActionButton: function(sButtonId){
						return this.waitFor({
							id: sButtonId,
							viewName: sViewName,
							matchers: new Properties({
								visible: true
							}),
							success: function () {
								Opa5.assert.ok(true, "The Actionbutton '"+sButtonId+"' should be visible");
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
					iShouldSeeTheForm: function (isEditable) {
						return this.waitFor({
							id: "SmartNotificationItemForm",
							viewName: "ItemsFormBlock",
							viewNamespace : "com.evorait.evolite.evonotify.block.items.",
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