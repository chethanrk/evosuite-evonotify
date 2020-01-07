sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.tasks.TasksTableBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.tasks.TasksTableBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.tasks.TasksTableBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);