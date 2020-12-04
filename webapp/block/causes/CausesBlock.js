sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evosuite.evonotify.block.causes.CausesBlock", {
		metadata: {
			events: {
				"itemPress": {}
			},
			views: {
				Collapsed: {
					viewName: "com.evorait.evosuite.evonotify.block.causes.CausesBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evosuite.evonotify.block.causes.CausesBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);