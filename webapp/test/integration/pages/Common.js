sap.ui.define([
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
 
		function getFrameUrl(sHash, sUrlParameters) {
			sHash = sHash || "";
			var sUrl = jQuery.sap.getResourcePath("com/evorait/evolite/evonotify/app", ".html");
 
			if (sUrlParameters) {
				sUrlParameters = "?" + sUrlParameters;
			}
 
			return sUrl + sUrlParameters + "#" + sHash;
		}
 
		return Opa5.extend("com.evorait.evolite.evonotify.test.integration.pages.Common", {
 
			constructor: function (oConfig) {
				Opa5.apply(this, arguments);
 
				this._oConfig = oConfig;
			},
 
			iStartMyApp: function (oOptions) {
				var sUrlParameters;
				oOptions = oOptions || { delay: 0 };
 
				sUrlParameters = "serverDelay=" + oOptions.delay;
 
				this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, sUrlParameters));
			},
 
			iLookAtTheScreen: function () {
				return this;
			},
			
			iPressOnTheBlockTableWithTheID: function (sBlockNamespace, sBlockName, sPath, oPathProperties) {
				var aIds = [];
				for(var key in oPathProperties){
					aIds.push(key+"='"+oPathProperties[key]+"'");
				}
				var sIds = aIds.join(",");
				return this.waitFor({
					controlType: "sap.m.ColumnListItem",
					viewName: sBlockName,
					viewNamespace : "com.evorait.evolite.evonotify.block."+sBlockNamespace,
					matchers:  new BindingPath({
						path: "/"+sPath+"("+sIds+")"
					}),
					actions: new Press(),
					errorMessage: "No list item with path "+sPath+" and ids "+sIds+" was found."
				});
			},
			
			iPressOnTheBlockTableWithTheTitle: function (sBlockNamespace, sBlockName, sTitle) {
				return this.waitFor({
					controlType: "sap.m.ObjectIdentifier",
					viewName: sBlockName,
					viewNamespace : "com.evorait.evolite.evonotify.block."+sBlockNamespace,
					matchers: new Properties({
						title: sTitle
					}),
					actions: new Press(),
					errorMessage: "No list item with title "+sTitle+" was found."
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
 
		});
	});