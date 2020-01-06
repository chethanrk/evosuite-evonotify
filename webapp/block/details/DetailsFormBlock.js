sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	return BlockBase.extend("com.evorait.evonotify.block.details.DetailsFormBlock", {
		metadata: {
			events: {
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.details.DetailsFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.details.DetailsFormBlock",
					type: "XML"
				}
			}
		}
	});
}, true);