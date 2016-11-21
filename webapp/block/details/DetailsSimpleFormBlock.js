sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evolite.evonotify.block.details.DetailsSimpleFormBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.evorait.evolite.evonotify.block.details.DetailsSimpleFormBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evolite.evonotify.block.details.DetailsSimpleFormBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);
