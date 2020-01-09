sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.tasks.TasksItemTableBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.tasks.TasksItemTableBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.tasks.TasksItemTableBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);