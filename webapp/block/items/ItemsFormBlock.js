sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evosuite.evonotify.block.items.ItemsFormBlock", {
		metadata: {
			events: {},
			views: {
				Collapsed: {
					viewName: "com.evorait.evosuite.evonotify.block.items.ItemsFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evosuite.evonotify.block.items.ItemsFormBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);