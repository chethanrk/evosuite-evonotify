sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evonotify.block.tasks.TasksFormBlock", {
		metadata: {
			events: {
				"editPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evonotify.block.tasks.TasksFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evonotify.block.tasks.TasksFormBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);