sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	return BlockBase.extend("com.evorait.evosuite.evonotify.block.details.DetailsFormBlock", {
		metadata: {
			events: {
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evosuite.evonotify.block.details.DetailsFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evosuite.evonotify.block.details.DetailsFormBlock",
					type: "XML"
				}
			}
		}
	});
}, true);