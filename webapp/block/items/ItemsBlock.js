sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.items.ItemsBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.items.ItemsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.items.ItemsBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);