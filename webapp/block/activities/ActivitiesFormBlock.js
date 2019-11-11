sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.activities.ActivitiesFormBlock", {
		metadata: {
			events: {
				"editPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.activities.ActivitiesFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.activities.ActivitiesFormBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);