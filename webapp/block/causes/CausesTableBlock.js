sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.causes.CausesTableBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.causes.CausesTableBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.causes.CausesTableBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);