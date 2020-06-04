sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.tasks.TasksItemBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.tasks.TasksItemBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.tasks.TasksItemBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);