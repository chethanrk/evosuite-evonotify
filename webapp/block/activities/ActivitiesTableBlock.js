sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.activities.ActivitiesTableBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.activities.ActivitiesTableBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.activities.ActivitiesTableBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);