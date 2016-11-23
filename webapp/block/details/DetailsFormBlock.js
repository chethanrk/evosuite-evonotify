sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evolite.evonotify.block.details.DetailsFormBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evolite.evonotify.block.details.DetailsFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evolite.evonotify.block.details.DetailsFormBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);