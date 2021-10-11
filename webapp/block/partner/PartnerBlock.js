sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("com.evorait.evosuite.evonotify.block.partner.PartnerBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.evorait.evosuite.evonotify.block.partner.PartnerBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.evorait.evosuite.evonotify.block.partner.PartnerBlock",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);