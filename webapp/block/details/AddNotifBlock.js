sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	return BlockBase.extend("com.evorait.evonotify.block.details.AddNotifBlock", {
		metadata: {
			events: {
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.details.AddNotifBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.details.AddNotifBlock",
					type: "XML"
				}
			}
		}
	});
}, true);