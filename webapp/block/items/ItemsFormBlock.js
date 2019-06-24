sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evolite.evonotify.block.items.ItemsFormBlock", {
		metadata: {
			events: {
				"editPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evolite.evonotify.block.items.ItemsFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evolite.evonotify.block.items.ItemsFormBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);