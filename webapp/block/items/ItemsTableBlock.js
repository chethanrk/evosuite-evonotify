sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.items.ItemsTableBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.items.ItemsTableBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.items.ItemsTableBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);