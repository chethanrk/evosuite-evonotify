sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evosuite.evonotify.block.activities.ActivitiesItemBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evosuite.evonotify.block.activities.ActivitiesItemBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evosuite.evonotify.block.activities.ActivitiesItemBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);