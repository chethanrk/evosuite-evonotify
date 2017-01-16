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
					iPressTheEditButton: function(){
						return this.waitFor({
							id: "editNotificationButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the edit notification button on object page"
						});
					},
					iPressTheCancelButton: function(){
						return this.waitFor({
							id: "cancelNotificationButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the cancel notification button on object page"
						});
					},
					iPressTheSaveButton: function(){
						return this.waitFor({
							id: "saveNotificationButton",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the save notification button on object page"
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
					theTitleshouldDisplayNewItem: function(){
						return this.waitFor({
							success: function () {
								return this.waitFor({
									id: "objectPageHeader",
									viewName: sViewName,
									matchers: function (oPage) {
										var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("newNotificationTitle");
										return new PropertyStrictEquals({
											name: "objectTitle",
											value: sExpectedText
										}).isMatching(oPage);
									},
									success: function () {
										Opa5.assert.ok(true, "was on the remembered add new Notification page");
									},
									errorMessage: "The new Notification Title is not shown"
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
							id: "SmartNotificationForm",
							viewName: "DetailsFormBlock",
							viewNamespace : "com.evorait.evolite.evonotify.block.details.",
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