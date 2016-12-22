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